import { PhoneCall, Brain, CalendarCheck, Globe, BarChart3, Shield } from "lucide-react"
import { Container } from "@/components/layout/Container"
import { FEATURES } from "@/constants/landing"

const ICONS = [PhoneCall, Brain, CalendarCheck, Globe, BarChart3, Shield]

const COLOR_STYLES: Record<string, { bg: string; icon: string }> = {
  indigo: { bg: "bg-indigo-100", icon: "text-indigo-600" },
  orange: { bg: "bg-orange-100", icon: "text-orange-600" },
  emerald: { bg: "bg-emerald-100", icon: "text-emerald-600" },
  violet: { bg: "bg-violet-100", icon: "text-violet-600" },
  amber: { bg: "bg-amber-100", icon: "text-amber-600" },
  rose: { bg: "bg-rose-100", icon: "text-rose-600" },
}

export function Features() {
  return (
    <section id="features" className="bg-white py-24">
      <Container>
        <div className="mb-16 text-center">
          <span className="mb-3 inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
            Features
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">
            Everything your front desk needs
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-neutral-500">
            Built for businesses that can't afford to miss a call — or pay $3,000/mo for someone to answer it.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => {
            const Icon = ICONS[i]
            const { bg, icon } = COLOR_STYLES[feature.color] ?? COLOR_STYLES.indigo
            return (
              <div
                key={feature.title}
                className="group rounded-2xl border border-neutral-100 bg-neutral-50 p-7 transition-all hover:border-neutral-200 hover:bg-white hover:shadow-md"
              >
                <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${bg}`}>
                  <Icon className={`h-5 w-5 ${icon}`} />
                </div>
                <h3 className="mb-2 text-base font-semibold text-neutral-900">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-neutral-500">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
