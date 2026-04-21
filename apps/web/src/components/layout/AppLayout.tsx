import { useRef, useState, useEffect } from 'react'
import { NavLink, useLocation, useOutlet } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { useSpirit } from '@/hooks/useSpirit'
import { SpiritContext } from '@/contexts/SpiritContext'

const BAR_DELAYS = ['0s', '0.2s', '0.4s', '0.2s']

const NAV_LINKS = [
  { label: 'How It Works', href: '/app/how-it-works' },
  { label: 'Pricing',      href: '/app/pricing' },
  { label: 'Sign In',      href: '/app/sign-in' },
  { label: 'Get Started',  href: '/app/get-started' },
]

const SLIDE = {
  initial: { y: '100vh' },
  animate: { y: 0 },
  exit:    { y: '100vh' },
  transition: { duration: 0.55, ease: [0.76, 0, 0.24, 1] as const },
}

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

function NavItem({ label, href }: { label: string; href: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <NavLink
      to={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="text-[0.65rem] uppercase tracking-[0.25em]"
      style={({ isActive }) => ({
        color: isActive
          ? 'rgba(255,255,255,0.95)'
          : hovered
            ? 'rgba(255,255,255,0.85)'
            : 'rgba(255,255,255,0.6)',
        textShadow: isActive
          ? '0 0 12px rgba(255,255,255,0.7), 0 0 28px rgba(255,255,255,0.3)'
          : hovered
            ? '0 0 10px rgba(255,255,255,0.45)'
            : 'none',
        transition: 'color 0.3s ease, text-shadow 0.3s ease',
      })}
    >
      {label}
    </NavLink>
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

        {/* Sound toggle — always top-right */}
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

        {/* Persistent bottom nav — always above sliding content */}
        <nav className="absolute bottom-10 left-0 right-0 z-50 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 select-none">
          {NAV_LINKS.map((link) => (
            <NavItem key={link.href} label={link.label} href={link.href} />
          ))}
        </nav>

        {/* Page content — slides in/out per route */}
        <AnimatedOutlet />
      </div>
    </SpiritContext.Provider>
  )
}
