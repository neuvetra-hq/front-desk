import { Link } from "react-router"
import { Button, buttonVariants } from "@/components/ui/button"
import { Container } from "@/components/layout/Container"
import { CTA_BANNER } from "@/constants/landing"

export function CTABanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 py-24">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white opacity-5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-orange-300 opacity-10 blur-3xl" />

      <Container className="relative text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
          {CTA_BANNER.headline}
        </h2>
        <p className="mt-4 text-indigo-200">{CTA_BANNER.subheadline}</p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/login"
            className={buttonVariants({ size: "lg" }) + " w-full bg-white text-indigo-700 hover:bg-indigo-50 sm:w-auto px-8 font-semibold"}
          >
            {CTA_BANNER.primaryCTA}
          </Link>
          <Button
            size="lg"
            variant="outline"
            className="w-full border-indigo-400 text-white hover:bg-indigo-800 sm:w-auto px-8"
          >
            {CTA_BANNER.secondaryCTA}
          </Button>
        </div>
        <p className="mt-6 text-sm text-indigo-300">No credit card required · Cancel anytime</p>
      </Container>
    </section>
  )
}
