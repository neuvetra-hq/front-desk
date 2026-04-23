import { test, expect } from "@playwright/test"

// Expected computed CSS colors (hex → rgb):
// blue  #5ba3c9 → rgb(91, 163, 201)   Home / default
// green #3d9e60 → rgb(61, 158, 96)    How It Works
// purple #9060d0 → rgb(144, 96, 208)  Pricing

test.describe("section theme colors", () => {
  test("/app h1 uses blue theme color", async ({ page }) => {
    await page.goto("/app")
    await expect(page.locator("nav")).toBeVisible()
    await expect(page.locator("h1")).toHaveCSS("color", "rgb(91, 163, 201)")
  })

  test("/app/how-it-works h1 uses green theme color", async ({ page }) => {
    await page.goto("/app/how-it-works")
    await expect(page.locator("nav")).toBeVisible()
    await expect(page.locator("h1")).toHaveCSS("color", "rgb(61, 158, 96)")
  })

  test("/app/pricing h1 uses purple theme color", async ({ page }) => {
    await page.goto("/app/pricing")
    await expect(page.locator("nav")).toBeVisible()
    await expect(page.locator("h1")).toHaveCSS("color", "rgb(144, 96, 208)")
  })

  test("theme changes when navigating between sections", async ({ page }) => {
    await page.goto("/app/how-it-works")
    await expect(page.locator("nav")).toBeVisible()
    await expect(page.locator("h1")).toHaveCSS("color", "rgb(61, 158, 96)")

    await page.goto("/app/pricing")
    await expect(page.locator("nav")).toBeVisible()
    await expect(page.locator("h1")).toHaveCSS("color", "rgb(144, 96, 208)")
  })
})
