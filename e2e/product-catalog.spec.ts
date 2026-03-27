import { test, expect } from '@playwright/test'

test.describe('Product Catalog', () => {
  test('displays product grid', async ({ page }) => {
    await page.goto('/products')
    const products = page.locator('[data-testid="product-card"]')
    await expect(products.first()).toBeVisible()
  })

  test('product cards show name and price', async ({ page }) => {
    await page.goto('/products')
    const productName = page.locator('[data-testid="product-name"]').first()
    const productPrice = page.locator('[data-testid="product-price"]').first()
    await expect(productName).toBeVisible()
    await expect(productPrice).toBeVisible()
  })

  test('add to cart button works', async ({ page }) => {
    await page.goto('/products')
    const addButton = page.getByRole('button', { name: /add to cart/i }).first()
    await addButton.click()
    // Should update cart count
    await expect(page.locator('[data-testid="cart-count"]')).toContainText('1')
  })
})
