---
status: done
---

# Task 7: Create useAppMachine hook

## What was done
- Created `apps/web/src/pages/app/hooks/useAppMachine.ts` with:
  - `useAppMachine<T>()` generic selector hook that wraps `AppMachineContext.useSelector()`
  - Proper `SnapshotFrom<typeof appMachine>` typing for selector argument
  - `useAppSend()` convenience hook for sending events to the machine

## Key decisions
- Generic type parameter `<T>` allows type-safe selection of any part of the snapshot
- Both hooks are exported as named exports for easy tree-shaking
- `useAppSend()` returns the `send` function directly (not wrapped) for flexibility
- Hooks directory created under `apps/web/src/pages/app/hooks/`

## Commit
- `75aa3e0` — feat(app): add useAppMachine selector hook and useAppSend
