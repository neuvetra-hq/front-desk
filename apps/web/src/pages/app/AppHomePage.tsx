import { useEffect } from 'react'
import { Link } from 'react-router'
import { useSpiritContext } from '@/contexts/SpiritContext'

const BOTTOM_NAV = [
  { label: "How It Works", href: "/app/how-it-works" },
  { label: "Pricing",      href: "/app/pricing" },
  { label: "Sign In",      href: "/app/sign-in" },
  { label: "Get Started",  href: "/app/get-started" },
]

export function AppHomePage() {
  const { transition } = useSpiritContext()
  useEffect(() => { transition('default') }, [])

  return (
    <div className="relative flex h-full flex-col items-center justify-between px-8 py-10 select-none">
      <div />

      <div className="flex flex-col items-center text-center">
        <h1
          className="uppercase leading-none"
          style={{ color: '#668a93', fontSize: 'clamp(3rem, 8vw, 9rem)', letterSpacing: '0.25em', fontFamily: "'Jost', sans-serif", fontWeight: 200 }}
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
  )
}
