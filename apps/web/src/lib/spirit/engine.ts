import * as THREE from 'three'
import { SpiritSimulator } from './simulator'
import { SpiritParticles } from './particles'
import {
  PRESETS,
  TRANSITION_DURATION_MS,
  AUTO_CYCLE,
  AUDIO,
  type SpiritPreset,
} from '../../data/spirit-presets'

// ─── AudioEngine ──────────────────────────────────────────────────────────────

class AudioEngine {
  private ctx: AudioContext | null = null
  private ambientGain: GainNode | null = null
  private sfxGain: GainNode | null = null
  private ambientSource: AudioBufferSourceNode | null = null
  private sfxBuffers = new Map<string, AudioBuffer>()
  private unlocked = false
  private _unlockFn: (() => void) | null = null
  private muted = false

  async init(): Promise<void> {
    this.ctx = new AudioContext()

    this.ambientGain = this.ctx.createGain()
    this.ambientGain.gain.value = AUDIO.ambientVolume
    this.ambientGain.connect(this.ctx.destination)

    this.sfxGain = this.ctx.createGain()
    this.sfxGain.gain.value = AUDIO.sfxVolume
    this.sfxGain.connect(this.ctx.destination)

    try {
      const res = await fetch(AUDIO.ambientLoop)
      const buf = await res.arrayBuffer()
      const decoded = await this.ctx.decodeAudioData(buf)
      this.ambientSource = this.ctx.createBufferSource()
      this.ambientSource.buffer = decoded
      this.ambientSource.loop = true
      this.ambientSource.connect(this.ambientGain)
      this.ambientSource.start()
    } catch (e) {
      console.warn('[AudioEngine] ambient MP3 failed to load', e)
    }

    const sfxPaths = new Set<string>()
    for (const preset of Object.values(PRESETS)) {
      if (preset.soundEffect) sfxPaths.add(preset.soundEffect)
    }
    await Promise.allSettled(
      [...sfxPaths].map(async (path) => {
        try {
          const res = await fetch(path)
          const buf = await res.arrayBuffer()
          const ctx = this.ctx!
          const decoded = await ctx.decodeAudioData(buf)
          this.sfxBuffers.set(path, decoded)
        } catch (e) {
          console.warn(`[AudioEngine] SFX ${path} failed to load`, e)
        }
      }),
    )

    this._unlockFn = () => this.unlock()
    document.addEventListener('click', this._unlockFn, { once: true })
    document.addEventListener('keydown', this._unlockFn, { once: true })
    document.addEventListener('touchstart', this._unlockFn, { once: true })
  }

  dispose(): void {
    this.ambientSource?.stop()
    this.ctx?.close()
    this.ctx = null
    this.sfxBuffers.clear()
    if (this._unlockFn) {
      document.removeEventListener('click', this._unlockFn)
      document.removeEventListener('keydown', this._unlockFn)
      document.removeEventListener('touchstart', this._unlockFn)
      this._unlockFn = null
    }
  }

  toggleMute(): boolean {
    this.muted = !this.muted
    if (this.ambientGain) this.ambientGain.gain.value = this.muted ? 0 : AUDIO.ambientVolume
    return this.muted
  }

  playSFX(path: string): void {
    if (!this.ctx || !this.sfxGain) return
    const buf = this.sfxBuffers.get(path)
    if (!buf) { console.warn(`[AudioEngine] SFX not preloaded: ${path}`); return }
    const src = this.ctx.createBufferSource()
    src.buffer = buf
    src.connect(this.sfxGain)
    src.start()
  }

  unlock(): void {
    if (this.unlocked || !this.ctx) return
    this.ctx.resume()
    this.unlocked = true
  }
}

// ─── SpiritEngine ─────────────────────────────────────────────────────────────

const FOLLOW_R = 200
const FOLLOW_H = 60
const TRANSITION_BURST = 0.55  // speed added at peak of transition bell curve

export class SpiritEngine {
  private renderer: THREE.WebGLRenderer | null = null
  private scene: THREE.Scene | null = null
  private camera: THREE.PerspectiveCamera | null = null
  private simulator: SpiritSimulator | null = null
  private particles: SpiritParticles | null = null
  private audio: AudioEngine | null = null
  private raf: number | null = null
  private cycleTimer: ReturnType<typeof setTimeout> | null = null
  private cycleIndex = 0
  private lastFrameTime = 0
  private resizeObserver: ResizeObserver | null = null

  private followTime = 0
  private followPoint = new THREE.Vector3()
  private initTime = 0
  private initDone = false

  private currentPreset: SpiritPreset = PRESETS.default
  private lerpState: { from: SpiritPreset; to: SpiritPreset; elapsed: number; active: boolean; kickAngle: number } | null = null
  private bgColor = new THREE.Color()

  async init(container: HTMLElement): Promise<void> {
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = false
    container.appendChild(this.renderer.domElement)

    this.scene = new THREE.Scene()
    const preset = this.currentPreset
    this.bgColor.setStyle(preset.bgColor)
    this.renderer.setClearColor(this.bgColor)
    this.scene.fog = new THREE.FogExp2(this.bgColor.getHex(), 0.001)

    this.camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 10, 3000)
    this.camera.position.set(300, 60, 300).normalize().multiplyScalar(1000)
    this.camera.lookAt(0, 50, 0)

    // Default texture size = 256×256 = 65,536 particles
    this.simulator = new SpiritSimulator(this.renderer, 100, 80)
    this.particles = new SpiritParticles(this.renderer, this.scene, this.camera, this.simulator, preset.color1, preset.color2)
    this.scene.add(this.particles.container)

    this.audio = new AudioEngine()
    this.audio.init().catch(err => console.warn('[SpiritEngine] audio init failed', err))

    this.resizeObserver = new ResizeObserver(() => {
      if (!this.renderer || !this.camera) return
      const w = container.clientWidth, h = container.clientHeight
      this.camera.aspect = w / h
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(w, h)
      this.particles?.resize(w, h)
    })
    this.resizeObserver.observe(container)

    this.lastFrameTime = performance.now()
    this._tick()
    this._scheduleCycle()
  }

  dispose(): void {
    if (this.raf !== null) cancelAnimationFrame(this.raf)
    if (this.cycleTimer !== null) clearTimeout(this.cycleTimer)
    this.resizeObserver?.disconnect()
    this.audio?.dispose()
    this.particles?.dispose()
    this.simulator?.dispose()
    const canvas = this.renderer?.domElement
    this.renderer?.dispose()
    canvas?.parentElement?.removeChild(canvas)
    this.scene = null
    this.renderer = null
    this.camera = null
    this.simulator = null
    this.particles = null
    this.audio = null
  }

  toggleMute(): boolean {
    return this.audio?.toggleMute() ?? false
  }

  transition(presetName: string): void {
    const preset = PRESETS[presetName]
    if (!preset) { console.warn(`[SpiritEngine] unknown preset: ${presetName}`); return }
    if (preset.soundEffect) this.audio?.playSFX(preset.soundEffect)
    const from = this.lerpState?.active ? this._snapshot() : { ...this.currentPreset }
    this.lerpState = { from, to: preset, elapsed: 0, active: true, kickAngle: Math.random() * Math.PI * 2 }
    if (this.cycleTimer !== null) clearTimeout(this.cycleTimer)
    const idx = AUTO_CYCLE.findIndex((c) => c.preset === presetName)
    if (idx !== -1) this.cycleIndex = idx
    this._scheduleCycle()
  }

  private _scheduleCycle(): void {
    const current = AUTO_CYCLE[this.cycleIndex]
    if (!current) return
    this.cycleTimer = setTimeout(() => {
      this.cycleIndex = (this.cycleIndex + 1) % AUTO_CYCLE.length
      const name = AUTO_CYCLE[this.cycleIndex].preset
      const next = PRESETS[name]
      if (!next) return
      if (next.soundEffect) this.audio?.playSFX(next.soundEffect)
      const from = this.lerpState?.active ? this._snapshot() : { ...this.currentPreset }
      this.lerpState = { from, to: next, elapsed: 0, active: true, kickAngle: Math.random() * Math.PI * 2 }
      this._scheduleCycle()
    }, current.holdMs)
  }

  private _snapshot(): SpiritPreset {
    if (!this.lerpState) return { ...this.currentPreset }
    const { from, to, elapsed } = this.lerpState
    const t = Math.min(elapsed / TRANSITION_DURATION_MS, 1)
    return this._lerp(from, to, t * t * (3 - 2 * t))
  }

  private _lerp(from: SpiritPreset, to: SpiritPreset, t: number): SpiritPreset {
    const colorKeys = new Set<keyof SpiritPreset>(['color1', 'color2', 'bgColor'])
    const result: any = { ...from }
    for (const key of Object.keys(from) as (keyof SpiritPreset)[]) {
      if (key === 'useTriangles' || key === 'soundEffect') continue
      if (colorKeys.has(key)) {
        const fc = new THREE.Color(from[key] as string)
        result[key] = '#' + fc.lerp(new THREE.Color(to[key] as string), t).getHexString()
      } else {
        result[key] = (from[key] as number) + ((to[key] as number) - (from[key] as number)) * t
      }
    }
    result.useTriangles = to.useTriangles
    result.soundEffect = to.soundEffect
    return result as SpiritPreset
  }

  private _tick = (): void => {
    this.raf = requestAnimationFrame(this._tick)
    if (!this.renderer || !this.scene || !this.camera || !this.simulator || !this.particles) return

    const now = performance.now()
    const dt = Math.min(now - this.lastFrameTime, 50)
    this.lastFrameTime = now

    // Init animation ramp
    if (!this.initDone) {
      this.initTime += dt
      this.simulator.initAnimation = Math.min(this.initTime / 3000, 1)
      if (this.simulator.initAnimation >= 1) this.initDone = true
    }

    // Advance transition
    let current = this.currentPreset
    let burstFactor = 0
    if (this.lerpState?.active) {
      this.lerpState.elapsed += dt
      const t = Math.min(this.lerpState.elapsed / TRANSITION_DURATION_MS, 1)
      const eased = t * t * (3 - 2 * t)
      current = this._lerp(this.lerpState.from, this.lerpState.to, eased)
      burstFactor = Math.sin(Math.PI * t)
      current = { ...current, speed: current.speed + burstFactor * TRANSITION_BURST }
      if (t >= 1) {
        this.currentPreset = this.lerpState.to
        this.lerpState.active = false
      }
    }

    // Animate follow point — during transition: speed surges and a random
    // "meteor kick" throws the attractor off-axis then swings it back
    const effectiveFollowSpeed = current.followSpeed * (1 + burstFactor * 7)
    this.followTime += dt * 0.001 * effectiveFollowSpeed
    this.followPoint.set(
      Math.cos(this.followTime) * FOLLOW_R,
      Math.cos(this.followTime * 4) * FOLLOW_H,
      Math.sin(this.followTime * 2) * FOLLOW_R,
    )
    if (burstFactor > 0 && this.lerpState) {
      const kick = burstFactor * 420
      this.followPoint.x += Math.cos(this.lerpState.kickAngle) * kick
      this.followPoint.z += Math.sin(this.lerpState.kickAngle) * kick
      this.followPoint.y += burstFactor * 100
    }

    // Update background color + fog
    this.bgColor.setStyle(current.bgColor)
    this.renderer.setClearColor(this.bgColor)
    if (this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.color.copy(this.bgColor)
    }

    // Update simulator
    this.simulator.update(dt, this.followPoint, {
      speed: current.speed,
      dieSpeed: current.dieSpeed,
      radius: current.radius,
      curlSize: current.curlSize,
      attraction: current.attraction,
    })

    // Update particles + render via EffectComposer
    this.particles.update(this.simulator, {
      color1: current.color1,
      color2: current.color2,
      bloomStrength: current.bloomStrength,
      bloomRadius: current.bloomRadius,
      bloomThreshold: current.bloomThreshold,
      useTriangles: current.useTriangles,
    })
    this.particles.render()
  }
}
