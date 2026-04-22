import { useEffect } from 'react'
import { useSpiritContext } from '@/contexts/SpiritContext'

export function AppSignInPage() {
  const { transition } = useSpiritContext()
  useEffect(() => { transition('signIn') }, [])

  return (
    <div className="relative flex h-full flex-col items-center justify-between px-8 py-10 select-none">
      <div />
      <div className="flex flex-col items-center text-center">
        <h1
          className="uppercase leading-none"
          style={{ color: '#668a93', fontSize: 'clamp(2rem, 5vw, 5rem)', letterSpacing: '0.25em', fontFamily: "'Jost', sans-serif", fontWeight: 200 }}
        >
          Sign In
        </h1>
        <p className="mt-5 uppercase text-white/30" style={{ fontSize: 'clamp(0.6rem, 1.1vw, 1rem)', letterSpacing: '0.5em' }}>
          Coming soon
        </p>
      </div>
      <div />
    </div>
  )
}
