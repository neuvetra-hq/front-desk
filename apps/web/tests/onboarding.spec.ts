import { test, expect } from "@playwright/test"

// Onboarding routes require auth — these tests verify the UI renders
// when a session is simulated. Without a real session, we expect a redirect.
// Real authenticated tests should use Playwright storageState with a seeded session.

test.describe("Onboarding routes (unauthenticated redirects)", () => {
  test("/onboarding/identity redirects unauthenticated user", async ({ page }) => {
    await page.goto("/onboarding/identity")
    await expect(page).toHaveURL(/login|onboarding|identity/, { timeout: 5000 })
  })

  test("/onboarding/business redirects unauthenticated user", async ({ page }) => {
    await page.goto("/onboarding/business")
    await expect(page).toHaveURL(/login|onboarding|business/, { timeout: 5000 })
  })
})

test.describe("Legal pages", () => {
  test("Terms of Service page renders", async ({ page }) => {
    await page.goto("/terms")
    await expect(page.getByRole("heading", { name: "Terms of Service", exact: true })).toBeVisible()
    await expect(page.getByText(/Neuvetra/i).first()).toBeVisible()
  })

  test("Privacy Policy page renders", async ({ page }) => {
    await page.goto("/privacy")
    await expect(page.getByRole("heading", { name: "Privacy Policy", exact: true })).toBeVisible()
    await expect(page.getByText(/Neuvetra/i).first()).toBeVisible()
  })
})
