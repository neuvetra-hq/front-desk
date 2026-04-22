# Handoff

## State
XState v5 machine for `/app` (neuvetra.ai) is fully implemented and merged to master. All 11 tasks done across commits `2845a0f`–`eb0aa03`. Build passes zero TS errors. Both `/app` Playwright tests pass. Task file `tasks/40-xstate-app-machine.md` created.

## Next
No active task — Task 40 is done. Next task number is **41**.
Pick up new feature work from scratch; the XState machine is the foundation for all future `/app` state (3D onboarding, AI chat, sign-in flow).

## Context
- Spirit uses `THREE.WebGLRenderer` (WebGL2), NOT WebGPU — the gate checks `canvas.getContext('webgl2')`
- 13 pre-existing test failures in `calendar.spec.ts` + `call-logs.spec.ts` (Usage tab) — unrelated to this work, not regressions
- `docs/superpowers/` is gitignored — specs/plans go in `docs/specs/` and `docs/plans/` instead
