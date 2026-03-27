import { test, expect } from '@playwright/test'

test.describe('Complete Purchase Flow (Critical Path)', () => {
  test('full checkout flow', async ({ page }) => {
    // 1. Go to homepage
    await page.goto('/')

    // 2. Navigate to products
    await page.getByRole('link', { name: /shop now/i }).or(
      page.getByRole('link', { name: /products/i })
    ).click()
    await expect(page).toHaveURL(/\/products/)

    // 3. Click first product
    await page.locator('[data-testid="product-card"]').first().click()
    await expect(page).toHaveURL(/\/products\/.+/)

    // 4. Add to cart
    await page.getByRole('button', { name: /add to cart/i }).click()
    await expect(page.getByText('Added to cart')).toBeVisible()

    // 5. Go to cart
    await page.getByRole('link', { name: /cart/i }).click()
    await expect(page).toHaveURL(/\/cart/)

    // 6. Proceed to checkout
    await page.getByRole('button', { name: /checkout/i }).click()
    await expect(page).toHaveURL(/\/checkout/)

    // 7. Fill shipping info
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="firstName"]', 'John')
    await page.fill('[name="lastName"]', 'Doe')
    await page.fill('[name="address1"]', '123 Main St')
    await page.fill('[name="city"]', 'New York')
    await page.fill('[name="postalCode"]', '10001')

    // 8. Continue to payment
    await page.getByRole('button', { name: /continue to payment/i }).click()

    // 9. Payment step (Stripe test)
    // Use Stripe test card: 4242 4242 4242 4242
    await page.fill('[name="cardNumber"]', '4242424242424242')
    await page.fill('[name="expiry"]', '1226')
    await page.fill('[name="cvc"]', '123')

    // 10. Place order
    await page.getByRole('button', { name: /place order/i }).click()

    // 11. Confirmation
    await expect(page.getByText(/order confirmed/i)).toBeVisible({ timeout: 10000 })
  })
})
