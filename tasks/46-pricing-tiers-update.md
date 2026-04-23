---
status: done
---

# Task 46: Update PRICING_TIERS Constants

## What was done

Updated `apps/web/src/contexts/constants/landing.ts` to replace the `PRICING_TIERS` export with the new pricing structure:

- **Added `annualPrice` field** to all three tiers: Starter (39), Growth (79), Pro (159)
- **Added `goodFor` string** to each tier describing the ideal customer profile
- **Growth tier changes:**
  - Overage rate updated from 0.17 to 0.18
  - Added "Full-day AI coverage, including business hours" feature
  - Reordered features for clarity
- **Pro tier changes:**
  - Description changed from "For high-volume or multi-location businesses" to "For high-volume businesses"
  - Removed "Up to 3 phone numbers / locations" feature
  - Added "1 local phone number" (matching other tiers)
  - Added "Full-day AI coverage, including business hours" feature
  - Replaced "Dedicated onboarding call" and "Priority support" with "Personalized AI training and setup call" and "Priority support via phone and email"
- **Starter tier feature formatting:** spacing updated from "200 minutes/month" to "200 minutes / month" for consistency

All other exports in the file (NAV_LINKS, HERO, PRODUCTS, FRONT_DESK_FEATURES, HOW_IT_WORKS, STATS, WHY_NEUVETRA, INDUSTRIES, COMPARISON, TESTIMONIALS, CTA_BANNER, FAQ_ITEMS, FOOTER) remain untouched.

## Key decisions

- Maintained object field order for readability
- Ensured feature consistency across tiers (spacing, formatting)
- No changes to pricing logic — only new fields added and text updates
- All 13 other exports verified intact after replacement
