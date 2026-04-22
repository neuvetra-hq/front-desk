import { motion } from "framer-motion"
import { AppPageShell } from "./AppPageShell"
import { HOW_IT_WORKS } from "@/contexts/constants/landing"

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
}

export function AppHowItWorksPage() {
  return (
    <AppPageShell title="How It Works" descriptor="Live in under 10 minutes">
      <motion.ol
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col max-w-md mx-auto w-full"
      >
        {HOW_IT_WORKS.map((step, index) => (
          <motion.li
            key={step.step}
            variants={itemVariants}
            className="flex gap-6 items-start py-5"
            style={{
              borderTop: index === 0 ? 'none' : '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {/* Step number */}
            <span
              className="shrink-0 w-7 text-right pt-px"
              style={{
                color: 'rgba(255,255,255,0.18)',
                fontSize: '0.7rem',
                fontFamily: "'Jost', sans-serif",
                fontWeight: 200,
                letterSpacing: '0.05em',
              }}
            >
              {step.step}
            </span>

            {/* Step content */}
            <div className="flex flex-col gap-1.5">
              <h3
                className="uppercase"
                style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '0.75rem',
                  letterSpacing: '0.18em',
                  fontFamily: "'Jost', sans-serif",
                  fontWeight: 300,
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  color: 'rgba(255,255,255,0.38)',
                  fontSize: '0.75rem',
                  lineHeight: '1.75',
                  fontWeight: 300,
                  maxWidth: '26rem',
                }}
              >
                {step.description}
              </p>
            </div>
          </motion.li>
        ))}
      </motion.ol>
    </AppPageShell>
  )
}
