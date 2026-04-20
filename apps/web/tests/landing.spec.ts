import { test, expect } from "@playwright/test"

test.describe("Landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("nav links are present", async ({ page }) => {
    const nav = page.locator("nav").first()
    await expect(nav.getByRole("link", { name: "How It Works", exact: true })).toBeVisible()
    await expect(nav.getByRole("link", { name: "Industries", exact: true })).toBeVisible()
    await expect(nav.getByRole("link", { name: "Pricing", exact: true })).toBeVisible()
  })

  test("hero CTA links to signup", async ({ page }) => {
    const cta = page.getByRole("link", { name: /get started/i }).first()
    await expect(cta).toHaveAttribute("href", /signup/)
  })

  test("hero headline contains outcome copy", async ({ page }) => {
    const h1 = page.getByRole("heading", { level: 1 })
    await expect(h1).toContainText("Every call answered")
    await expect(h1).toContainText("Every appointment booked")
    await expect(h1).toContainText("Zero revenue left behind")
  })

  test("hero subheadline mentions missed calls stat", async ({ page }) => {
    await expect(page.getByText(/1 in 5 inbound calls/)).toBeVisible()
  })

  test("Products suite section is not on page", async ({ page }) => {
    await expect(page.locator("#products")).toHaveCount(0)
    await expect(page.getByText("The Neuvetra Suite")).toHaveCount(0)
  })

  test("social proof strip is visible", async ({ page }) => {
    await expect(page.getByText("Trusted by")).toBeVisible()
    await expect(page.getByText("Dental", { exact: true }).first()).toBeVisible()
    await expect(page.getByText("Legal", { exact: true }).first()).toBeVisible()
  })

  test("FAQ section shows all questions", async ({ page }) => {
    await expect(page.getByText("Will my callers know they're talking to AI?")).toBeVisible()
    await expect(page.getByText("Do I need to change my phone number?")).toBeVisible()
    await expect(page.getByText("What if it gets something wrong?")).toBeVisible()
    await expect(page.getByText("What languages does it support?")).toBeVisible()
    await expect(page.getByText("Can I customize what it says?")).toBeVisible()
  })

  test("FAQ accordion reveals answer on click", async ({ page }) => {
    await page.getByText("Will my callers know they're talking to AI?").click()
    await expect(page.getByText("sounds natural and professional")).toBeVisible()
  })

  test("CTA banner has updated headline", async ({ page }) => {
    await expect(page.getByText("Your first AI-answered call is 10 minutes away.")).toBeVisible()
  })

  test("footer contact link is a mailto", async ({ page }) => {
    const footer = page.locator("footer")
    await expect(footer.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "mailto:hello@neuvetra.com")
  })

  test("footer has no dead hash links", async ({ page }) => {
    const deadLinks = page.locator('footer a[href="#"]')
    await expect(deadLinks).toHaveCount(0)
  })

  test("footer has legal links", async ({ page }) => {
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
