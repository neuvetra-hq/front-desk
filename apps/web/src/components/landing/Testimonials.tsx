import { Star } from "lucide-react"
import { Container } from "@/components/layout/Container"
import { TESTIMONIALS } from "@/constants/landing"

export function Testimonials() {
  return (
    <section className="bg-white py-24 md:py-32">
      <Container>
        <div className="mb-16 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600 mb-3">Customer Stories</p>
          <h2 className="text-4xl font-semibold tracking-tight text-neutral-900 md:text-5xl">
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
                  <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
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
