---
status: pending
---

# Task 07: User Authentication (Frontend + Supabase)

## Setup
- [ ] Install `@supabase/supabase-js` in `apps/web`
- [ ] Install `react-hook-form`, `zod`, `@hookform/resolvers` in `apps/web`
- [ ] Install shadcn components: `input`, `label`, `card`, `select`, `sonner` (toast)
- [ ] Create `apps/web/.env.example` with `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- [ ] Create `apps/web/.env` (not committed) with real values from Supabase dashboard

## Supabase Client
- [ ] `src/lib/supabase.ts` — typed singleton Supabase client using `VITE_` env vars

## Auth Context
- [ ] `src/contexts/AuthContext.tsx` — provides `session`, `user`, `loading`, `signOut`
- [ ] `src/hooks/useAuth.ts` — convenience hook wrapping the context

## Database Trigger (packages/database)
- [ ] New migration: Postgres function + trigger on `auth.users` INSERT
      → auto-inserts into `public.users` (id, email, full_name, avatar_url)
- [ ] Run `db:generate` + `db:migrate` to apply

## Components
- [ ] `src/components/auth/AuthLayout.tsx`
      — centered card layout, logo at top, used by both login + signup pages
- [ ] `src/components/auth/LoginForm.tsx`
      — email + password fields, zod validation, loading spinner, inline error messages
- [ ] `src/components/auth/SignupForm.tsx`
      — email, password, business name, business type (select from enum),
        zod validation, loading spinner, inline error messages
- [ ] `src/components/auth/ProtectedRoute.tsx`
      — wraps any route; redirects to `/login` if no active session

## Pages
- [ ] `src/pages/LoginPage.tsx` — uses AuthLayout + LoginForm
- [ ] `src/pages/SignupPage.tsx` — uses AuthLayout + SignupForm

## Post-Signup Flow
- [ ] After successful signup: call Supabase to create a row in `businesses` + `business_members`
      using the service role client on the API, OR directly via the Supabase client with RLS off for now
- [ ] Redirect authenticated users to `/dashboard` after sign in / sign up
- [ ] Redirect already-authenticated users away from `/login` and `/signup`

## Routing (App.tsx)
- [ ] Wrap `AuthProvider` around the entire app in `main.tsx`
- [ ] `/login` → `LoginPage`
- [ ] `/signup` → `SignupPage`
- [ ] `/dashboard` and other app routes → wrapped in `ProtectedRoute`

## UX Details
- [ ] Loading skeleton/spinner while session is being resolved on first load
      (avoids flash of login page for already-authenticated users)
- [ ] Toast notifications via `sonner`: success on sign in, error on failed attempts
- [ ] "Don't have an account? Sign up" link on login, and vice versa
- [ ] Password show/hide toggle on password fields
- [ ] Disable submit button while request is in flight
- [ ] Sign out button accessible from dashboard (placeholder for now)

## Acceptance Criteria
- New user can sign up → `auth.users` + `public.users` + `businesses` + `business_members` rows created
- Existing user can sign in → redirected to `/dashboard`
- Wrong credentials → clear error message shown, no crash
- Unauthenticated access to `/dashboard` → redirected to `/login`
- Already signed-in user visiting `/login` → redirected to `/dashboard`
- Session survives page refresh
- Sign out clears session and redirects to `/login`
- All forms validated client-side before submission (zod)
- UI is polished: uses shadcn Card, Input, Button, Select, Sonner toasts
- No console errors
