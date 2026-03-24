import { test, expect } from "@playwright/test"

test.describe("Landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("renders the hero section", async ({ page }) => {
    await expect(page.locator("h1").first()).toBeVisible()
    await expect(page.getByText("Neuvetra").first()).toBeVisible()
  })

  test("nav links are present", async ({ page }) => {
    const nav = page.locator("nav").first()
    await expect(nav.getByRole("link", { name: "Products", exact: true })).toBeVisible()
    await expect(nav.getByRole("link", { name: "How It Works", exact: true })).toBeVisible()
    await expect(nav.getByRole("link", { name: "Industries", exact: true })).toBeVisible()
  })

  test("hero CTA links to signup", async ({ page }) => {
    const cta = page.getByRole("link", { name: /get started/i }).first()
    await expect(cta).toHaveAttribute("href", /signup/)
  })

  test("Products section shows Front Desk card", async ({ page }) => {
    const productsSection = page.locator("#products")
    await expect(productsSection.getByRole("heading", { name: "Neuvetra Front Desk", exact: true })).toBeVisible()
    await expect(productsSection.getByText("Available now")).toBeVisible()
  })

  test("Footer has legal links", async ({ page }) => {
    const footer = page.locator("footer")
    await expect(footer.getByRole("link", { name: "Privacy Policy" })).toBeVisible()
    await expect(footer.getByRole("link", { name: "Terms of Service" })).toBeVisible()
  })

  test("Industries section is present", async ({ page }) => {
    const section = page.locator("#industries")
    await expect(section.getByText("Home Services")).toBeVisible()
    await expect(section.getByText("Dental", { exact: true })).toBeVisible()
  })
})
