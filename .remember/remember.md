# Handoff

## State
Built out the `/app` Spirit experience: persistent canvas + sound button in `AppLayout`, per-route presets (green/purple/teal/amber), Framer Motion slide transitions with `FrozenRoute` to freeze outlet content during exit. Surge/meteor kick fires on URL change (not page mount) so it syncs with slide-down. `TRANSITION_DURATION_MS=1400ms`, `TRANSITION_BURST=0.55`, kick=420 XZ / 100 Y. All committed on master (latest: `af4c6a9`).

## Next
1. Build out actual content for stub pages: `/app/how-it-works`, `/app/pricing`, `/app/sign-in`, `/app/get-started` (all show "Coming soon")
2. Wire `/app/sign-in` → real login flow and `/app/get-started` → real signup flow
3. Consider adding a logo/wordmark to `/app` home instead of just text

## Context
- `AppLayout` owns all Spirit preset transitions via `ROUTE_PRESET` map — sub-pages have no Spirit code
- `FrozenRoute` pattern is critical: without it, `<Outlet>` swaps content before exit animation plays
- Particle count is 100×80=8000 (was 65k); color lerp rate is 0.12/frame
- `apps/web/src/pages/AppPage.tsx` still exists but is unused — safe to delete
