---
status: done
---

# PRD: Actor-Model Event Routing (Task 45)

## Problem

Navigation side-effects in the `/app` route are currently orchestrated by React
`useEffect` hooks in `AppLayoutInner`, not by the state machines. When a route
changes, three separate effects fire independently — one sends `ROUTE_CHANGED`
to `appMachine`, one sends `SET_PRESET` to `spiritMachine`, and one sends
`PLAY_SFX` to `spiritMachine`. To understand what happens when a user navigates,
you must read a React component, not the machines. The machines are blind to each
other, and React is acting as the brain.

This violates the core principle of the actor model: one event enters the system,
machines decide what to do with it, and they forward messages to each other. A
developer (or an AI) reading `appMachine.ts` should be able to see the full
consequence of a route change without opening any React file.

## Goals

- [ ] A single React event dispatch (`ROUTE_CHANGED`) is the only thing `AppLayout`
      sends on navigation — all downstream side-effects are owned by machines
- [ ] `appMachine` forwards relevant events to `spiritMachine` via `sendTo`,
      making the machine definition the authoritative description of what happens
      on route change
- [ ] The "don't play nav SFX on first load" logic is encoded in machine states,
      not in a `useRef` flag inside a React component
- [ ] `spiritMachine` is fully decoupled from React Router — it only receives
      events from other actors or from the UI, never reads location directly

## Non-Goals

- Changes to `spiritMachine` internals (presets, audio states, SFX playback)
- Changes to `appMachine` auth or webgl regions
- New routes or navigation behavior
- Actor-model refactor of the dashboard or marketing routes
- Bi-directional communication (spirit → app) — deferred

## User Stories

- As a developer reading `appMachine.ts`, when I see `ROUTE_CHANGED`, I expect
  to read the complete list of consequences (update route, forward preset, play
  nav SFX) without opening any other file
- As a developer adding a new route side-effect (e.g. "dim lights on /sign-in"),
  I want to add one action to `ROUTE_CHANGED` in the machine so that the change
  is visible, testable, and does not touch any React component
- As a developer testing navigation behavior, I want to send `ROUTE_CHANGED` to
  `appMachine` in a unit test and assert that `spiritMachine` received the correct
  forwarded events, without mounting any React component
- As a developer reading the machine, I want the nav SFX skip-on-first-load
  rule to be visible as a state difference (`view.loading` vs `view.active`),
  not hidden in a React ref
- As a future developer, when I add a new actor (e.g. `analyticsMachine`), I
  want to register it with `appMachine` via a `REGISTER_*` event and have it
  receive forwarded messages using the same pattern already established here

## Key Decisions

| Decision | Choice | Rejected alternatives |
|----------|--------|-----------------------|
| How appMachine gets a reference to spiritActor | `REGISTER_SPIRIT` event sent by `AppSpiritProvider` after actor is created; ref stored in `AppContext` | Parent-child spawn (machine can't close over React's `engineRef`); prop drilling |
| How appMachine forwards events | `sendTo(({ context }) => context.spiritActorRef!, event)` XState v5 action | Direct import of spirit actor (creates coupling); React bridge (current, rejected) |
| Where "skip nav SFX on first load" lives | `view.loading` handles `ROUTE_CHANGED` without SFX; `view.active` includes SFX | `useRef` mounted flag in React (current, rejected); guard on event count |
| Where `SET_PRESET` route lookup lives | Inside `appMachine` action using `ROUTE_BY_PATH` | In `AppLayout` useEffect (current, rejected) |
| AppLayout useEffects after refactor | One effect: `ROUTE_CHANGED`. All others removed | Keep parallel effects for "simplicity" — rejected, they are the problem |

## Constraints

- **Technical:** XState v5 `sendTo` requires the target actor to be an
  `ActorRefFrom<...>` stored in context — not a string ID. The spirit actor is
  created inside React (`useActorRef`), so it must be passed to appMachine after
  creation via an event.
- **Technical:** `appMachine` is a singleton (`createActorContext`). `spiritActorRef`
  starts as `null` in context and is populated via `REGISTER_SPIRIT`. Actions that
  forward to spirit must guard against `null` (engine not yet ready).
- **Technical:** `ROUTE_BY_PATH` import in `appMachine.ts` introduces a dependency
  on `apps/web/src/pages/app/routes.ts` — this is acceptable (same package, stable).
- **Regression:** `data-testid="app-loader"`, mute button behavior, and all existing
  Playwright tests must remain green.

## Modules Affected

```
Modified: apps/web/src/pages/app/machine/appMachine.types.ts
  — Add spiritActorRef: SpiritActorRef | null to AppContext
  — Add REGISTER_SPIRIT event to AppEvent

Modified: apps/web/src/pages/app/machine/appMachine.ts
  — Import sendTo from xstate
  — Import ROUTE_BY_PATH, AUDIO from their respective modules
  — Add registerSpirit action (assign spiritActorRef)
  — Add forwardPreset action (sendTo spirit: SET_PRESET derived from pathname)
  — Add playNavSfx action (sendTo spirit: PLAY_SFX with AUDIO.nav)
  — view.loading: ROUTE_CHANGED → [setRoute, forwardPreset]  (no SFX)
  — view.active:  ROUTE_CHANGED → [setRoute, forwardPreset, playNavSfx]
  — Top-level: REGISTER_SPIRIT → registerSpirit

Modified: apps/web/src/components/layout/AppSpiritProvider.tsx
  — After useActorRef, send REGISTER_SPIRIT to appMachine with the actor ref

Modified: apps/web/src/components/layout/AppLayout.tsx
  — Remove SET_PRESET useEffect
  — Remove PLAY_SFX useEffect  
  — Remove mounted useRef (no longer needed)
  — Keep only: ROUTE_CHANGED useEffect + menu-close useEffect
```

## Success Criteria

1. `AppLayoutInner` has exactly one `useEffect` that fires on `location.pathname`
   (the `ROUTE_CHANGED` dispatch) — the `SET_PRESET` and `PLAY_SFX` effects are gone
2. `appMachine.ts` contains `forwardPreset` and `playNavSfx` actions visible in
   the `ROUTE_CHANGED` transition
3. `view.loading` and `view.active` handle `ROUTE_CHANGED` with different action
   lists — no `useRef` flag anywhere for this purpose
4. `bun run build` exits clean
5. All existing Playwright E2E tests pass (`bun run test:e2e`)
6. Navigating between `/app` routes still changes the spirit preset and plays the
   nav SFX (verified manually or via future machine unit tests)

## Open Questions

- None — all decisions made. Implementation can proceed.
