---
status: done
---

# Task 14: Neuvetra Landing Page (neuvetra.com)

Redesign the landing page to position **Neuvetra** as the company and **Front Desk** as its
flagship product. The page lives at `neuvetra.com` and is separate from the app at `neuvetra.com`.

## Messaging Hierarchy

- **Company:** Neuvetra — builds AI tools for local service businesses
- **Product:** Front Desk — AI receptionist that never misses a call
- Tagline direction: "Neuvetra makes AI that works for you" → hero product = Front Desk

## Page Structure

### Hero
- Neuvetra wordmark / logo
- Headline: something like "Never miss another customer call"
- Subheadline: Front Desk handles your phones 24/7 — answers FAQs, books appointments, texts your customers
- CTA button: "Get started free" → `https://neuvetra.com/signup`

### Product Section — Front Desk
- What it does (3 bullets): answers calls, books appointments, sends SMS alerts
- How it works: set up call forwarding → AI answers → you get notified
- Visual: simple flow diagram or phone mockup

### Social Proof / Trust
- "Built for: MedSpas, Salons, Plumbers, Dentists, Law Offices…"
- Pricing teaser (see pricing-strategy.md)

### Footer
- © Neuvetra / Birgani Enterprises Inc.
- Links: Privacy Policy, Terms of Service, Contact
- "Powered by Twilio + Retell AI"

## Technical Notes
- This can be a separate Vercel project pointed at `neuvetra.com`
- Can reuse the existing `apps/web` landing page route (`/`) OR be a standalone static site
- Preferred: keep it in `apps/web` at route `/` — already has TailwindCSS v4 + React

## Acceptance Criteria
- [ ] neuvetra.com loads a polished company page
- [ ] Front Desk is clearly the hero product
- [ ] CTA links to `neuvetra.com/signup`
- [ ] Mobile responsive
- [ ] Footer has company name and basic legal links
