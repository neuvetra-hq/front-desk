"use client"

import { Phone, Brain, CalendarCheck, Globe, FileText, Bell } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { motion } from "framer-motion"
import { Container } from "@/components/layout/Container"
import { FRONT_DESK_FEATURES } from "@/constants/landing"

const FEATURE_ICONS: LucideIcon[] = [Phone, Brain, CalendarCheck, Globe, FileText, Bell]

const FEATURE_SIZES = [
  "md:col-span-2 md:row-span-2", // Phone — large featured
  "md:col-span-1 md:row-span-1", // Brain
  "md:col-span-1 md:row-span-1", // Calendar
  "md:col-span-1 md:row-span-1", // Globe
  "md:col-span-1 md:row-span-1", // FileText
  "md:col-span-2 md:row-span-1", // Bell — wide
]

export function Features() {
  return (
    <section id="features" className="bg-muted py-24 md:py-32">
      <Container>
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            Neuvetra Front Desk
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            Everything your receptionist does.
            <br />
            <span className="text-muted-foreground">For a fraction of the cost.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Front Desk handles every inbound call with the knowledge, professionalism, and
            availability your business needs.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:auto-rows-[18rem]">
          {FRONT_DESK_FEATURES.map((feature, i) => {
            const Icon = FEATURE_ICONS[i]
            const isLarge = i === 0
            const isWide = i === 5

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.07, ease: "easeOut" }}
                className={`group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-background p-6 transition-shadow hover:shadow-lg hover:shadow-primary/5 ${FEATURE_SIZES[i]}`}
              >
                {/* Subtle hover glow */}
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 [background:radial-gradient(ellipse_at_top_left,theme(colors.primary/0.08),transparent_60%)]" />

                <div className={`mb-4 flex items-center justify-center rounded-xl bg-primary/10 ${isLarge ? "h-14 w-14" : "h-10 w-10"}`}>
                  <Icon className={`text-primary ${isLarge ? "size-7" : "size-5"}`} strokeWidth={1.8} />
                </div>

                <h3 className={`font-bold text-foreground ${isLarge ? "text-xl" : "text-base"}`}>
                  {feature.title}
                </h3>

                <p className={`mt-2 leading-relaxed text-muted-foreground ${isLarge ? "text-base" : "text-sm"}`}>
                  {feature.description}
                </p>

                {/* Extra visual for the large "Never misses a call" card */}
                {isLarge && (
                  <div className="mt-auto pt-6">
                    <div className="flex items-center gap-2 rounded-xl border border-border bg-muted px-4 py-3">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                      </span>
                      <span className="text-sm font-medium text-foreground">Front Desk is answering a call right now</span>
                    </div>
                  </div>
                )}

                {/* Extra visual for the wide "Instant alerts" card */}
                {isWide && (
                  <div className="mt-auto pt-4 flex gap-2 flex-wrap">
                    {["📱 New appointment booked", "🔔 Urgent call from (415) 555-0192", "📋 Call summary ready"].map((alert) => (
                      <span key={alert} className="rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">
                        {alert}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
