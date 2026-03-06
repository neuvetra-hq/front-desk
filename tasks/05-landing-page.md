---
status: done
---

# Task 05: Landing Page (`apps/web`)

## Setup
- [x] Create this task file
- [x] Add `@` path alias to `tsconfig.app.json` + `vite.config.ts`
- [x] Install and init shadcn/ui
- [x] Add shadcn components: `button`, `badge`

## File Structure
- [x] `src/constants/landing.ts` — all copy (headlines, features, steps, nav links)
- [x] `src/components/layout/Container.tsx`
- [x] `src/components/landing/Navbar.tsx`
- [x] `src/components/landing/Hero.tsx`
- [x] `src/components/landing/Features.tsx`
- [x] `src/components/landing/HowItWorks.tsx`
- [x] `src/components/landing/CTABanner.tsx`
- [x] `src/components/landing/Footer.tsx`
- [x] `src/pages/LandingPage.tsx`

## Routing
- [x] Update `App.tsx` — `/` renders `LandingPage`

## Acceptance Criteria
- `bun run dev` in `apps/web` shows a polished landing page at `http://localhost:5173`
- All copy editable from `constants/landing.ts` only
- shadcn/ui Button used consistently throughout
- No inline styles; Tailwind v4 utility classes only
- Responsive: looks good on mobile and desktop
