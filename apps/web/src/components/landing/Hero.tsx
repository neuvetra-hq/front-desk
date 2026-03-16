import { Link } from "react-router"
import { buttonVariants } from "@/components/ui/button"
import { Container } from "@/components/layout/Container"
import { HERO } from "@/constants/landing"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-orange-50 py-24 md:py-32">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-100 opacity-40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-orange-100 opacity-40 blur-3xl" />

      <Container className="relative text-center">
        {/* Badge */}
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-700">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
          {HERO.badge}
        </span>

        <h1 className="mx-auto max-w-3xl text-5xl font-bold tracking-tight text-neutral-900 md:text-6xl lg:text-7xl">
          {HERO.headline.split("\n").map((line, i, arr) => (
            <span key={i}>
              {i === arr.length - 1
                ? <span className="text-indigo-600">{line}</span>
                : <>{line}<br /></>
              }
            </span>
          ))}
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-neutral-500 md:text-xl">
          {HERO.subheadline}
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/login"
            className={buttonVariants({ size: "lg" }) + " w-full bg-indigo-600 text-white hover:bg-indigo-700 sm:w-auto px-8"}
          >
            {HERO.primaryCTA}
          </Link>
          <a
            href="#how-it-works"
            className={buttonVariants({ size: "lg", variant: "outline" }) + " w-full border-neutral-300 text-neutral-700 hover:bg-neutral-50 sm:w-auto px-8"}
          >
            {HERO.secondaryCTA}
          </a>
        </div>

        <p className="mt-8 text-sm text-neutral-400">{HERO.trust}</p>

        {/* Stats strip */}
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-3 divide-x divide-neutral-200 rounded-2xl border border-neutral-200 bg-white shadow-sm">
          {[
            { value: "< 1s", label: "Answer time" },
            { value: "24/7", label: "Always available" },
            { value: "80%", label: "Calls handled by AI" },
          ].map(({ value, label }) => (
            <div key={label} className="px-6 py-5">
              <p className="text-2xl font-bold text-indigo-600">{value}</p>
              <p className="mt-0.5 text-xs text-neutral-500">{label}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
