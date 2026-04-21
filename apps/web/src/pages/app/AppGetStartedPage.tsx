import { useEffect } from 'react'
import { Link } from 'react-router'
import { useSpiritContext } from '@/contexts/SpiritContext'

export function AppGetStartedPage() {
  const { transition } = useSpiritContext()
  useEffect(() => { transition('getStarted') }, [])

  return (
    <div className="relative flex h-full flex-col items-center justify-between px-8 py-10 select-none">
      <div />
      <div className="flex flex-col items-center text-center">
        <h1
          className="uppercase leading-none"
          style={{ color: '#668a93', fontSize: 'clamp(2rem, 5vw, 5rem)', letterSpacing: '0.25em', fontFamily: "'Jost', sans-serif", fontWeight: 200 }}
        >
          Get Started
        </h1>
        <p className="mt-5 uppercase text-white/30" style={{ fontSize: 'clamp(0.6rem, 1.1vw, 1rem)', letterSpacing: '0.5em' }}>
          Coming soon
        </p>
      </div>
      <Link to="/app" className="text-[0.65rem] uppercase tracking-[0.25em] text-white/35 transition-colors duration-300 hover:text-white">
        ← Back
      </Link>
    </div>
  )
}
