import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('loads homepage successfully', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Store/)
  })

  test('displays hero section', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /discover/i })).toBeVisible()
  })

  test('shows featured products', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Featured Products')).toBeVisible()
  })

  test('header navigation works', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /products/i }).first().click()
    await expect(page).toHaveURL(/\/products/)
  })

  test('dark theme is applied', async ({ page }) => {
    await page.goto('/')
    const body = page.locator('body')
    await expect(body).toHaveClass(/dark/)
  })
})
