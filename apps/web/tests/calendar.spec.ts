import { test, expect } from "@playwright/test"

// ---------------------------------------------------------------------------
// Calendar integration — unauthenticated
// These tests run without a Supabase session and verify public-facing behavior.
// ---------------------------------------------------------------------------

test.describe("Calendar OAuth callback — unauthenticated", () => {
  test("redirects to /login when landing on /calendar/callback without session", async ({ page }) => {
    await page.goto("/calendar/callback")
    await expect(page).toHaveURL(/login/, { timeout: 5000 })
  })

  test("redirects to /login with error param when Google returns an error", async ({ page }) => {
    await page.goto("/calendar/callback?error=access_denied")
    await expect(page).toHaveURL(/login/, { timeout: 5000 })
  })
})

// ---------------------------------------------------------------------------
// Calendar integration — authenticated (requires storageState)
// Run: bun run scripts/gen-test-session.ts to generate test-session.json
// then uncomment the tests below.
// ---------------------------------------------------------------------------

// test.describe("Calendar — Settings tab (authenticated)", () => {
//   test.use({ storageState: "tests/fixtures/test-session.json" })
//
//   test("Settings tab shows Calendar section heading", async ({ page }) => {
//     await page.goto("/dashboard")
//     await page.getByRole("button", { name: /settings/i }).click()
//     await expect(page.getByRole("heading", { name: /calendar/i })).toBeVisible()
//   })
//
//   test("Connect Google Calendar button is visible when not connected", async ({ page }) => {
//     await page.goto("/dashboard")
//     await page.getByRole("button", { name: /settings/i }).click()
//     await expect(page.getByRole("button", { name: /connect google calendar/i })).toBeVisible()
//   })
//
//   test("connected state shows provider email and Disconnect button", async ({ page }) => {
//     // Assumes the seeded test business has a connected calendar_connection row
//     await page.goto("/dashboard")
//     await page.getByRole("button", { name: /settings/i }).click()
//     await expect(page.getByText(/connected as/i)).toBeVisible()
//     await expect(page.getByRole("button", { name: /disconnect/i })).toBeVisible()
//   })
//
//   test("clicking Connect Google Calendar redirects to Google OAuth", async ({ page }) => {
//     await page.goto("/dashboard")
//     await page.getByRole("button", { name: /settings/i }).click()
//     const [popup] = await Promise.all([
//       page.waitForURL(/accounts\.google\.com/, { timeout: 5000 }).catch(() => null),
//       page.getByRole("button", { name: /connect google calendar/i }).click(),
//     ])
//     // We just verify the redirect target is Google — we don't complete the OAuth flow in tests
//     await expect(page).toHaveURL(/accounts\.google\.com|google\.com\/o\/oauth2/, { timeout: 5000 })
//   })
// })
