import { Navbar } from "@/components/landing/Navbar"
import { Hero } from "@/components/landing/Hero"
import { Products } from "@/components/landing/Products"
import { Features } from "@/components/landing/Features"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { Industries } from "@/components/landing/Industries"
import { WhyNeuvetra } from "@/components/landing/WhyNeuvetra"
import { ComparisonTable } from "@/components/landing/ComparisonTable"
import { Pricing } from "@/components/landing/Pricing"
import { Testimonials } from "@/components/landing/Testimonials"
import { CTABanner } from "@/components/landing/CTABanner"
import { Footer } from "@/components/landing/Footer"

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Products />
        <Features />
        <HowItWorks />
        <Industries />
        <WhyNeuvetra />
        <ComparisonTable />
        <Pricing />
        <Testimonials />
        <CTABanner />
      </main>
      <Footer />
    </div>
  )
}
