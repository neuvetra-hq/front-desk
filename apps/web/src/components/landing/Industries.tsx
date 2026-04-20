"use client"

import { useState } from "react"
import { Link } from "react-router"
import { ArrowRight } from "lucide-react"
import { Container } from "@/components/layout/Container"
import industriesData from "@/data/industries.json"
import type { Industry } from "@/types/industry"

const CATEGORY_GRADIENTS: Record<string, string> = {
  "home-services": "from-blue-900 to-blue-700",
  "healthcare": "from-teal-900 to-teal-700",
  "beauty-wellness": "from-purple-900 to-purple-700",
  "professional": "from-slate-900 to-slate-700",
  "automotive": "from-orange-900 to-orange-700",
}

function IndustryCard({ industry }: { industry: Industry }) {
  const gradient = CATEGORY_GRADIENTS[industry.category] ?? "from-neutral-900 to-neutral-700"

  return (
    <Link
      to={`/industries/${industry.slug}`}
      className="group relative block overflow-hidden rounded-2xl"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      <img
        src={industry.thumbnail}
        alt={industry.name}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        onError={(e) => { e.currentTarget.style.display = "none" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 transition-all duration-300 group-hover:from-black/90 group-hover:via-black/40" />
      <div className="relative flex h-52 flex-col justify-end p-5">
        <h3 className="text-base font-bold text-white">{industry.name}</h3>
        <p className="mt-1.5 max-h-0 overflow-hidden text-xs leading-relaxed text-white/80 transition-all duration-300 group-hover:max-h-16">
          {industry.painHook}
        </p>
        <div className="mt-2 flex items-center gap-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="text-xs font-semibold text-white">Learn more</span>
          <ArrowRight className="size-3 text-white" />
        </div>
      </div>
    </Link>
  )
}

export function Industries() {
  const [activeCategory, setActiveCategory] = useState("all")

  const filtered = (activeCategory === "all"
    ? industriesData.industries
    : industriesData.industries.filter((i) => i.category === activeCategory)
  ) as Industry[]

  return (
    <section id="industries" className="bg-background py-24 md:py-32">
      <Container>
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            Industries
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            Built for your industry.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            If your phone rings and missing it costs you a customer, Front Desk is for you.
          </p>
        </div>

        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {industriesData.categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((industry) => (
            <IndustryCard key={industry.id} industry={industry} />
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Don't see your industry?{" "}
          <a href="mailto:hello@neuvetra.com" className="text-primary hover:underline">
            Contact us
          </a>{" "}
          — if your phone rings and missing it costs money, we can help.
        </p>
      </Container>
    </section>
  )
}
