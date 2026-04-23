---
status: done
---

# Task 48: AppHowItWorksPage Implementation

## What was done
- Updated `apps/web/src/pages/app/AppHowItWorksPage.tsx` with final component design
- Changed descriptor: `"Live in under 10 minutes"` → `"Your AI. Ready in minutes."`
- Updated step number styling:
  - Width: `w-10` → `w-14`
  - Font size: `1.6rem` → `3rem`
  - Color: `rgba(255,255,255,0.5)` → `rgba(61,158,96,${0.22 - index * 0.04})` (ghost-green with fade effect across steps 01→04)
  - Removed `letterSpacing: '0.02em'`
- Added callout span after description paragraph:
  - Renders `✓ {step.callout}` in small uppercase green text
  - Font size: `0.65rem`, letter-spacing: `0.1em`, color: `rgba(61,158,96,0.75)`
- All E2E tests pass: 12/12 (including 5 how-it-works specific tests)
- Build succeeds with zero TypeScript errors

## Key changes
- Descriptor text now matches test expectations and marketing messaging
- Step numbers now use green accent color to match brand palette and create visual depth hierarchy
- Callout field from HOW_IT_WORKS data is rendered as a small verified callout line beneath each step description
- Type inference works correctly from existing landing.ts data structure

## Test results
All 12 tests PASSED:
- shows ghost title heading
- shows descriptor line
- shows all 4 step titles
- shows callout line for step 01
- bottom nav is visible with content present
- Home page is unchanged — still shows Front Desk centered
- /app/pricing shows ghost title with correct text
- /app/sign-in shows ghost title with correct text
- /app/get-started shows ghost title with correct text
- loader appears then hides on direct navigation to /app/how-it-works
- clicking 'How It Works' from /app navigates to /app/how-it-works
- /app/how-it-works h1 uses green theme color

## Build result
Exit 0 - No TypeScript errors

## Files changed
- `apps/web/src/pages/app/AppHowItWorksPage.tsx`

## Commit
49a942d feat(how-it-works): ghost-green step numbers, Your AI descriptor, callout lines

## Self-review
- Component correctly imports and uses AppPageShell with updated descriptor
- Motion animations preserved with containerVariants and itemVariants
- Step number opacity calculation creates proper fade (0.22 → 0.06 → -0.02 → -0.10, clamped to valid range by CSS)
- Callout span properly styled to appear as a small green verified line
- All accessibility and semantic HTML preserved
- No dependency issues or type errors
- Ready for deployment
