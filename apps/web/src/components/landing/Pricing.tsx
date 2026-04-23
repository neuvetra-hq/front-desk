"use client"

import { useState, useRef, useLayoutEffect } from "react"
import { Container } from "@/components/layout/Container"
import { PRICING_TIERS } from "@/contexts/constants/landing"

export function Pricing() {
  const [annual, setAnnual] = useState(false)
  const monthlyRef = useRef<HTMLButtonElement>(null)
  const annualRef  = useRef<HTMLButtonElement>(null)
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  useLayoutEffect(() => {
    const tab = annual ? annualRef.current : monthlyRef.current
    if (!tab) return
    setIndicator({ left: tab.offsetLeft, width: tab.offsetWidth })
  }, [annual])

  return (
    <section id="pricing" className="bg-foreground py-24 md:py-32">
      <Container>

        {/* ── Header — structure preserved from original, tokens updated for dark bg ── */}
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
            Pricing
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-background md:text-5xl">
            Simple, transparent pricing.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-background/60">
            Start free for 7 days. Your card won't be charged until day 8. Cancel any time.
          </p>

          {/* ── Billing toggle ── */}
          <div className="mt-8 flex justify-center">
            <div className="relative inline-flex items-center">
              <button
                type="button"
                ref={monthlyRef}
                onClick={() => setAnnual(false)}
                className={`relative z-10 px-5 py-2.5 text-[11px] font-light tracking-[.18em] uppercase transition-colors cursor-pointer bg-transparent border-0 ${
                  !annual ? "text-background/90" : "text-background/30 hover:text-background/55"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                ref={annualRef}
                onClick={() => setAnnual(true)}
                className={`relative z-10 px-5 py-2.5 text-[11px] font-light tracking-[.18em] uppercase transition-colors cursor-pointer bg-transparent border-0 ${
                  annual ? "text-background/90" : "text-background/30 hover:text-background/55"
                }`}
              >
                Annual
                <span className="relative ml-0.5 -top-1.5 text-[9px] font-extralight tracking-[.06em] text-violet-400">
                  −20%
                </span>
              </button>
              {/* sliding rectangle — no border-radius, purple bottom border */}
              <div
                className="absolute top-0 bottom-0 pointer-events-none border-b border-violet-500/35 bg-background/[1.5]"
                style={{
                  left: indicator.left,
                  width: indicator.width,
                  transition: "left 250ms cubic-bezier(0.4,0,0.2,1), width 250ms cubic-bezier(0.4,0,0.2,1)",
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Cards grid ── */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3 items-stretch">
          {PRICING_TIERS.map((tier) => {
            const price = annual ? tier.annualPrice : tier.monthlyPrice
            const overageCents = Math.round(parseFloat(tier.overageRate) * 100)

            return (
              <div
                key={tier.name}
                className={`plan-card relative flex flex-col p-7 ${
                  tier.popular
                    ? "order-first md:order-none border border-violet-500/20 bg-violet-500/3"
                    : "border border-background/10 bg-background/[1.5]"
                }`}
              >
                {/* Plan name */}
                <p className={`text-[11px] font-semibold tracking-[.14em] uppercase mb-5 ${
                  tier.popular ? "text-violet-200/70" : "text-background/45"
                }`}>
                  {tier.name}
                </p>

                {/* Price — dollar, amount, /month all on one line */}
                <div className="flex items-baseline gap-1 mb-6">
                  <span className={`text-base font-light self-start mt-2 ${
                    tier.popular ? "text-violet-200/45" : "text-background/40"
                  }`}>
                    $
                  </span>
                  <span className="text-[52px] font-light tracking-tight text-background leading-none">
                    {price}
                  </span>
                  <span className={`text-xs font-light self-end pb-1.5 ${
                    tier.popular ? "text-violet-200/30" : "text-background/30"
                  }`}>
                    /month
                  </span>
                </div>

                {/* Divider */}
                <div className={`h-px mb-5 ${
                  tier.popular ? "bg-violet-500/12" : "bg-background/7"
                }`} />

                {/* Features */}
                <ul className="flex flex-col gap-2.5 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className={`text-xs leading-snug pl-3 relative ${
                      tier.popular ? "text-background/55" : "text-background/45"
                    }`}>
                      <span className={`absolute left-0 top-0.5 text-[9px] ${
                        tier.popular ? "text-violet-400/40" : "text-background/18"
                      }`}>—</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Overage */}
                <p className={`text-[10px] mt-4 ${
                  tier.popular ? "text-violet-200/20" : "text-background/20"
                }`}>
                  Overage: {overageCents}¢ / min after {tier.minutes.toLocaleString()} min
                </p>

                {/* Good for */}
                <div className={`mt-5 pt-4 border-t ${
                  tier.popular ? "border-violet-500/10" : "border-background/5"
                }`}>
                  <p className={`text-[9px] font-semibold tracking-[.14em] uppercase mb-1.5 ${
                    tier.popular ? "text-violet-200/20" : "text-background/20"
                  }`}>
                    Good for
                  </p>
                  <p className={`text-[11px] leading-relaxed ${
                    tier.popular ? "text-violet-200/35" : "text-background/35"
                  }`}>
                    {tier.goodFor}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Enterprise bar ── */}
        <div className="mt-4 flex flex-col gap-4 border border-background/6 bg-background/1 px-8 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[.14em] uppercase text-background/30 mb-1">
              Enterprise
            </p>
            <p className="text-[15px] font-normal text-background/70">
              Replacing a call center? Let's build something custom.
            </p>
            <p className="text-xs text-background/30 mt-0.5">
              Custom minutes, dedicated infrastructure, white-glove onboarding.
            </p>
          </div>
          <a
            href="mailto:hello@neuvetra.com"
            className="shrink-0 text-[11px] font-light tracking-[.08em] uppercase text-violet-300/70 border-b border-violet-500/30 pb-px hover:text-violet-200 hover:border-violet-500/60 transition-colors"
          >
            Contact us →
          </a>
        </div>

        {/* ── Single CTA ── */}
        <div className="mt-10 flex justify-center">
          <a
            href="/signup"
            className="px-8 py-3.5 text-[11px] font-light tracking-[.18em] uppercase text-violet-200 bg-violet-500/15 border border-violet-500/35 hover:bg-violet-500/20 transition-colors"
          >
            Start free trial
          </a>
        </div>

        {/* ── Footer note ── */}
        <p className="mt-10 text-center text-sm text-background/35">
          All plans include 1 dedicated local number, call transcripts, SMS alerts, and full dashboard access.
          <br />
          Need more?{" "}
          <a href="mailto:hello@neuvetra.com" className="text-violet-400 hover:underline">
            Contact us
          </a>{" "}
          for custom volume pricing.
        </p>

      </Container>
    </section>
  )
}
