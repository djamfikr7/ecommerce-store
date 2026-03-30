import { test, expect } from '@playwright/test'

test.describe('Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register')
  })

  test('should display registration form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible()
    await expect(page.getByPlaceholder(/john doe/i)).toBeVisible()
    await expect(page.getByPlaceholder(/you@example.com/i)).toBeVisible()
    await expect(page.getByPlaceholder(/create a strong password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible()
  })

  test('should show OAuth providers', async ({ page }) => {
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /github/i })).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    await page.getByRole('button', { name: /create account/i }).click()

    // Should show validation errors
    await expect(page.getByText(/email is required/i)).toBeVisible()
    await expect(page.getByText(/password.*required/i)).toBeVisible()
  })

  test('should validate email format', async ({ page }) => {
    await page.getByPlaceholder(/you@example.com/i).fill('invalid-email')
    await page.getByPlaceholder(/create a strong password/i).fill('Test1234')
    await page.getByRole('button', { name: /create account/i }).click()

    await expect(page.getByText(/invalid email/i)).toBeVisible()
  })

  test('should validate password strength', async ({ page }) => {
    const passwordInput = page.getByPlaceholder(/create a strong password/i)

    // Weak password
    await passwordInput.fill('weak')
    await expect(page.getByText(/password must be at least 8 characters/i)).toBeVisible()

    // No uppercase
    await passwordInput.fill('password123')
    await expect(page.getByText(/password must contain.*uppercase/i)).toBeVisible()

    // No number
    await passwordInput.fill('Password')
    await expect(page.getByText(/password must contain.*number/i)).toBeVisible()
  })

  test('should show password strength indicator', async ({ page }) => {
    const passwordInput = page.getByPlaceholder(/create a strong password/i)

    await passwordInput.fill('Test1234')
    // Password strength component should be visible
    await expect(page.locator('[class*="password-strength"]').first()).toBeVisible()
  })

  test('should require terms acceptance', async ({ page }) => {
    await page.getByPlaceholder(/john doe/i).fill('Test User')
    await page.getByPlaceholder(/you@example.com/i).fill('test@example.com')
    await page.getByPlaceholder(/create a strong password/i).fill('Test1234')

    // Don't check terms
    await page.getByRole('button', { name: /create account/i }).click()

    await expect(page.getByText(/accept.*terms/i)).toBeVisible()
  })

  test('should successfully register with valid data', async ({ page, context }) => {
    // Mock the registration API
    await page.route('**/api/auth/register', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: { id: '1', email: 'test@example.com' },
        }),
      })
    })

    await page.getByPlaceholder(/john doe/i).fill('Test User')
    await page.getByPlaceholder(/you@example.com/i).fill('test@example.com')
    await page.getByPlaceholder(/create a strong password/i).fill('Test1234')

    // Accept terms
    await page.getByRole('button', { name: /terms of service/i }).click()

    await page.getByRole('button', { name: /create account/i }).click()

    // Should redirect to verification page
    await expect(page).toHaveURL(/\/verify-email/)
  })

  test('should handle duplicate email error', async ({ page }) => {
    await page.route('**/api/auth/register', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Email already exists',
        }),
      })
    })

    await page.getByPlaceholder(/john doe/i).fill('Test User')
    await page.getByPlaceholder(/you@example.com/i).fill('existing@example.com')
    await page.getByPlaceholder(/create a strong password/i).fill('Test1234')
    await page.getByRole('button', { name: /terms of service/i }).click()
    await page.getByRole('button', { name: /create account/i }).click()

    await expect(page.getByText(/email already exists/i)).toBeVisible()
  })

  test('should handle server error gracefully', async ({ page }) => {
    await page.route('**/api/auth/register', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Internal server error',
        }),
      })
    })

    await page.getByPlaceholder(/john doe/i).fill('Test User')
    await page.getByPlaceholder(/you@example.com/i).fill('test@example.com')
    await page.getByPlaceholder(/create a strong password/i).fill('Test1234')
    await page.getByRole('button', { name: /terms of service/i }).click()
    await page.getByRole('button', { name: /create account/i }).click()

    await expect(page.getByText(/registration failed/i)).toBeVisible()
  })

  test('should show loading state during submission', async ({ page }) => {
    await page.route('**/api/auth/register', async (route) => {
      // Delay response to see loading state
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: { id: '1', email: 'test@example.com' },
        }),
      })
    })

    await page.getByPlaceholder(/john doe/i).fill('Test User')
    await page.getByPlaceholder(/you@example.com/i).fill('test@example.com')
    await page.getByPlaceholder(/create a strong password/i).fill('Test1234')
    await page.getByRole('button', { name: /terms of service/i }).click()

    await page.getByRole('button', { name: /create account/i }).click()

    // Should show loading state
    await expect(page.getByRole('button', { name: /creating account/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /creating account/i })).toBeDisabled()
  })

  test('should navigate to login page', async ({ page }) => {
    await page.getByRole('link', { name: /sign in/i }).click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('should have accessible form labels', async ({ page }) => {
    await expect(page.getByLabel(/full name/i)).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
  })

  test('should trim whitespace from inputs', async ({ page }) => {
    await page.route('**/api/auth/register', async (route) => {
      const formData = await route.request().postData()
      // Verify trimmed data is sent
      expect(formData).not.toContain('  test@example.com  ')

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: { id: '1', email: 'test@example.com' },
        }),
      })
    })

    await page.getByPlaceholder(/you@example.com/i).fill('  test@example.com  ')
    await page.getByPlaceholder(/create a strong password/i).fill('Test1234')
    await page.getByRole('button', { name: /terms of service/i }).click()
    await page.getByRole('button', { name: /create account/i }).click()
  })
})
