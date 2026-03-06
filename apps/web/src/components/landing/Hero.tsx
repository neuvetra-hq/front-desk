import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Container } from "@/components/layout/Container"
import { HERO } from "@/constants/landing"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white py-24 md:py-32">
      {/* Subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <Container className="relative text-center">
        <Badge variant="secondary" className="mb-6 inline-flex">
          {HERO.badge}
        </Badge>

        <h1 className="mx-auto max-w-3xl text-5xl font-bold tracking-tight text-neutral-900 md:text-6xl lg:text-7xl">
          {HERO.headline.split("\n").map((line, i) => (
            <span key={i}>
              {line}
              {i < HERO.headline.split("\n").length - 1 && <br />}
            </span>
          ))}
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg text-neutral-500 md:text-xl">
          {HERO.subheadline}
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" className="w-full sm:w-auto">
            {HERO.primaryCTA}
          </Button>
          <Button size="lg" variant="outline" className="w-full sm:w-auto">
            {HERO.secondaryCTA}
          </Button>
        </div>

        {/* Social proof strip */}
        <p className="mt-10 text-sm text-neutral-400">
          Trusted by 500+ businesses · No credit card required · Setup in &lt;10 min
        </p>
      </Container>
    </section>
  )
}
