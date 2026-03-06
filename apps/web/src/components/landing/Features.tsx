import { Container } from "@/components/layout/Container"
import { FEATURES } from "@/constants/landing"

export function Features() {
  return (
    <section id="features" className="bg-neutral-50 py-24">
      <Container>
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">
            Everything your front desk needs
          </h2>
          <p className="mt-4 text-neutral-500">
            Built for businesses that can't afford to miss a call.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-neutral-200 bg-white p-8 transition-shadow hover:shadow-md"
            >
              <div className="mb-4 text-3xl">{feature.icon}</div>
              <h3 className="mb-2 text-base font-semibold text-neutral-900">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-neutral-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
