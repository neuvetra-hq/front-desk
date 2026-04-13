---
status: done
---

# Task 26: Mobile-First + shadcn/ui Standardisation

## What was done
- Installed shadcn base-nova `field` component (`FieldGroup`, `Field`, `FieldLabel`, `FieldError`, `FieldDescription`)
- Migrated all forms from manual `div.space-y-*` + `Label` + raw error `<p>` to `FieldGroup`/`Field`/`FieldError` pattern
- Replaced raw `<button>` elements with shadcn `Button`, `ToggleGroup` variants
- Dashboard navigation replaced with shadcn `Sidebar` block (collapsible icon on desktop, drawer on mobile)
- OTP inputs on LoginPage and StepVerify replaced with `InputOTP` (auto-submits on 6th digit)
- Applied semantic color tokens throughout (`text-foreground`, `text-muted-foreground`, `bg-muted`, `border-t-primary`)
- Fixed `w-N h-N` pairs to `size-N` throughout
- Mobile responsive polish on auth layout, signup wizard

## Files changed
- `src/components/auth/AuthLayout.tsx`
- `src/components/auth/LoginForm.tsx`
- `src/components/auth/SignupForm.tsx`
- `src/components/dashboard/AppSidebar.tsx` (new)
- `src/components/dashboard/KnowledgeBaseTab.tsx`
- `src/components/landing/Pricing.tsx`
- `src/components/onboarding/StepBusinessInfo.tsx`
- `src/components/onboarding/StepConfirm.tsx`
- `src/components/signup/StepBusiness.tsx`
- `src/components/signup/StepIdentity.tsx`
- `src/components/signup/StepVerify.tsx`
- `src/components/ui/field.tsx` (new — shadcn install)
- `src/pages/DashboardPage.tsx`
- `src/pages/LoginPage.tsx`
- `src/pages/SignupPage.tsx`
- `tests/mobile-responsive.spec.ts` (new)
