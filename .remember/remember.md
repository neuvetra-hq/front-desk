# Handoff

## State
Task 41 (app loader) is fully implemented and merged to master. Three follow-up fixes committed (d3a1467): audio init decoupled from SPIRIT_READY, body background flash fixed, preset bgColors unified to `#0b0c0d`. Canvas is now transparent (`alpha: true`, `setClearColor(0,0)`) — bloom threshold raised to 0.15 and strength/radius pulled back across all presets to reduce the halo artifact. All 3 /app Playwright tests pass. No uncommitted changes.

## Next
No active task — Task 41 is done. Next task number is **42**.
User is happy with transparent canvas + bloom tweaks. May want further bloom dialing after visual review.

## Context
- Spirit canvas: `alpha: true`, clear color transparent — background gradient on parent div shows through
- `bloomThreshold: 0.15` on all presets (was 0.0) eliminates diffuse halo; user still reviewing
- `bun run preview` script added to `apps/web/package.json` for prod Lighthouse testing
- 13 pre-existing test failures in `calendar.spec.ts` + `call-logs.spec.ts` — not regressions
