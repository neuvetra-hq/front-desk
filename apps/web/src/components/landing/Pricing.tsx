"use client"

import { useState } from "react"
import { Container } from "@/components/layout/Container"
import { PRICING_TIERS } from "@/constants/landing"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export function Pricing() {
  const [annual, setAnnual] = useState(false)

  return (
    <section id="pricing" className="bg-neutral-50 py-24 md:py-32">
      <Container>
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600 mb-3">Pricing</p>
          <h2 className="text-4xl font-semibold tracking-tight text-neutral-900 md:text-5xl">
            Simple, transparent pricing.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-neutral-500">
            Start free for 7 days. No credit card required. Cancel any time.
          </p>

          {/* Billing toggle */}
          <div className="mt-8">
            <ToggleGroup
              value={[annual ? "annual" : "monthly"]}
              onValueChange={(v) => { if (v[0]) setAnnual(v[0] === "annual") }}
              spacing={1}
              className="rounded-xl border border-neutral-200 bg-white p-1"
            >
              <ToggleGroupItem value="monthly" className="rounded-lg px-4 py-2 text-sm font-semibold">
                Monthly
              </ToggleGroupItem>
              <ToggleGroupItem value="annual" className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold">
                Annual
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  Save 20%
                </span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* Tier cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {PRICING_TIERS.map((tier) => {
            const price = annual
              ? Math.round(tier.monthlyPrice * 0.8)
              : tier.monthlyPrice

            return (
              <div
                key={tier.name}
                className={`relative flex flex-col rounded-2xl border p-8 transition-all ${
                  tier.popular
                    ? "border-indigo-500 bg-white shadow-lg shadow-indigo-100 ring-1 ring-indigo-500"
                    : "border-neutral-200 bg-white shadow-sm"
                }`}
              >
                {/* Popular badge */}
                {tier.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-indigo-600 px-4 py-1 text-xs font-semibold text-white shadow">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Tier name + description */}
                <h3 className="text-lg font-bold text-neutral-900">{tier.name}</h3>
                <p className="mt-1 text-sm text-neutral-500">{tier.description}</p>

                {/* Price */}
                <div className="mt-6 flex items-end gap-1">
                  <span className="text-5xl font-bold tracking-tight text-neutral-900">
                    ${price}
                  </span>
                  <span className="mb-1.5 text-sm text-neutral-500">/mo</span>
                </div>
                {annual && (
                  <p className="mt-1 text-xs text-emerald-600 font-medium">
                    Billed ${price * 12}/year · save ${(tier.monthlyPrice - price) * 12}/yr
                  </p>
                )}

                {/* CTA */}
                <a
                  href="/signup"
                  className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                    tier.popular
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-neutral-900 text-white hover:bg-neutral-700"
                  }`}
                >
                  Start free trial →
                </a>

                <p className="mt-2 text-center text-xs text-neutral-400">
                  7-day free trial · No credit card
                </p>

                {/* Divider */}
                <div className="my-6 border-t border-neutral-100" />

                {/* Features */}
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-neutral-600">
                      <svg
                        className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Overage note */}
                <p className="mt-6 text-xs text-neutral-400">
                  Overage: <span className="font-medium text-neutral-500">${tier.overageRate}/min</span> after {tier.minutes} min · capped at your limit by default
                </p>
              </div>
            )
          })}
        </div>

        {/* Bottom note */}
        <p className="mt-10 text-center text-sm text-neutral-400">
          All plans include 1 dedicated local phone number, call transcripts, SMS alerts, and full dashboard access.
          <br />
          Need more? <a href="mailto:hello@neuvetra.com" className="text-indigo-600 hover:underline">Contact us</a> for custom volume pricing.
        </p>
      </Container>
    </section>
  )
}
