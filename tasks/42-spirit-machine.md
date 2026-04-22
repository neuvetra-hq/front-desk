---
status: done
---
# Task 42: SpiritMachine

## What was done
- Added `spiritMachine` XState v5 parallel machine with 4 regions: attractor, visual, motion, audio
- `SpiritEngine.transition()` removed; replaced by `setVisualTarget()`, `setAttractorTarget()`, `setSurge()`, `setMuted()`
- `appMachine` audio region removed — `spiritMachine` is single source of truth for mute state
- AppLayout fires `SET_PRESET` events on route change instead of calling engine directly
- Named anchors for `MOVE_TO`: topLeft, topRight, bottomLeft, bottomRight, center, top, bottom
- `PLAY_SFX` silently dropped when audio locked or muted (no handler in those states)
- 5 Playwright tests pass for /app route including new mute button tests
- `useActorRef` from `@xstate/react` used instead of manual actor lifecycle (React Strict Mode safe)

## Key decisions
- Closure pattern: `createSpiritMachine(engineRef)` captures engine ref; actions call `engineRef.current?.method()`
- Dynamic delays declared in `setup({ delays: { ... } })` and referenced by name in `after: { delayName }`
- SET_PRESET while transitioning is re-entrant (snapshots mid-lerp as new from)
- AudioEngine.toggleMute() replaced by setMuted(bool) — machine owns the boolean
- Mute button uses `aria-hidden={!audioUnlocked || undefined}` so Playwright's `getByRole` can't find it when locked
- Loader test uses `waitUntil: "domcontentloaded"` to avoid Vite cold-start race condition
