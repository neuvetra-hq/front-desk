import { Container } from "@/components/layout/Container"
import { TESTIMONIALS } from "@/constants/landing"

export function Testimonials() {
  return (
    <section className="bg-gradient-to-br from-orange-50 to-amber-50 py-24">
      <Container>
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
            Customer stories
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">
            Real businesses, real results
          </h2>
          <p className="mt-4 text-neutral-500">
            From dental offices to plumbers — here's what our customers are saying.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map(({ quote, name, business, stars }) => (
            <div
              key={name}
              className="flex flex-col rounded-2xl border border-orange-100 bg-white p-7 shadow-sm"
            >
              {/* Stars */}
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: stars }).map((_, i) => (
                  <svg key={i} className="h-4 w-4 fill-amber-400 text-amber-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.163c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.951-.69l1.286-3.957z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="flex-1 text-sm leading-relaxed text-neutral-600">"{quote}"</p>

              {/* Attribution */}
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                  {name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{name}</p>
                  <p className="text-xs text-neutral-500">{business}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
