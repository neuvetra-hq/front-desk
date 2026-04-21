import { useRef } from 'react'
import { Link } from 'react-router'
import { useSpirit } from '@/hooks/useSpirit'

const BOTTOM_NAV = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Sign In", href: "/login" },
  { label: "Get Started", href: "/signup" },
]

export function AppPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  useSpirit(containerRef)

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: 'radial-gradient(circle at 3% 5%, #253239 0%, #0b0c0d 50%)' }}
    >
      {/* Spirit particle animation — full screen */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Content overlay */}
      <div className="relative z-10 flex h-full flex-col items-center justify-between px-8 py-10 select-none">
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
