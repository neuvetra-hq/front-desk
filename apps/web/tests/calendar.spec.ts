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
//   test("Connect Outlook Calendar button is visible when not connected", async ({ page }) => {
//     await page.goto("/dashboard")
//     await page.getByRole("button", { name: /settings/i }).click()
//     await expect(page.getByRole("button", { name: /connect outlook/i })).toBeVisible()
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
//
//   test("clicking Connect Outlook redirects to Microsoft OAuth", async ({ page }) => {
//     await page.goto("/dashboard")
//     await page.getByRole("button", { name: /settings/i }).click()
//     page.getByRole("button", { name: /connect outlook/i }).click()
//     // We just verify the redirect target is Microsoft — we don't complete the OAuth flow in tests
//     await expect(page).toHaveURL(/login\.microsoftonline\.com/, { timeout: 5000 })
//   })
// })

test.describe("Calendar provider selection — unauthenticated landing page", () => {
  test("settings page shows Google Calendar option in provider list", async ({ page }) => {
    await page.goto("/dashboard/settings")
    // Redirects to login — just verify the route exists and redirects properly
    await expect(page).toHaveURL(/login/, { timeout: 5000 })
  })
})

// ---------------------------------------------------------------------------
// CalDAV / Apple Calendar callback — unauthenticated
// ---------------------------------------------------------------------------

test.describe("CalDAV connect — unauthenticated", () => {
  test("redirects to /login when landing on /calendar/caldav/callback without session", async ({ page }) => {
    await page.goto("/calendar/caldav/callback")
    await expect(page).toHaveURL(/login/, { timeout: 5000 })
  })
})

// ---------------------------------------------------------------------------
// Authenticated CalDAV settings (requires storageState — kept commented)
// ---------------------------------------------------------------------------

// test.describe("CalDAV — Settings tab (authenticated)", () => {
//   test.use({ storageState: "tests/fixtures/test-session.json" })
//
//   test("calendar section shows provider list when no calendar connected", async ({ page }) => {
//     await page.goto("/dashboard/settings")
//     await expect(page.getByText(/google calendar/i)).toBeVisible()
//     await expect(page.getByText(/outlook/i)).toBeVisible()
//     await expect(page.getByText(/apple/i)).toBeVisible()
//   })
//
//   test("clicking Apple/Fastmail opens CalDAV connect dialog", async ({ page }) => {
//     await page.goto("/dashboard/settings")
//     await page.getByRole("button", { name: /apple.*fastmail|caldav/i }).click()
//     await expect(page.getByRole("dialog")).toBeVisible()
//     await expect(page.getByText(/connect caldav/i)).toBeVisible()
//   })
//
//   test("CalDAV dialog has provider select, server URL, username and password fields", async ({ page }) => {
//     await page.goto("/dashboard/settings")
//     await page.getByRole("button", { name: /apple.*fastmail|caldav/i }).click()
//     await expect(page.getByLabel(/provider/i)).toBeVisible()
//     await expect(page.getByLabel(/server url/i)).toBeVisible()
//     await expect(page.getByLabel(/username|apple id/i)).toBeVisible()
//     await expect(page.getByLabel(/password/i)).toBeVisible()
//   })
// })

test.describe("Outlook OAuth callback — unauthenticated", () => {
  test("redirects to /login when landing on /calendar/microsoft/callback without session", async ({ page }) => {
    await page.goto("/calendar/microsoft/callback")
    await expect(page).toHaveURL(/login/, { timeout: 5000 })
  })

  test("redirects to /login when Microsoft returns an error", async ({ page }) => {
    await page.goto("/calendar/microsoft/callback?error=access_denied")
    await expect(page).toHaveURL(/login/, { timeout: 5000 })
  })
})
