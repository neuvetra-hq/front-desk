import { useRef, useEffect, useCallback, type RefObject } from 'react'
import { SpiritEngine } from '@/lib/spirit/engine'

export function useSpirit(
  containerRef: RefObject<HTMLDivElement | null>,
  onReady?: () => void,
): {
  transition: (presetName: string) => void
  toggleMute: () => boolean
} {
  const engineRef = useRef<SpiritEngine | null>(null)
  const onReadyRef = useRef(onReady)
  onReadyRef.current = onReady

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const engine = new SpiritEngine()
    engineRef.current = engine
    const MIN_BOOT_MS = 1200
    Promise.all([
      engine.init(container),
      new Promise<void>(r => setTimeout(r, MIN_BOOT_MS)),
    ])
      .then(() => onReadyRef.current?.())
      .catch((err) => {
        console.error('[useSpirit] engine init failed', err)
      })
    return () => {
      engine.dispose()
      engineRef.current = null
    }
  }, [])

  const transition = useCallback((presetName: string) => {
    engineRef.current?.transition(presetName)
  }, [])

  const toggleMute = useCallback((): boolean => {
    return engineRef.current?.toggleMute() ?? false
  }, [])

  return { transition, toggleMute }
}
