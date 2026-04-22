import { useEffect, useState, useRef } from "react"
import { NavLink, useLocation, useOutlet } from "react-router"
import { AnimatePresence, motion } from "framer-motion"
import { useAppMachine, useAppSend } from "@/pages/app/hooks/useAppMachine"
import { useSpiritMachine, useSpiritSend } from "@/hooks/useSpiritMachine"
import { APP_ROUTES, ROUTE_BY_PATH } from "@/pages/app/routes"
import { AppSpiritProvider } from "./AppSpiritProvider"

const BAR_DELAYS = ["0s", "0.2s", "0.4s", "0.2s"]

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

function AppLoaderOverlay() {
  const isLoading = useAppMachine((s) => s.matches({ view: "loading" }))
  return (
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
  )
}

function AppLayoutInner() {
  const location = useLocation()
  const sendApp  = useAppSend()
  const sendSpirit = useSpiritSend()

  const audioUnlocked = useSpiritMachine((s) => !s.matches({ audio: "locked" }))
  const isMuted       = useSpiritMachine((s) => s.matches({ audio: { unlocked: "muted" } }))

  useEffect(() => {
    const preset = ROUTE_BY_PATH[location.pathname]?.preset
    if (preset) sendSpirit({ type: "SET_PRESET", name: preset })
  }, [location.pathname, sendSpirit])

  useEffect(() => {
    sendApp({ type: "ROUTE_CHANGED", pathname: location.pathname })
  }, [location.pathname, sendApp])

  return (
    <>
      <style>{`
        @keyframes soundbar {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
      `}</style>

      <div className="absolute top-9 right-10 z-50">
        <button
          onClick={() => sendSpirit({ type: "TOGGLE_MUTE" })}
          aria-label={isMuted ? "Unmute" : "Mute"}
          aria-hidden={!audioUnlocked || undefined}
          tabIndex={audioUnlocked ? 0 : -1}
          className={`flex items-end gap-[3px] h-5 transition-opacity duration-500 cursor-pointer ${
            audioUnlocked ? "opacity-40 hover:opacity-90" : "opacity-0 pointer-events-none"
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

      <nav className="absolute bottom-10 left-0 right-0 z-50 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 select-none">
        {APP_ROUTES.map((route) => (
          <NavItem key={route.path} label={route.label} href={route.path} end={route.end} />
        ))}
      </nav>

      <AnimatedOutlet />
    </>
  )
}

export function AppLayout() {
  const containerRef = useRef<HTMLDivElement>(null)
  return (
    <AppSpiritProvider containerRef={containerRef}>
      <div
        className="relative w-screen h-screen overflow-hidden"
        style={{ background: "radial-gradient(circle at 3% 5%, #253239 0%, #0b0c0d 50%)" }}
      >
        <div ref={containerRef} className="absolute inset-0" />
        <AppLayoutInner />
        <AppLoaderOverlay />
      </div>
    </AppSpiritProvider>
  )
}
