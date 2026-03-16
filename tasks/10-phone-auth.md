---
status: done
---

# Task 10: Phone Number + OTP Authentication

Replace email/password auth with phone number + SMS verification code (OTP).
The user's personal phone number is their identity — no passwords, no email required.

## Context
- User's **personal phone** = identity for login (OTP sent here via Twilio SMS)
- **Twilio number** = provisioned business line for the AI receptionist (separate, unrelated)
- Supabase has native phone OTP support — pointed at our existing Twilio account

## Flow
```
Enter phone number → receive SMS code → enter code → logged in
(first time = account created, subsequent = login — same screen)
```

On first login, collect full name before redirecting to onboarding:
```
Phone → OTP → [if new user] Enter your name → /onboarding → /dashboard
[if returning user] → /dashboard
```

## Supabase Setup (manual, one-time)
- [ ] Supabase dashboard → Authentication → Providers → Phone → enable
- [ ] Set Twilio credentials: Account SID + Auth Token + phone number (from apps/api/.env)
- [ ] Set OTP expiry (recommend 10 minutes)

## Pages / Components to change
- [ ] Replace `LoginPage.tsx` + `SignupPage.tsx` with a single `PhoneAuthPage.tsx`
      — Step 1: phone number input + "Send code" button
      — Step 2: 6-digit OTP input + "Verify" button + resend option
      — Step 3 (new users only): full name input
- [ ] Delete `LoginForm.tsx`, `SignupForm.tsx` — no longer needed
- [ ] Update `Navbar.tsx` — "Sign in" links to `/login` (PhoneAuthPage)
- [ ] Update `App.tsx` — replace `/login` + `/signup` routes with single `/login` route

## Auth logic
- [ ] `supabase.auth.signInWithOtp({ phone })` — sends SMS code
- [ ] `supabase.auth.verifyOtp({ phone, token, type: 'sms' })` — verifies code
- [ ] On first login (new user): insert into `public.users` (name) + create business row + business_members row
- [ ] On returning login: `AuthContext` loads existing business → redirect to /dashboard

## AuthContext changes
- [ ] Remove any email/password references
- [ ] New user detection: check if `public.users` row exists after OTP verify

## Routes
- [ ] `/login` → PhoneAuthPage (public, redirects to /dashboard if already authed)
- [ ] Remove `/signup` route

## Acceptance Criteria
- User enters personal mobile number → receives SMS within ~5 seconds
- First-time user is prompted for their name, then goes to onboarding
- Returning user goes straight to dashboard
- Wrong/expired OTP shows clear error
- Resend code option available after 30 seconds
- No email or password anywhere in the UI
