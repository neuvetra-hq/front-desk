---
status: todo
---

# PRD: XState Architecture Cleanup (Task 43)

## Problem

The XState implementation was built incrementally across several tasks (40–42), resulting
in three friction points that make the codebase harder to extend and test:

1. The same five app routes are encoded in three separate places — `NAV_LINKS`,
   `ROUTE_PRESET`, and ten guard conditions inside `appMachine`. Adding a sixth route
   means editing three files and easy to miss one.

2. The `appMachine` view region tracks six named states (`home`, `howItWorks`,
   `pricing`, `signIn`, `getStarted`, `loading`) but only `loading` is ever queried by
   any component. The five page states are dead weight that grow with every new route.

3. The audio unlock trigger (three DOM event listeners) lives in `AppLayoutInner` even
   though the machine owns the `audio.locked` concept. Testing the unlock path requires
   rendering the component.

4. `AppLayout` mixes Three.js engine creation, XState machine wiring, actor context
   provision, and UI rendering into one component, making each concern harder to reason
   about in isolation.

## Goals

- [ ] A single route registry is the only place that knows the app's route list
- [ ] `appMachine` view region reduced to two states: `loading` and `active`
- [ ] Audio unlock DOM listeners are owned and cleaned up by `spiritMachine`, not a component
- [ ] `AppLayout` is a pure rendering component; engine + machine wiring lives in a
      dedicated provider

## Non-Goals

- Changes to routing behavior — pages should load and transition identically before and
  after
- Changes to the spirit engine (`engine.ts`) internals
- Changes to preset definitions (`spirit-presets.ts`)
- New routes or navigation items
- Test coverage additions (existing Playwright tests must stay green; no new tests
  required for this refactor)

## User Stories

- As a developer adding a new `/app/team` page, I want to edit one file to register the
  route so that the nav link, spirit preset, and machine view state all update
  automatically.

- As a developer reading `appMachine.ts`, I want the view region to clearly express its
  purpose (block rendering until the engine is ready) so that I don't have to trace dead
  states to understand what they do.

- As a developer reading `spiritMachine.ts`, I want the audio unlock listener defined
  alongside the `locked` state so that the full audio lifecycle is visible in one place.

- As a developer reading `AppLayout.tsx`, I want to see a UI tree (nav, outlet, overlay)
  without engine initialization code mixed in so that each file has one clear job.

- As a developer running the app, I expect the loading overlay, page transitions, spirit
  presets, and audio unlock to behave identically to before — no visible regression.

## Key Decisions

| Decision | Choice | Rejected alternatives |
|----------|--------|-----------------------|
| Route registry format | Array of `{ path, label, preset, end? }` objects; derive lookups via `Object.fromEntries` | Separate maps per concern (keeps duplication) |
| appMachine view states after Spirit ready | Single `active` state; React Router owns route display | Keep named page states, just derive them from the registry (still dead state, still queried nowhere) |
| Audio unlock actor location | Inline `fromCallback` actor inside `spiritMachine.ts` invoked from `audio.locked` | Standalone file `audioUnlockActor.ts` (unnecessary for one actor) |
| Provider/layout split boundary | `AppSpiritProvider` wraps engine + machine + context; `AppLayout` wraps visual shell | Keep both in one file but separate functions (harder to test independently) |

## Constraints

- **Technical:** XState v5 (`setup()` pattern). `fromCallback` actors must return a
  cleanup function.
- **Technical:** `createSpiritMachine` is a factory that closes over `engineRef` — this
  pattern stays unchanged; only where the factory is called and how the actor is provided
  changes.
- **Technical:** The `containerRef` div (Three.js canvas mount point) must stay inside
  `AppSpiritProvider` so the ref is in scope alongside the engine.
- **Regression:** `data-testid="app-loader"` on the overlay must not be removed
  (Playwright tests reference it).

## Modules Affected

### Phase 1 — Route registry + appMachine view simplification

```
New:      apps/web/src/pages/app/routes.ts
Modified: apps/web/src/components/layout/AppLayout.tsx
Modified: apps/web/src/pages/app/machine/appMachine.ts
```

**`routes.ts`** — exports `APP_ROUTES` array and `ROUTE_BY_PATH` lookup:

```ts
export const APP_ROUTES = [
  { path: "/app",              label: "Home",         preset: "default",    end: true },
  { path: "/app/how-it-works", label: "How It Works", preset: "howItWorks" },
  { path: "/app/pricing",      label: "Pricing",      preset: "pricing"    },
  { path: "/app/sign-in",      label: "Sign In",      preset: "signIn"     },
  { path: "/app/get-started",  label: "Get Started",  preset: "getStarted" },
] as const
export type AppRouteDef = typeof APP_ROUTES[number]
export const ROUTE_BY_PATH = Object.fromEntries(APP_ROUTES.map((r) => [r.path, r]))
```

**`AppLayout.tsx`** — `NAV_LINKS` and `ROUTE_PRESET` become derived constants:

```ts
import { APP_ROUTES, ROUTE_BY_PATH } from "@/pages/app/routes"
// NAV_LINKS gone — render from APP_ROUTES directly
// ROUTE_PRESET lookup becomes: ROUTE_BY_PATH[location.pathname]?.preset
```

**`appMachine.ts`** — view region collapses to two states:

```ts
view: {
  initial: "loading",
  states: {
    loading: {
      on: {
        ROUTE_CHANGED: { actions: "setRoute" },
        SPIRIT_READY:  { target: "active" },
      },
    },
    active: {},
  },
},
```

The ten `ROUTE_CHANGED` guard conditions and the five named page states are removed.
The `SPIRIT_READY` guard chain (pick the right page state) is removed.

---

### Phase 2 — Audio unlock actor inside spiritMachine

```
Modified: apps/web/src/lib/spirit/spiritMachine.ts
Modified: apps/web/src/components/layout/AppLayout.tsx   (remove listener block)
```

**`spiritMachine.ts`** — new actor registered in `setup()`, invoked from `audio.locked`:

```ts
actors: {
  listenForUserInteraction: fromCallback(({ sendBack }) => {
    const handle = () => sendBack({ type: "USER_INTERACTED" })
    document.addEventListener("click",      handle, { once: true })
    document.addEventListener("keydown",    handle, { once: true })
    document.addEventListener("touchstart", handle, { once: true })
    return () => {
      document.removeEventListener("click",      handle)
      document.removeEventListener("keydown",    handle)
      document.removeEventListener("touchstart", handle)
    }
  }),
},

// audio.locked state:
locked: {
  invoke: { src: "listenForUserInteraction" },
  on: { USER_INTERACTED: { target: "unlocked", actions: "unlockAudio" } },
},
```

**`AppLayout.tsx`** — the `useEffect` block with three `addEventListener` calls in
`AppLayoutInner` is deleted entirely.

---

### Phase 3 — Split AppLayout into provider + renderer

```
New:      apps/web/src/components/layout/AppSpiritProvider.tsx
Modified: apps/web/src/components/layout/AppLayout.tsx
```

**`AppSpiritProvider.tsx`** — owns all wiring:

```ts
export function AppSpiritProvider({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sendApp = useAppSend()
  const { engineRef } = useSpirit(containerRef, () => sendApp({ type: "SPIRIT_READY" }))
  const machineRef = useRef(createSpiritMachine(engineRef))
  const actor = useActorRef(machineRef.current)
  return (
    <SpiritActorContext.Provider value={actor}>
      <div ref={containerRef} className="absolute inset-0" />
      {children}
    </SpiritActorContext.Provider>
  )
}
```

**`AppLayout.tsx`** — becomes a pure UI shell:

```ts
export function AppLayout() {
  return (
    <AppSpiritProvider>
      <div className="relative w-screen h-screen overflow-hidden" style={...}>
        <AppLayoutInner />
        <AppLoaderOverlay />
      </div>
    </AppSpiritProvider>
  )
}
```

Imports of `useSpirit`, `useActorRef`, `createSpiritMachine`, `SpiritActorContext` move
to `AppSpiritProvider.tsx`.

## Success Criteria

1. `bun run build` in `apps/web` exits with no TypeScript errors
2. The Playwright E2E suite passes (`bun run test:e2e` in `apps/web`)
3. The app loads in the browser: loading overlay appears then fades, nav renders, spirit
   particles animate, page transitions work, audio unlocks on first click
4. Adding a hypothetical sixth route requires editing only `routes.ts` (verify by
   inspection, not code)
5. `appMachine.ts` view region contains exactly two states: `loading` and `active`
6. `AppLayout.tsx` imports neither `useSpirit` nor `createSpiritMachine`

## Open Questions

- None — all decisions made. Implementation can proceed directly.
