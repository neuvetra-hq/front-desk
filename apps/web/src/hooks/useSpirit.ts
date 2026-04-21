import { useRef, useEffect, useCallback, type RefObject } from 'react'
import { SpiritEngine } from '@/lib/spirit/engine'

export function useSpirit(containerRef: RefObject<HTMLDivElement | null>): {
  transition: (presetName: string) => void
  toggleMute: () => boolean
} {
  const engineRef = useRef<SpiritEngine | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const engine = new SpiritEngine()
    engineRef.current = engine
    engine.init(container).catch((err) => {
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
