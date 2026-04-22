---
status: done
---

# Task 40: Update app-route.spec.ts to use WebGL2 mocks (TDD)

## What was done
- Replaced `apps/web/tests/app-route.spec.ts` with WebGL2-aware mocks
- Removed old `mockNoWebGPU` and `mockWebGPU` functions (checked `navigator.gpu`)
- Added new `mockNoWebGL2` function that intercepts `canvas.getContext('webgl2')` and returns null
- Updated both tests to use WebGL2 mocks instead of WebGPU mocks
- Tests now in TDD red state:
  - "redirects to home when WebGL2 is not supported" — **PASSES** (GpuRoute still uses WebGPU, so behavior is correct)
  - "renders spirit layout when WebGL2 is available" — **FAILS** (expected; AppPage doesn't have expected elements yet)

## Key decisions
- Kept the redirect test simple: mock WebGL2 unavailability, expect redirect to `/`
- Kept the available test simple: expect `div.absolute.inset-0` (Spirit canvas container) + `nav` visibility
- This is intentional TDD red state — the WebGL2 gate migration hasn't been implemented yet
- Committed the failing test as per TDD protocol (write test first, implement later)

## Test results
```
Running 2 tests using 2 workers

✓ redirects to home when WebGL2 is not supported (passed)
✗ renders spirit layout when WebGL2 is available (failed — expected, TDD red state)

1 passed (2.2s), 1 failed
```

Commit: `2845a0f` — "test: update /app route tests to use WebGL2 mocks"
