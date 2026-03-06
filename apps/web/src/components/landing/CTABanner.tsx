import { Button } from "@/components/ui/button"
import { Container } from "@/components/layout/Container"
import { CTA_BANNER } from "@/constants/landing"

export function CTABanner() {
  return (
    <section className="bg-neutral-900 py-24">
      <Container className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
          {CTA_BANNER.headline}
        </h2>
        <p className="mt-4 text-neutral-400">{CTA_BANNER.subheadline}</p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" className="w-full bg-white text-neutral-900 hover:bg-neutral-100 sm:w-auto">
            {CTA_BANNER.primaryCTA}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full border-neutral-600 text-white hover:bg-neutral-800 sm:w-auto"
          >
            {CTA_BANNER.secondaryCTA}
          </Button>
        </div>
      </Container>
    </section>
  )
}
