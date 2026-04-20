import { buttonVariants } from "@/components/ui/button"
import { Container } from "@/components/layout/Container"
import { HERO, STATS } from "@/constants/landing"

export function Hero() {
  const headlineLines = HERO.headline.split("\n")

  return (
    <section className="relative overflow-hidden bg-background py-24 md:py-36">
      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      {/* Accent blobs */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />

      <Container className="relative">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {HERO.badge}
            </span>
          </div>

          {/* Headline — last line gets primary color */}
          <h1 className="text-5xl font-semibold tracking-tight text-foreground md:text-6xl lg:text-7xl leading-[1.05]">
            {headlineLines.map((line, i) => (
              <span
                key={i}
                className={`block ${i === headlineLines.length - 1 ? "text-primary" : ""}`}
              >
                {line}
              </span>
            ))}
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            {HERO.subheadline}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/signup"
              className={
                buttonVariants({ size: "lg" }) +
                " w-full bg-foreground text-background hover:bg-foreground/80 sm:w-auto px-8 rounded-xl"
              }
            >
              {HERO.primaryCTA}
            </a>
            <a
              href="#how-it-works"
              className={
                buttonVariants({ size: "lg", variant: "outline" }) +
                " w-full border-border text-foreground hover:bg-muted sm:w-auto px-8 rounded-xl"
              }
            >
              {HERO.secondaryCTA}
            </a>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">{HERO.trust}</p>
        </div>

        {/* Stats bar */}
        <div className="mx-auto mt-20 grid max-w-2xl grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-muted shadow-sm">
          {STATS.map(({ value, label }) => (
            <div key={label} className="px-6 py-6 text-center">
              <p className="text-3xl font-bold text-foreground">{value}</p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
