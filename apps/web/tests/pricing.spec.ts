import { test, expect } from '@playwright/test'

test.describe('Pricing section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('renders three pricing cards', async ({ page }) => {
    const cards = page.locator('#pricing .plan-card')
    await expect(cards).toHaveCount(3)
  })

  test('shows monthly prices by default', async ({ page }) => {
    const section = page.locator('#pricing')
    await expect(section.getByText('49')).toBeVisible()
    await expect(section.getByText('99')).toBeVisible()
    await expect(section.getByText('199')).toBeVisible()
  })

  test('switches to annual prices when Annual tab is clicked', async ({ page }) => {
    await page.locator('#pricing').getByText('Annual').click()
    const section = page.locator('#pricing')
    await expect(section.getByText('39')).toBeVisible()
    await expect(section.getByText('79')).toBeVisible()
    await expect(section.getByText('159')).toBeVisible()
  })

  test('shows enterprise bar', async ({ page }) => {
    await expect(
      page.locator('#pricing').getByText('Replacing a call center')
    ).toBeVisible()
  })

  test('start free trial CTA links to /signup', async ({ page }) => {
    const cta = page.locator('#pricing a[href="/signup"]')
    await expect(cta).toBeVisible()
  })
})
