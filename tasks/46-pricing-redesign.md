---
status: done
---
# Task 46: Pricing Section Redesign

## What was done
- Changed section background from bg-muted to bg-foreground (matches HowItWorks)
- Replaced shadcn ToggleGroup with custom sliding-indicator tab toggle (useLayoutEffect-based)
- Rectangular cards, no border-radius anywhere, violet accent on popular (Growth)
- Card layout: plan name, price inline with /month, feature list, overage, good-for note
- Enterprise bar below cards grid
- Single CTA button, uppercase thin style matching toggle tabs
- Updated PRICING_TIERS: annualPrice, goodFor, Growth overage 0.17 to 0.18, Pro features updated

## Key decisions
- No border-radius (design rule for this section)
- Violet accent used instead of primary green to differentiate pricing section visually
- Growth differentiated only by subtle violet tint, no badge or elevation
- Header structure preserved exactly from original; only color tokens updated for dark background
- useLayoutEffect instead of useEffect to prevent first-render indicator flicker
