export interface SpiritPreset {
  speed: number           // 0–3
  dieSpeed: number        // 0.0005–0.05
  radius: number          // 0.2–3
  curlSize: number        // 0.001–0.05
  attraction: number      // -2 to 2
  followSpeed: number     // multiplier on follow-point animation speed
  color1: string          // CSS hex — bright/alive particle color
  color2: string          // CSS hex — dim/dying particle color
  bgColor: string         // CSS hex — background + fog
  bloomStrength: number
  bloomRadius: number
  bloomThreshold: number
  useTriangles: boolean
  soundEffect?: string
}

const defaultPreset: SpiritPreset = {
  speed: 1.0,
  dieSpeed: 0.015,
  radius: 0.6,
  curlSize: 0.02,
  attraction: 1.0,
  followSpeed: 1.0,
  color1: '#ffffff',
  color2: '#3d5257',
  bgColor: '#0b0c0d',
  bloomStrength: 0.5,
  bloomRadius: 0.3,
  bloomThreshold: 0.0,
  useTriangles: true,
}

const stormPreset: SpiritPreset = {
  speed: 2.5,
  dieSpeed: 0.04,
  radius: 1.2,
  curlSize: 0.04,
  attraction: 1.8,
  followSpeed: 2.0,
  color1: '#66aaff',
  color2: '#ff6644',
  bgColor: '#0a0a18',
  bloomStrength: 1.2,
  bloomRadius: 0.6,
  bloomThreshold: 0.1,
  useTriangles: true,
  soundEffect: '/audio/sfx/storm.mp3',
}

const driftPreset: SpiritPreset = {
  speed: 0.4,
  dieSpeed: 0.003,
  radius: 0.3,
  curlSize: 0.008,
  attraction: 0.3,
  followSpeed: 0.5,
  color1: '#88ffcc',
  color2: '#1a4455',
  bgColor: '#000d1a',
  bloomStrength: 0.8,
  bloomRadius: 0.5,
  bloomThreshold: 0.0,
  useTriangles: false,
  soundEffect: '/audio/sfx/drift.mp3',
}

export const PRESETS: Record<string, SpiritPreset> = {
  default: defaultPreset,
  storm: stormPreset,
  drift: driftPreset,
}

export const TRANSITION_DURATION_MS = 3000

export const AUTO_CYCLE: { preset: string; holdMs: number }[] = [
  { preset: 'default', holdMs: 10000 },
  { preset: 'storm',   holdMs: 8000  },
  { preset: 'drift',   holdMs: 9000  },
]

export const AUDIO = {
  ambientLoop: '/audio/ambient.mp3',
  ambientVolume: 0.3,
  sfxVolume: 0.7,
}
