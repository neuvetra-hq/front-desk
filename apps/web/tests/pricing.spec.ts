import { test, expect } from "@playwright/test"

test.describe("Pricing section", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.locator("#pricing").scrollIntoViewIfNeeded()
  })

  test("#pricing anchor exists on landing page", async ({ page }) => {
    await expect(page.locator("#pricing")).toBeVisible()
  })

  test("shows all three tiers", async ({ page }) => {
    const section = page.locator("#pricing")
    await expect(section.getByText("Starter")).toBeVisible()
    await expect(section.getByText("Growth")).toBeVisible()
    await expect(section.getByText("Pro")).toBeVisible()
  })

  test("shows correct monthly prices", async ({ page }) => {
    const section = page.locator("#pricing")
    await expect(section.getByText("$49")).toBeVisible()
    await expect(section.getByText("$99")).toBeVisible()
    await expect(section.getByText("$199")).toBeVisible()
  })

  test("Growth tier has most popular badge", async ({ page }) => {
    await expect(page.locator("#pricing").getByText(/most popular/i)).toBeVisible()
  })

  test("free trial text is visible", async ({ page }) => {
    await expect(page.locator("#pricing").getByText(/7.day|7 day|free trial/i).first()).toBeVisible()
  })

  test("annual toggle switches billing period", async ({ page }) => {
    const section = page.locator("#pricing")
    const annualToggle = section.getByRole("button", { name: /annual/i })
    await annualToggle.click()
    // Annual prices should show (20% off: $39, $79, $159)
    await expect(section.getByText("$39")).toBeVisible()
    await expect(section.getByText("$79")).toBeVisible()
    await expect(section.getByText("$159")).toBeVisible()
  })

  test("shows overage rate per minute", async ({ page }) => {
    await expect(page.locator("#pricing").getByText(/overage|per min/i).first()).toBeVisible()
  })

  test("starter plan shows 200 minutes", async ({ page }) => {
    await expect(page.locator("#pricing").getByText(/200 minutes/)).toBeVisible()
  })

  test("growth plan shows 500 minutes", async ({ page }) => {
    await expect(page.locator("#pricing").getByText(/500 minutes/)).toBeVisible()
  })

  test("pro plan shows 1,000 minutes", async ({ page }) => {
    await expect(page.locator("#pricing").getByText(/1,000 minutes/)).toBeVisible()
  })
})
