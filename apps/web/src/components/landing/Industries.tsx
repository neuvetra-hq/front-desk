import { Container } from "@/components/layout/Container"
import { INDUSTRIES } from "@/constants/landing"

export function Industries() {
  return (
    <section className="bg-orange-50 py-20">
      <Container>
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
            Industries
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">
            Built for the businesses that keep communities running
          </h2>
          <p className="mt-4 text-neutral-500">
            If your phone rings and missing it costs you money, Front Desk is for you.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {INDUSTRIES.map(({ label, icon }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-3 rounded-2xl border border-orange-100 bg-white px-4 py-6 text-center shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="text-3xl">{icon}</span>
              <span className="text-sm font-medium text-neutral-700">{label}</span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
