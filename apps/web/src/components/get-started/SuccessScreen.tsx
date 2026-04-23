// apps/web/src/components/get-started/SuccessScreen.tsx
import { motion } from "framer-motion"
import { jost } from "./types"

interface Props {
  onDashboard: () => void
}

export function SuccessScreen({ onDashboard }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="max-w-sm mx-auto text-center pt-6 space-y-8"
    >
      {/* Animated ring */}
      <div className="flex justify-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="size-16 flex items-center justify-center border border-violet-500/40 bg-violet-500/[0.06]"
        >
          <div className="size-2 rounded-full bg-violet-400/80" />
        </motion.div>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] tracking-[.16em] uppercase text-violet-400/60" style={jost}>
          Active
        </p>
        <p className="text-sm text-white/40 leading-relaxed" style={jost}>
          Your AI receptionist is live and ready to answer calls.
          Head to your dashboard to configure business hours and review calls.
        </p>
      </div>

      <button
        type="button"
        onClick={onDashboard}
        className="px-10 py-3.5 text-[11px] font-light tracking-[.18em] uppercase text-violet-200 bg-violet-500/15 border border-violet-500/35 hover:bg-violet-500/20 transition-colors"
        style={{ fontFamily: "'Jost', sans-serif" }}
      >
        Go to Dashboard →
      </button>
    </motion.div>
  )
}
