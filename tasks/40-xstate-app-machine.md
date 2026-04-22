---
status: done
---
# Task 40: XState Machine for /app (neuvetra.ai)

## What was done
- Installed xstate v5 + @xstate/react in apps/web
- Created parallel machine `neuvetraAI` with 4 orthogonal states: webgl, auth, audio, view
- WebGL2 gate replaces the old WebGPU gate (Spirit uses THREE.WebGLRenderer, not WebGPU)
- Machine owns auth state (Supabase direct, independent from .com AuthContext)
- AppLayout sends ROUTE_CHANGED, USER_INTERACTED, TOGGLE_MUTE events into machine
- Deleted GpuRoute.tsx, useWebGPU.ts, unused AppPage.tsx
- Updated Playwright tests to use WebGL2 mocks

## Key decisions
- Parallel machine (not actor federation) — simpler, right-sized for current scope
- Router drives machine (not machine drives router) — React Router owns URL
- Auth is independent from .com AuthContext — /app is its own product (neuvetra.ai)
- supabaseAuthListener invoked at machine root so it runs for the full lifetime
- Machine exposed via createActorContext from @xstate/react
