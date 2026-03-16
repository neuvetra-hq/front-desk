---
status: done
---

# Task 11: Landing Page Redesign

Upgrade the landing page from a basic placeholder to a high-converting marketing page.
Inspired by best-in-class AI SaaS landing pages. Adapted for our target market:
small businesses (medical, dental, spa, salon, plumbing, legal, real estate).

## What's changing

The component structure stays the same. We are:
- Replacing / upgrading copy in `constants/landing.ts`
- Adding new sections as new components
- Not changing the routing or page shell

---

## New Page Structure

```
Navbar
Hero                  ← upgrade: stats strip + stronger headline
StatsBar              ← NEW: 3 big numbers that sell
Features              ← upgrade: sharper copy, remove emoji icons → clean SVG icons
HowItWorks            ← upgrade: 5 stages with visual flow instead of 3 plain steps
Industries            ← NEW: show the business types we serve with icons
ComparisonTable       ← NEW: Front Desk vs. hiring staff vs. answering service
Testimonials          ← NEW: 3 customer quote cards with name/business/result
CTABanner             ← keep, upgrade copy
Footer                ← keep as-is
```

---

## Section Details

### Hero
- Headline: "Your business never stops. Neither does your front desk."
- Subheadline: "Front Desk is an AI receptionist that answers every call 24/7, handles FAQs, and books appointments — for a fraction of what a full-time hire costs."
- Primary CTA: "Get started free" → /login
- Secondary CTA: "See how it works" → #how-it-works
- Below CTAs: "No credit card required · Setup in under 10 minutes · Cancel anytime"

### StatsBar (NEW)
Three metrics in a horizontal strip below the hero, dark background:
- **< 1 second** — Average answer time
- **24/7** — Always available, no sick days
- **~$0.10/min** — vs. $25+/hr for a receptionist

### Features
Keep 6-card grid. Replace emoji icons with small inline SVG icons (monochrome).
Updated copy:
1. **Never miss a call** — Picks up instantly, every time. No hold music, no voicemail, no missed revenue.
2. **Knows your business** — Train it on your FAQs, hours, services, and team. It answers like a real team member.
3. **Books appointments** — Callers schedule, reschedule, or cancel over the phone. Fully automated.
4. **Works in any language** — Responds in the caller's language automatically. No extra setup.
5. **Every call logged** — Transcripts and summaries for every conversation, searchable from your dashboard.
6. **Your number, your brand** — Use your existing number or get a new local one. Sounds like your business, not a robot.

### HowItWorks — 5 stages with visual connector
```
Sign up → Tell it about your business → Get your number → Go live → Review your calls
```
1. **Create your account** — Enter your mobile number and verify with a code. Takes 30 seconds.
2. **Describe your business** — Name, type, and the area code you want. That's all we need to start.
3. **Get your AI number** — We provision a real local phone number instantly. No paperwork.
4. **Go live** — Your AI receptionist is active. Every call answered, every question handled.
5. **Stay in the loop** — Review call transcripts and summaries from your dashboard any time.

### Industries (NEW)
Section headline: "Built for the businesses that keep communities running"
Show 8 tiles in a grid, each with a simple icon and label:
- Medical / Healthcare
- Dental
- MedSpa & Wellness
- Salon & Beauty
- Plumbing & Trades
- Legal
- Real Estate
- And more...

### ComparisonTable (NEW)
Headline: "Why Front Desk beats the alternatives"
3-column table comparing across 5 rows:

|  | **Front Desk AI** | Hiring a receptionist | Answering service |
|---|---|---|---|
| Available 24/7 | ✅ | ❌ | Partial |
| Cost / month | ~$49 | $3,000+ | $300–$600 |
| Setup time | < 10 min | Weeks | Days |
| Knows your business | ✅ Trained by you | ✅ | ❌ Generic scripts |
| Call transcripts | ✅ Every call | ❌ | Partial |

Front Desk column highlighted (dark background, bold).

### Testimonials (NEW)
3 cards in a grid. Placeholder copy to be replaced with real quotes later:

1. **Dr. Sarah M., Family Dental Practice**
   "We used to miss 20–30% of calls during peak hours. Now every call gets answered. We've seen a noticeable uptick in new patient bookings."

2. **Marcus T., T&R Plumbing**
   "I run a small crew — I can't have someone sitting by the phone all day. Front Desk handles it while we're on jobs. Game changer."

3. **Elena V., Lumina MedSpa**
   "Setup took maybe 10 minutes. The AI knows our services, our pricing, our hours. Clients don't even know it's not a person."

Each card: quote, name, business type, subtle star rating (5 stars).

---

## Files to change

- [ ] `constants/landing.ts` — update HERO, FEATURES, HOW_IT_WORKS, CTA_BANNER copy
- [ ] `components/landing/Hero.tsx` — update layout, stronger subheadline, social proof strip
- [ ] `components/landing/Features.tsx` — swap emoji for inline SVG icons
- [ ] `components/landing/HowItWorks.tsx` — expand to 5 stages with better visual flow
- [ ] `components/landing/StatsBar.tsx` — NEW component
- [ ] `components/landing/Industries.tsx` — NEW component
- [ ] `components/landing/ComparisonTable.tsx` — NEW component
- [ ] `components/landing/Testimonials.tsx` — NEW component
- [ ] `pages/LandingPage.tsx` — add new sections in order

## Acceptance Criteria
- All new sections render correctly on mobile and desktop
- CTA buttons link to /login
- No placeholder "lorem ipsum" text
- Consistent visual style (neutral palette, clean typography, no emoji in production sections)
- Page loads fast — no heavy images or animations
