import { Container } from "@/components/layout/Container"
import { FRONT_DESK_FEATURES } from "@/constants/landing"

export function Features() {
  return (
    <section id="features" className="bg-white py-24 md:py-32">
      <Container>
        <div className="mb-16 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600 mb-3">Neuvetra Front Desk</p>
          <h2 className="text-4xl font-black tracking-tight text-neutral-900 md:text-5xl">
            Everything your receptionist does.<br />
            <span className="text-neutral-400">For a fraction of the cost.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-500">
            Front Desk handles every inbound call with the knowledge, professionalism, and availability your business needs.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FRONT_DESK_FEATURES.map((feature) => (
            <div key={feature.title} className="group rounded-2xl border border-neutral-100 bg-neutral-50 p-6 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all">
              <div className="mb-4 text-3xl">{feature.icon}</div>
              <h3 className="text-base font-bold text-neutral-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
