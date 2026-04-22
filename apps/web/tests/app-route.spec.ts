import { test, expect, type Page } from "@playwright/test"

async function mockNoWebGL2(page: Page) {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type === "webgl2") return null
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (original as any).apply(this, [type, ...args])
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
    await expect(page.locator("div.absolute.inset-0")).toBeAttached()
    await expect(page.locator("nav")).toBeVisible()
  })
})
