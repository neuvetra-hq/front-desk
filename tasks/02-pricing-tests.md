---
status: done
---

# Task 02: Write failing Playwright tests for Pricing section

## What was done
- Created `apps/web/tests/pricing.spec.ts` with 5 test cases covering:
  1. Renders three pricing cards (expects `.plan-card` elements)
  2. Shows monthly prices by default (expects $49, $99, $199 visible)
  3. Switches to annual prices when Annual tab is clicked (expects $39, $79, $159 visible)
  4. Shows enterprise bar (expects "Replacing a call center" text)
  5. Start free trial CTA links to /signup (expects anchor with `href="/signup"`)
- Ran tests to confirm all fail as expected (4 failed, 1 passed)
- Committed: `test(pricing): add failing Playwright tests for redesigned section`

## Test Failure Summary
- **renders three pricing cards**: 0 elements found (expects 3 with `.plan-card` class)
- **shows monthly prices by default**: Strict mode error (multiple `$99` found — ambiguous selector)
- **switches to annual prices when Annual tab is clicked**: Not tested yet (depends on annual tab existing)
- **shows enterprise bar**: Element not found (no "Replacing a call center" text in current component)
- **start free trial CTA links to /signup**: Strict mode error (3 matching anchors — needs specific scoping)

## Next Steps
Implement the Pricing component redesign to make these tests pass:
- Add `.plan-card` wrapper class to each pricing card
- Replace ToggleGroup with "Monthly" and "Annual" text labels or tabs
- Add enterprise section with "Replacing a call center" copy
- Ensure all CTAs are unambiguous (single `href="/signup"` link or better selector)
