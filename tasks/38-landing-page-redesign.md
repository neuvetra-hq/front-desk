---
status: done
---
# Task 38: Landing Page Redesign + Pricing Update

## What was done
- Pricing updated: Starter 150→200 min, Growth 400→500 min, overages lowered ($0.25→$0.20, $0.20→$0.17, $0.18→$0.16)
- Hero rewritten: outcome-first + pain stat ("1 in 5 calls missed"), three punchy lines ending with "Zero revenue left behind" in primary color
- Products section removed from LandingPage (3 "coming soon" cards hurt credibility)
- New SocialProof strip: industry badges + 5-star rating, right after Hero
- Features: emoji replaced with Lucide icons (Phone, Brain, CalendarCheck, Globe, FileText, Bell)
- Comparison table: new "Appointment booking" row showing our calendar sync differentiator
- New FAQ section: 5 questions answering core small-business objections, uses Accordion (id="faq")
- CTA Banner: new copy — "Your first AI-answered call is 10 minutes away."
- Footer: dead links removed, Contact → mailto:hello@neuvetra.com, coming-soon products shown as plain text
- Navbar: mobile hamburger menu (Sheet) added, Products nav link removed
- All components migrated to shadcn semantic tokens — no hardcoded indigo/neutral palette values

## Key decisions
- Price points ($49/$99/$199) unchanged — competitive, not racing to bottom
- Rosie AI does unlimited at $49 but no real appointment booking — our differentiator is calendar sync
- HowItWorks dark section uses bg-foreground/text-background for inversion (single token, themeable)
- Amber star colors (fill-amber-400) kept — status/decorative, not brand colors
- Products.tsx component file kept but not rendered — may be useful for a future roadmap page
