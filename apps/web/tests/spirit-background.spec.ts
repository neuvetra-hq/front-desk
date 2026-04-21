import { test, expect, type Page } from "@playwright/test"

async function mockWebGPU(page: Page) {
  await page.addInitScript(() => {
    const fakeAdapter = {
      info: { vendor: "Test Vendor", architecture: "test-arch", device: "", description: "" },
      requestAdapterInfo: async () => ({
        vendor: "Test Vendor",
        architecture: "test-arch",
        device: "",
        description: "",
      }),
    }
    Object.defineProperty(navigator, "gpu", {
      get: () => ({ requestAdapter: () => Promise.resolve(fakeAdapter) }),
      configurable: true,
    })
  })
}

test.describe("spirit background", () => {
  test("renders background container and overlay on /app", async ({ page }) => {
    await mockWebGPU(page)
    await page.goto("/app")
    await expect(page.locator("div.absolute.inset-0")).toBeAttached()
    await expect(page.locator("div.relative.z-10")).toBeAttached()
  })
})
