import { useRef, useEffect, useState } from "react"
import { NavLink, useLocation, useOutlet } from "react-router"
import { AnimatePresence, motion } from "framer-motion"
import { useSpirit } from "@/hooks/useSpirit"
import { SpiritContext } from "@/contexts/SpiritContext"
import { useAppMachine, useAppSend } from "@/pages/app/hooks/useAppMachine"

const BAR_DELAYS = ["0s", "0.2s", "0.4s", "0.2s"]

const NAV_LINKS = [
  { label: "Home",         href: "/app",               end: true },
  { label: "How It Works", href: "/app/how-it-works" },
  { label: "Pricing",      href: "/app/pricing" },
  { label: "Sign In",      href: "/app/sign-in" },
  { label: "Get Started",  href: "/app/get-started" },
]

const ROUTE_PRESET: Record<string, string> = {
  "/app":               "default",
  "/app/how-it-works":  "howItWorks",
  "/app/pricing":       "pricing",
  "/app/sign-in":       "signIn",
  "/app/get-started":   "getStarted",
}

const SLIDE = {
  initial: { y: "100vh" },
  animate: { y: 0 },
  exit:    { y: "100vh" },
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

function NavItem({ label, href, end }: { label: string; href: string; end?: boolean }) {
  const [hovered, setHovered] = useState(false)
  return (
    <NavLink
      to={href}
      end={end}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="text-[0.65rem] uppercase tracking-[0.25em]"
      style={({ isActive }) => ({
        color: isActive
          ? "rgba(255,255,255,0.95)"
          : hovered
            ? "rgba(255,255,255,0.85)"
            : "rgba(255,255,255,0.6)",
        textShadow: isActive
          ? "0 0 12px rgba(255,255,255,0.7), 0 0 28px rgba(255,255,255,0.3)"
          : hovered
            ? "0 0 10px rgba(255,255,255,0.45)"
            : "none",
        transition: "color 0.3s ease, text-shadow 0.3s ease",
      })}
    >
      {label}
    </NavLink>
  )
}

export function AppLayout() {
  const containerRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const send = useAppSend()
  const isLoading = useAppMachine((s) => s.matches({ view: "loading" }))
  const audioStarted = useAppMachine((s) => !s.matches({ audio: "dormant" }))
  const isMuted = useAppMachine((s) => s.matches({ audio: { active: "muted" } }))

  const { transition, toggleMute } = useSpirit(
    containerRef,
    () => send({ type: "SPIRIT_READY" }),
  )

  // Fire Spirit preset the moment the URL changes — syncs burst with slide-down
  useEffect(() => {
    const preset = ROUTE_PRESET[location.pathname]
    if (preset) transition(preset)
  }, [location.pathname])

  // Keep machine view state in sync with React Router
  useEffect(() => {
    send({ type: "ROUTE_CHANGED", pathname: location.pathname })
  }, [location.pathname, send])

  // Lift audio gate on first user gesture (browser autoplay policy)
  useEffect(() => {
    const handler = () => send({ type: "USER_INTERACTED" })
    document.addEventListener("click", handler, { once: true })
    document.addEventListener("keydown", handler, { once: true })
    document.addEventListener("touchstart", handler, { once: true })
    return () => {
      document.removeEventListener("click", handler)
      document.removeEventListener("keydown", handler)
      document.removeEventListener("touchstart", handler)
    }
  }, [send])

  function handleToggleMute() {
    toggleMute()
    send({ type: "TOGGLE_MUTE" })
  }

  return (
    <SpiritContext.Provider value={{ transition, toggleMute }}>
      <div
        className="relative w-screen h-screen overflow-hidden"
        style={{ background: "radial-gradient(circle at 3% 5%, #253239 0%, #0b0c0d 50%)" }}
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
            aria-label={isMuted ? "Unmute" : "Mute"}
            className={`flex items-end gap-[3px] h-5 transition-opacity duration-500 cursor-pointer ${
              audioStarted ? "opacity-40 hover:opacity-90" : "opacity-0 pointer-events-none"
            }`}
          >
            {BAR_DELAYS.map((delay, i) => (
              <span
                key={i}
                className="w-[3px] rounded-full bg-white"
                style={{
                  height: isMuted ? "3px" : "4px",
                  animation: isMuted ? "none" : "soundbar 0.8s ease-in-out infinite",
                  animationDelay: delay,
                }}
              />
            ))}
          </button>
        </div>

        {/* Persistent bottom nav */}
        <nav className="absolute bottom-10 left-0 right-0 z-50 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 select-none">
          {NAV_LINKS.map((link) => (
            <NavItem key={link.href} label={link.label} href={link.href} end={link.end} />
          ))}
        </nav>

        {/* Page content — slides in/out per route */}
        <AnimatedOutlet />

        {/* Loader overlay — visible while view is in 'loading' state */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              data-testid="app-loader"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute inset-0 z-[200] flex items-center justify-center"
              style={{ background: "#0b0c0d" }}
            >
              <span
                className="text-[0.6rem] uppercase tracking-[0.3em]"
                style={{ color: "rgba(255,255,255,0.2)" }}
              >
                Loading
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SpiritContext.Provider>
  )
}
