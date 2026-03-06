import { Container } from "@/components/layout/Container"
import { HOW_IT_WORKS } from "@/constants/landing"

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-24">
      <Container>
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">
            Up and running in minutes
          </h2>
          <p className="mt-4 text-neutral-500">
            No technical expertise required.
          </p>
        </div>

        <div className="relative grid gap-12 md:grid-cols-3">
          {/* Connector line (desktop only) */}
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-neutral-200 md:block" style={{ left: "16.67%", right: "16.67%" }} />

          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className="relative flex flex-col items-center text-center">
              <div className="relative z-10 mb-6 flex h-12 w-12 items-center justify-center rounded-full border-2 border-neutral-900 bg-white text-sm font-bold text-neutral-900">
                {item.step}
              </div>
              <h3 className="mb-2 text-base font-semibold text-neutral-900">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-neutral-500">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
