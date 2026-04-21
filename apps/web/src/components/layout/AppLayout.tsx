import { useRef, useState, useEffect } from 'react'
import { useLocation, useOutlet } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { useSpirit } from '@/hooks/useSpirit'
import { SpiritContext } from '@/contexts/SpiritContext'

const BAR_DELAYS = ['0s', '0.2s', '0.4s', '0.2s']

const SLIDE = {
  initial: { y: '100vh' },
  animate: { y: 0 },
  exit:    { y: '100vh' },
  transition: { duration: 0.55, ease: [0.76, 0, 0.24, 1] as const },
}

// Snapshots the outlet element on mount so the exiting page keeps its
// original content during the slide-out animation (Outlet always reflects
// the current route, which would otherwise swap content immediately).
function FrozenRoute({ children }: { children: React.ReactNode }) {
  const frozen = useRef(children)
  return <>{frozen.current}</>
}

function AnimatedOutlet() {
  const location = useLocation()
  const outlet = useOutlet()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={SLIDE.initial}
        animate={SLIDE.animate}
        exit={SLIDE.exit}
        transition={SLIDE.transition}
        className="absolute inset-0 z-10"
      >
        <FrozenRoute>{outlet}</FrozenRoute>
      </motion.div>
    </AnimatePresence>
  )
}

export function AppLayout() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { transition, toggleMute } = useSpirit(containerRef)
  const [muted, setMuted] = useState(false)
  const [audioStarted, setAudioStarted] = useState(false)

  useEffect(() => {
    const handler = () => setAudioStarted(true)
    document.addEventListener('click', handler, { once: true })
    document.addEventListener('keydown', handler, { once: true })
    document.addEventListener('touchstart', handler, { once: true })
    return () => {
      document.removeEventListener('click', handler)
      document.removeEventListener('keydown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [])

  function handleToggleMute() {
    setMuted(toggleMute())
  }

  return (
    <SpiritContext.Provider value={{ transition, toggleMute }}>
      <div
        className="relative w-screen h-screen overflow-hidden"
        style={{ background: 'radial-gradient(circle at 3% 5%, #253239 0%, #0b0c0d 50%)' }}
      >
        <style>{`
          @keyframes soundbar {
            0%, 100% { height: 4px; }
            50% { height: 16px; }
          }
        `}</style>

        {/* Spirit canvas — always behind everything */}
        <div ref={containerRef} className="absolute inset-0" />

        {/* Sound toggle — always top-right, z above everything */}
        <div className="absolute top-9 right-10 z-50">
          <button
            onClick={handleToggleMute}
            aria-label={muted ? 'Unmute' : 'Mute'}
            className={`flex items-end gap-[3px] h-5 transition-opacity duration-500 cursor-pointer ${
              audioStarted ? 'opacity-40 hover:opacity-90' : 'opacity-0 pointer-events-none'
            }`}
          >
            {BAR_DELAYS.map((delay, i) => (
              <span
                key={i}
                className="w-[3px] rounded-full bg-white"
                style={{
                  height: muted ? '3px' : '4px',
                  animation: muted ? 'none' : `soundbar 0.8s ease-in-out infinite`,
                  animationDelay: delay,
                }}
              />
            ))}
          </button>
        </div>

        {/* Page content — slides in/out per route */}
        <AnimatedOutlet />
      </div>
    </SpiritContext.Provider>
  )
}
