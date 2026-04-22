import { test, expect, type Page } from "@playwright/test"

async function mockNoWebGL2(page: Page) {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext.bind(HTMLCanvasElement.prototype)
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type === "webgl2") return null
      return original.apply(this, [type, ...args] as Parameters<typeof original>)
    }
  })
}

test.describe("/app route", () => {
  test("redirects to home when WebGL2 is not supported", async ({ page }) => {
    await mockNoWebGL2(page)
    await page.goto("/app")
    await expect(page).toHaveURL("/")
  })

  test("renders spirit layout when WebGL2 is available", async ({ page }) => {
    await page.goto("/app")
    // Spirit canvas container is the first absolute-inset-0 div
    await expect(page.locator("div.absolute.inset-0").first()).toBeAttached()
    await expect(page.locator("nav")).toBeVisible()
  })
})
