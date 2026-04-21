import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router'
import { useSpirit } from '@/hooks/useSpirit'

const BOTTOM_NAV = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Sign In", href: "/login" },
  { label: "Get Started", href: "/signup" },
]

const BAR_DELAYS = ['0s', '0.2s', '0.4s', '0.2s']

export function AppPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { toggleMute } = useSpirit(containerRef)
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

      {/* Spirit particle animation — full screen */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Content overlay */}
      <div className="relative z-10 flex h-full flex-col items-center justify-between px-8 py-10 select-none">

        {/* Sound toggle — top right */}
        <div className="absolute top-9 right-10">
          <button
            onClick={handleToggleMute}
            aria-label={muted ? 'Unmute' : 'Mute'}
            className={`flex items-end gap-[3px] h-5 transition-opacity duration-500 cursor-pointer ${audioStarted ? 'opacity-40 hover:opacity-90' : 'opacity-0 pointer-events-none'}`}
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

        {/* Top spacer */}
        <div />

        {/* Center branding */}
        <div className="flex flex-col items-center text-center">
          <h1
            className="uppercase text-white leading-none"
            style={{ fontSize: 'clamp(3rem, 8vw, 9rem)', letterSpacing: '0.25em', fontFamily: "'Jost', sans-serif", fontWeight: 200 }}
          >
            Front Desk
          </h1>
          <p
            className="mt-5 uppercase text-white/50"
            style={{ fontSize: 'clamp(0.6rem, 1.1vw, 1rem)', letterSpacing: '0.5em' }}
          >
            AI Receptionist &nbsp;·&nbsp; By Neuvetra
          </p>
        </div>

        {/* Bottom navigation */}
        <nav className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {BOTTOM_NAV.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-[0.65rem] uppercase tracking-[0.25em] text-white/35 transition-colors duration-300 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
