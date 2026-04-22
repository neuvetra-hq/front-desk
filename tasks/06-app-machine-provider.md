---
status: done
---

# Task 6: Create AppMachineProvider

## What was done
- Created `apps/web/src/pages/app/AppMachineProvider.tsx` with:
  - `AppMachineContext` from `createActorContext(appMachine)`
  - `WebGLGate` component that guards access to the /app route
  - Handles three states: checking (spinner), supported (render children), unsupported (redirect to home)
  - Provider wraps the gate so useSelector can be called inside it

## Key decisions
- `WebGLGate` uses `useSelector` to read `s.value.webgl` from the machine snapshot
- Unsupported WebGL redirects to `/` with `replace: true` to avoid back-button surprises
- Spinner shows while WebGL check is in flight

## Commit
- `d4e6e8a` — feat(app): add AppMachineProvider with WebGL gate
