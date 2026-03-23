---
status: done
---

# Task 15: Legal Pages (Terms of Service + Privacy Policy)

Add Terms of Service and Privacy Policy pages to the app.
Legal entity: Neuvetra / Birgani Enterprises Inc.

## Pages Created

- `apps/web/src/pages/TermsPage.tsx` → `/terms`
- `apps/web/src/pages/PrivacyPage.tsx` → `/privacy`

Both routes are public (no auth required) and added to `App.tsx`.

## Coverage

### Terms of Service
- [x] Service description (AI receptionist, automated calls/SMS)
- [x] TCPA disclosure — automated communications consent
- [x] Acceptable use policy
- [x] Phone number provisioning terms (Twilio number is leased, not owned)
- [x] Billing & cancellation
- [x] AI-generated content disclaimer
- [x] Call recording disclosure
- [x] Disclaimer of warranties
- [x] Limitation of liability
- [x] Indemnification
- [x] Third-party services (Twilio, Retell AI, OpenAI, Supabase, Cal.com)
- [x] Governing law — California / Los Angeles County

### Privacy Policy
- [x] Data collected (account info, call recordings, transcripts, SMS logs, usage data)
- [x] Third-party processors with descriptions (Twilio, Retell AI, OpenAI, Supabase, Cal.com, Vercel)
- [x] Data retention periods (call recordings 90 days, SMS logs 30 days)
- [x] Callers' privacy — operator responsibilities for consent + recording disclosure
- [x] User rights (access, correction, deletion, portability, opt-out)
- [x] CCPA (California residents)
- [x] Children's privacy (no under-13)
- [x] Contact: privacy@neuvetra.com / legal@neuvetra.com

## Where Legal Lives
- neuvetra.com/terms and app.neuvetra.com/terms (same routes, both domains serve apps/web)
- Legal entity: Neuvetra / Birgani Enterprises Inc., Los Angeles, California

## Notes
- These are good-faith drafts. Have a licensed attorney review before going live with paying customers.
- Consent text on StepIdentity.tsx links users to /privacy at signup.
- Footer of each legal page cross-links the other document.
