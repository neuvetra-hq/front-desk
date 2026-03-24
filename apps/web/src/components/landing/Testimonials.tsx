import { Container } from "@/components/layout/Container"
import { TESTIMONIALS } from "@/constants/landing"

export function Testimonials() {
  return (
    <section className="bg-white py-24 md:py-32">
      <Container>
        <div className="mb-16 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600 mb-3">Customer Stories</p>
          <h2 className="text-4xl font-black tracking-tight text-neutral-900 md:text-5xl">
            Real businesses. Real results.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-neutral-500">
            From dental offices to plumbers — here's what Neuvetra customers are saying.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map(({ quote, name, business, stars }) => (
            <div key={name} className="flex flex-col rounded-2xl border border-neutral-100 bg-neutral-50 p-7">
              {/* Stars */}
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: stars }).map((_, i) => (
                  <svg key={i} className="h-4 w-4 fill-amber-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.163c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.951-.69l1.286-3.957z" />
                  </svg>
                ))}
              </div>

              <p className="flex-1 text-sm leading-relaxed text-neutral-600">"{quote}"</p>

              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                  {name.split(" ").map((n: string) => n[0]).join("")}
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
