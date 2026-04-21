import { useRef } from 'react'
import { useSpirit } from '@/hooks/useSpirit'

export function AppPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  useSpirit(containerRef)

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <div ref={containerRef} className="absolute inset-0" />
      <div className="relative z-10" />
    </div>
  )
}
