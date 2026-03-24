import { Link } from "react-router"
import { buttonVariants } from "@/components/ui/button"
import { Container } from "@/components/layout/Container"
import { HERO, STATS } from "@/constants/landing"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white py-24 md:py-36">
      {/* Subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Accent blobs */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-100 opacity-30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-violet-100 opacity-20 blur-3xl" />

      <Container className="relative">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            <span className="text-xs font-semibold text-neutral-600 uppercase tracking-widest">{HERO.badge}</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl font-black tracking-tight text-neutral-900 md:text-6xl lg:text-7xl leading-[1.05]">
            {HERO.headline.split("\n").map((line, i) => (
              <span key={i} className="block">{line}</span>
            ))}
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-neutral-500 md:text-xl">
            {HERO.subheadline}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#products"
              className={buttonVariants({ size: "lg" }) + " w-full bg-neutral-900 text-white hover:bg-neutral-700 sm:w-auto px-8 rounded-xl"}
            >
              {HERO.primaryCTA}
            </a>
            <a
              href="#how-it-works"
              className={buttonVariants({ size: "lg", variant: "outline" }) + " w-full border-neutral-200 text-neutral-700 hover:bg-neutral-50 sm:w-auto px-8 rounded-xl"}
            >
              {HERO.secondaryCTA}
            </a>
          </div>

          <p className="mt-6 text-sm text-neutral-400">{HERO.trust}</p>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-20 grid max-w-2xl grid-cols-3 divide-x divide-neutral-100 rounded-2xl border border-neutral-100 bg-neutral-50 shadow-sm">
          {STATS.map(({ value, label }) => (
            <div key={label} className="px-6 py-6 text-center">
              <p className="text-3xl font-black text-neutral-900">{value}</p>
              <p className="mt-1 text-xs font-medium text-neutral-500">{label}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
