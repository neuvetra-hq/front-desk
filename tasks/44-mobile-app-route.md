---
status: done
---

# PRD: Mobile-Responsive /app Route (Task 44)

## Problem

The `/app` route (the Spirit WebGPU experience) is broken on mobile. On portrait iPhone,
the bottom navigation is hidden behind Safari's browser toolbar, and the five nav items
wrap to two rows. On the home page the "FRONT DESK" title is oversized and wraps. The
`h-screen` / `100vh` sizing does not account for mobile browser chrome, causing the
layout to bleed. Mobile visitors get a broken first impression of the product.

## Goals

- [ ] The `/app` route fits entirely within the visible viewport on any iPhone (portrait and landscape), with no scrolling required
- [ ] Mobile users can access all navigation links via a hamburger menu
- [ ] Navigation links are defined in one place (`routes.ts`) and automatically appear in both desktop and mobile nav
- [ ] All tappable elements meet the 44px minimum touch target
- [ ] Font sizes look good on mobile portrait without wrapping or overflowing

## Non-Goals

- Changes to the desktop layout (bottom nav, mute button position, page transitions)
- Changes to the Spirit engine or particle presets
- Adding new routes or page content
- The marketing landing page (`/`, `/industries/:slug`, etc.)
- The dashboard (`/dashboard`)

## User Stories

- As a mobile visitor, when I open `/app` on my iPhone, I expect the layout to fill my screen exactly — no scrolling, no content hidden behind the browser toolbar
- As a mobile visitor, I want to tap a hamburger button to see all navigation links so that I can move between pages without a broken wrapping nav
- As a mobile visitor, I expect the menu overlay to slide up and down with the same feel as the page transitions so that the experience feels consistent
- As a mobile visitor, I expect to tap a nav link in the overlay and be taken to that page while the overlay closes automatically
- As a developer adding a new `/app/team` route to `routes.ts`, I expect it to appear in both the desktop bottom nav and the mobile overlay without any additional changes
- As a mobile visitor, I expect the "FRONT DESK" heading and all other page titles to be comfortably readable without wrapping on a standard iPhone screen

## Key Decisions

| Decision | Choice | Rejected alternatives |
|----------|--------|-----------------------|
| Viewport height unit | `h-[100dvh]` (dynamic viewport height) | `h-screen` / `100vh` — excluded browser chrome, causing bleed |
| Mobile nav pattern | Hamburger → full-screen opaque overlay | Bottom tab bar (too dense on small screens); persistent mini nav |
| Hamburger + mute placement on mobile | Both at top-right together | Hamburger top-left, mute top-right — split feels inconsistent on mobile |
| Overlay animation | Same `SLIDE` constants as page transitions (slide up / slide down) | Custom animation — would break visual consistency |
| Overlay close trigger | X button (hamburger transforms to X) + tapping a nav link | Tap-outside — unreliable on full-screen overlays |
| Nav link layout in overlay | Vertically stacked, left-aligned | Centered — less readable, harder to tap on small screens |
| Overlay background | Fully opaque `#0b0c0d` | Semi-transparent — deferred for now |
| Single source of truth for routes | Existing `APP_ROUTES` in `routes.ts` | Separate JSON config — unnecessary duplication |

## Constraints

- **Technical:** XState v5 / `fromCallback` pattern — no changes to machines
- **Technical:** `data-testid="app-loader"` on the overlay must not be removed (Playwright tests reference it)
- **Technical:** `SLIDE` animation constants in `AppLayout.tsx` must be reused for the mobile menu overlay — not duplicated
- **Technical:** Safe area insets via `env(safe-area-inset-bottom)` and `env(safe-area-inset-top)` for notch/home-bar devices
- **Product:** Desktop experience must be pixel-identical before and after

## Modules Affected

```
Modified: apps/web/src/components/layout/AppLayout.tsx
  — h-[100dvh] on root container
  — Safe area insets on mute button and bottom nav
  — Bottom nav hidden on mobile (md:flex)
  — Mobile: mute + hamburger together at top-right (hidden on md+)
  — Hamburger toggles overlay open/closed; icon swaps to X when open
  — AppMobileMenu rendered conditionally via AnimatePresence

New:      apps/web/src/components/layout/AppMobileMenu.tsx
  — Full-screen opaque overlay using same SLIDE animation
  — Reads APP_ROUTES from routes.ts
  — Vertically stacked, left-aligned nav links
  — Active link highlighted same as desktop NavItem
  — Accepts onClose callback; calls it after navigation

Modified: apps/web/src/pages/app/AppHomePage.tsx
  — clamp values adjusted so "FRONT DESK" doesn't wrap on portrait iPhone

Modified: apps/web/src/pages/app/AppHowItWorksPage.tsx
Modified: apps/web/src/pages/app/AppPricingPage.tsx
Modified: apps/web/src/pages/app/AppSignInPage.tsx
Modified: apps/web/src/pages/app/AppGetStartedPage.tsx
  — clamp values + subtitle font size adjusted for mobile legibility
```

## Success Criteria

1. On portrait iPhone (390px wide), no scrolling is needed on any `/app` route
2. On landscape iPhone (~844px wide, ~390px tall), no scrolling is needed on any `/app` route
3. Bottom nav is hidden on mobile; hamburger + mute buttons appear at top-right
4. Tapping hamburger opens the overlay (slides up); tapping X or a link closes it (slides down)
5. Tapping a nav link in the overlay navigates to that page
6. Adding a new entry to `APP_ROUTES` in `routes.ts` makes it appear in both desktop nav and mobile overlay
7. `bun run build` in `apps/web` exits with no TypeScript errors
8. Existing Playwright E2E suite passes (`bun run test:e2e` in `apps/web`)
9. `data-testid="app-loader"` remains on the loader overlay

## Open Questions

- None — all decisions made. Implementation can proceed directly.
