import { test, expect, type Page } from "@playwright/test"

async function mockNoWebGPU(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "gpu", {
      get: () => undefined,
      configurable: true,
    })
  })
}

async function mockWebGPU(page: Page) {
  await page.addInitScript(() => {
    const fakeAdapter = {
      info: {
        vendor: "Test Vendor",
        architecture: "test-arch",
        device: "",
        description: "",
      },
      requestAdapterInfo: async () => ({
        vendor: "Test Vendor",
        architecture: "test-arch",
        device: "",
        description: "",
      }),
    }
    Object.defineProperty(navigator, "gpu", {
      get: () => ({
        requestAdapter: () => Promise.resolve(fakeAdapter),
      }),
      configurable: true,
    })
  })
}

test.describe("/app route", () => {
  test("redirects to home when WebGPU is not supported", async ({ page }) => {
    await mockNoWebGPU(page)
    await page.goto("/app")
    await expect(page).toHaveURL("/")
  })

  test("renders /app when WebGPU is available", async ({ page }) => {
    await mockWebGPU(page)
    await page.goto("/app")
    await expect(page.getByText("WebGPU is available")).toBeVisible()
    await expect(page.getByText(/Test Vendor.*test-arch/)).toBeVisible()
  })

  test("shows anonymous user when not logged in", async ({ page }) => {
    await mockWebGPU(page)
    await page.goto("/app")
    await expect(page.getByText("Anonymous user")).toBeVisible()
  })
})
