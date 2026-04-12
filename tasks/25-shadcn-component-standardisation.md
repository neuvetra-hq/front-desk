---
status: done
---

# Task 25: Standardise on shadcn/ui Components

## Goal
Every interactive element and form control uses a shadcn component so that
reskinning the app = updating the component library, not hunting through JSX.

## Missing components to add
- [x] `Switch` — for the business-hours day toggle in SettingsTab

## Conversions

### SettingsTab.tsx
- [x] Custom toggle button → `Switch` component
- [x] Raw `<input type="time">` → shadcn `Input`

### LoginPage.tsx
- [x] "Change number" plain `<button>` → `Button variant="link"`
- [x] "Resend code" plain `<button>` → `Button variant="link"`

### LoginForm.tsx
- [x] Eye-toggle `<button>` → `Button variant="ghost" size="icon"`

### SignupForm.tsx
- [x] Eye-toggle `<button>` → `Button variant="ghost" size="icon"`

### StepVerify.tsx
- [x] "← Back" plain `<button>` → `Button variant="ghost"`
- [x] "Resend code" plain `<button>` → `Button variant="link"`

### StepCalendar.tsx
- [x] "Skip for now" plain `<button>` → `Button variant="ghost"`

### StepPickNumber.tsx
- [x] "← Back" plain `<button>` → `Button variant="ghost"`
- [x] "Try a different area code" plain `<button>` → `Button variant="link"`
- [x] Number-option `<button>` → `Button variant="outline"`

### StepPayment.tsx
- [x] "← Back" plain `<button>` → `Button variant="ghost"`
- [x] Plan-selection `<button>` → `Button variant="outline"` (with active ring)

### StepConfirm.tsx
- [x] "← Back" plain `<button>` → `Button variant="ghost"`

### DashboardPage.tsx
- [x] "Connect calendar →" banner `<button>` → `Button variant="link"`

### KnowledgeBaseTab.tsx
- [x] Delete icon `<button>` → `Button variant="ghost" size="icon"`

### Products.tsx (landing)
- [x] Disabled CTA `<button>` → `Button` with disabled prop

## Done when
- [x] `bun run build` passes
- [x] No raw `<button>` or `<input>` outside of shadcn components in src/
- [x] Every toggle uses `Switch`
- [x] TDD tests written in `apps/web/tests/shadcn-components.spec.ts`
