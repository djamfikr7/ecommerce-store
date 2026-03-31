import { test, expect } from '@playwright/test'

test.describe('Password Reset Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/forgot-password')
  })

  test('should display forgot password form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /forgot.*password/i })).toBeVisible()
    await expect(page.getByPlaceholder(/email/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /send.*reset.*link/i })).toBeVisible()
  })

  test('should validate email field', async ({ page }) => {
    await page.getByRole('button', { name: /send.*reset.*link/i }).click()

    await expect(page.getByText(/email.*required/i)).toBeVisible()
  })

  test('should validate email format', async ({ page }) => {
    await page.getByPlaceholder(/email/i).fill('invalid-email')
    await page.getByRole('button', { name: /send.*reset.*link/i }).click()

    await expect(page.getByText(/invalid email/i)).toBeVisible()
  })

  test('should successfully send reset email', async ({ page }) => {
    // Mock password reset API
    await page.route('**/api/auth/forgot-password', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Password reset email sent',
        }),
      })
    })

    await page.getByPlaceholder(/email/i).fill('test@example.com')
    await page.getByRole('button', { name: /send.*reset.*link/i }).click()

    await expect(page.getByText(/reset.*email.*sent/i)).toBeVisible()
  })

  test('should handle non-existent email gracefully', async ({ page }) => {
    // For security, should show success even if email doesn't exist
    await page.route('**/api/auth/forgot-password', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'If an account exists, a reset email has been sent',
        }),
      })
    })

    await page.getByPlaceholder(/email/i).fill('nonexistent@example.com')
    await page.getByRole('button', { name: /send.*reset.*link/i }).click()

    // Should show generic success message for security
    await expect(page.getByText(/reset.*email.*sent/i)).toBeVisible()
  })

  test('should show loading state during submission', async ({ page }) => {
    await page.route('**/api/auth/forgot-password', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    })

    await page.getByPlaceholder(/email/i).fill('test@example.com')
    await page.getByRole('button', { name: /send.*reset.*link/i }).click()

    await expect(page.getByRole('button', { name: /sending/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /sending/i })).toBeDisabled()
  })

  test('should navigate back to login', async ({ page }) => {
    await page.getByRole('link', { name: /back.*login/i }).click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('should handle server error', async ({ page }) => {
    await page.route('**/api/auth/forgot-password', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Failed to send email',
        }),
      })
    })

    await page.getByPlaceholder(/email/i).fill('test@example.com')
    await page.getByRole('button', { name: /send.*reset.*link/i }).click()

    await expect(page.getByText(/failed.*try again/i)).toBeVisible()
  })

  test('should handle rate limiting', async ({ page }) => {
    await page.route('**/api/auth/forgot-password', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Too many requests. Please try again later.',
        }),
      })
    })

    await page.getByPlaceholder(/email/i).fill('test@example.com')
    await page.getByRole('button', { name: /send.*reset.*link/i }).click()

    await expect(page.getByText(/too many requests/i)).toBeVisible()
  })
})

test.describe('Password Reset Confirmation', () => {
  test('should display reset password form with valid token', async ({ page }) => {
    await page.goto('/reset-password?token=valid-token')

    await expect(page.getByRole('heading', { name: /reset.*password/i })).toBeVisible()
    await expect(page.getByPlaceholder(/new password/i)).toBeVisible()
    await expect(page.getByPlaceholder(/confirm.*password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /reset password/i })).toBeVisible()
  })

  test('should validate password requirements', async ({ page }) => {
    await page.goto('/reset-password?token=valid-token')

    const passwordInput = page.getByPlaceholder(/new password/i)

    // Too short
    await passwordInput.fill('short')
    await expect(page.getByText(/at least 8 characters/i)).toBeVisible()

    // No uppercase
    await passwordInput.fill('password123')
    await expect(page.getByText(/uppercase/i)).toBeVisible()

    // No number
    await passwordInput.fill('Password')
    await expect(page.getByText(/number/i)).toBeVisible()
  })

  test('should validate password confirmation match', async ({ page }) => {
    await page.goto('/reset-password?token=valid-token')

    await page.getByPlaceholder(/new password/i).fill('Test1234')
    await page.getByPlaceholder(/confirm.*password/i).fill('Different1234')
    await page.getByRole('button', { name: /reset password/i }).click()

    await expect(page.getByText(/passwords.*match/i)).toBeVisible()
  })

  test('should successfully reset password', async ({ page }) => {
    await page.route('**/api/auth/reset-password', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Password reset successful',
        }),
      })
    })

    await page.goto('/reset-password?token=valid-token')

    await page.getByPlaceholder(/new password/i).fill('NewTest1234')
    await page.getByPlaceholder(/confirm.*password/i).fill('NewTest1234')
    await page.getByRole('button', { name: /reset password/i }).click()

    // Should show success and redirect to login
    await expect(page.getByText(/password.*reset.*success/i)).toBeVisible()
    await expect(page).toHaveURL(/\/login/)
  })

  test('should handle expired token', async ({ page }) => {
    await page.route('**/api/auth/reset-password', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Reset token has expired',
        }),
      })
    })

    await page.goto('/reset-password?token=expired-token')

    await page.getByPlaceholder(/new password/i).fill('NewTest1234')
    await page.getByPlaceholder(/confirm.*password/i).fill('NewTest1234')
    await page.getByRole('button', { name: /reset password/i }).click()

    await expect(page.getByText(/token.*expired/i)).toBeVisible()
  })

  test('should handle invalid token', async ({ page }) => {
    await page.goto('/reset-password?token=invalid-token')

    await page.route('**/api/auth/reset-password', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Invalid reset token',
        }),
      })
    })

    await page.getByPlaceholder(/new password/i).fill('NewTest1234')
    await page.getByPlaceholder(/confirm.*password/i).fill('NewTest1234')
    await page.getByRole('button', { name: /reset password/i }).click()

    await expect(page.getByText(/invalid.*token/i)).toBeVisible()
  })

  test('should handle missing token', async ({ page }) => {
    await page.goto('/reset-password')

    await expect(page.getByText(/invalid.*missing.*token/i)).toBeVisible()
  })

  test('should show password strength indicator', async ({ page }) => {
    await page.goto('/reset-password?token=valid-token')

    const passwordInput = page.getByPlaceholder(/new password/i)
    await passwordInput.fill('Test1234')

    // Password strength component should be visible
    await expect(page.locator('[class*="password-strength"]').first()).toBeVisible()
  })

  test('should prevent reuse of old password', async ({ page }) => {
    await page.route('**/api/auth/reset-password', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Cannot reuse old password',
        }),
      })
    })

    await page.goto('/reset-password?token=valid-token')

    await page.getByPlaceholder(/new password/i).fill('OldPassword123')
    await page.getByPlaceholder(/confirm.*password/i).fill('OldPassword123')
    await page.getByRole('button', { name: /reset password/i }).click()

    await expect(page.getByText(/cannot reuse.*old password/i)).toBeVisible()
  })

  test('should show loading state during submission', async ({ page }) => {
    await page.route('**/api/auth/reset-password', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    })

    await page.goto('/reset-password?token=valid-token')

    await page.getByPlaceholder(/new password/i).fill('NewTest1234')
    await page.getByPlaceholder(/confirm.*password/i).fill('NewTest1234')
    await page.getByRole('button', { name: /reset password/i }).click()

    await expect(page.getByRole('button', { name: /resetting/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /resetting/i })).toBeDisabled()
  })
})
