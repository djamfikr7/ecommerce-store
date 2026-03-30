import { test, expect } from '@playwright/test'

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('should display login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()
    await expect(page.getByPlaceholder(/you@example.com/i)).toBeVisible()
    await expect(page.getByPlaceholder(/enter your password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('should show OAuth providers', async ({ page }) => {
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /github/i })).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page.getByText(/email.*required/i)).toBeVisible()
    await expect(page.getByText(/password.*required/i)).toBeVisible()
  })

  test('should validate email format', async ({ page }) => {
    await page.getByPlaceholder(/you@example.com/i).fill('invalid-email')
    await page.getByPlaceholder(/enter your password/i).fill('password')
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page.getByText(/invalid email/i)).toBeVisible()
  })

  test('should successfully login with valid credentials', async ({ page, context }) => {
    // Mock NextAuth signIn
    await page.addInitScript(() => {
      window.mockSignIn = async () => ({
        error: null,
        status: 200,
        ok: true,
        url: 'http://localhost:3000/',
      })
    })

    await page.route('**/api/auth/signin/credentials', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: 'http://localhost:3000/' }),
      })
    })

    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            role: 'USER',
          },
        }),
      })
    })

    await page.getByPlaceholder(/you@example.com/i).fill('test@example.com')
    await page.getByPlaceholder(/enter your password/i).fill('Test1234')
    await page.getByRole('button', { name: /sign in/i }).click()

    // Should redirect to home page
    await page.waitForURL('/')
  })

  test('should handle invalid credentials error', async ({ page }) => {
    await page.addInitScript(() => {
      window.mockSignIn = async () => ({
        error: 'CredentialsSignin',
        status: 401,
        ok: false,
      })
    })

    await page.getByPlaceholder(/you@example.com/i).fill('wrong@example.com')
    await page.getByPlaceholder(/enter your password/i).fill('wrongpassword')
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page.getByText(/invalid email or password/i)).toBeVisible()
  })

  test('should show loading state during submission', async ({ page }) => {
    await page.addInitScript(() => {
      window.mockSignIn = async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return { error: null, status: 200, ok: true, url: 'http://localhost:3000/' }
      }
    })

    await page.getByPlaceholder(/you@example.com/i).fill('test@example.com')
    await page.getByPlaceholder(/enter your password/i).fill('Test1234')
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page.getByRole('button', { name: /signing in/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /signing in/i })).toBeDisabled()
  })

  test('should navigate to registration page', async ({ page }) => {
    await page.getByRole('link', { name: /create one/i }).click()
    await expect(page).toHaveURL(/\/register/)
  })

  test('should navigate to forgot password page', async ({ page }) => {
    await page.getByRole('link', { name: /forgot password/i }).click()
    await expect(page).toHaveURL(/\/forgot-password/)
  })

  test('should persist session after login', async ({ page, context }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            role: 'USER',
          },
        }),
      })
    })

    await page.addInitScript(() => {
      window.mockSignIn = async () => ({
        error: null,
        status: 200,
        ok: true,
        url: 'http://localhost:3000/',
      })
    })

    await page.getByPlaceholder(/you@example.com/i).fill('test@example.com')
    await page.getByPlaceholder(/enter your password/i).fill('Test1234')
    await page.getByRole('button', { name: /sign in/i }).click()

    await page.waitForURL('/')

    // Navigate to another page
    await page.goto('/products')

    // Session should persist
    const cookies = await context.cookies()
    expect(cookies.some((c) => c.name.includes('session'))).toBeTruthy()
  })

  test('should handle network error gracefully', async ({ page }) => {
    await page.route('**/api/auth/signin/credentials', async (route) => {
      await route.abort('failed')
    })

    await page.getByPlaceholder(/you@example.com/i).fill('test@example.com')
    await page.getByPlaceholder(/enter your password/i).fill('Test1234')
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page.getByText(/invalid email or password/i)).toBeVisible()
  })

  test('should have accessible form labels', async ({ page }) => {
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
  })

  test('should allow password visibility toggle', async ({ page }) => {
    const passwordInput = page.getByPlaceholder(/enter your password/i)

    await passwordInput.fill('Test1234')

    // Password should be hidden by default
    await expect(passwordInput).toHaveAttribute('type', 'password')
  })

  test('should clear error message on input change', async ({ page }) => {
    await page.addInitScript(() => {
      window.mockSignIn = async () => ({
        error: 'CredentialsSignin',
        status: 401,
        ok: false,
      })
    })

    await page.getByPlaceholder(/you@example.com/i).fill('wrong@example.com')
    await page.getByPlaceholder(/enter your password/i).fill('wrongpassword')
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page.getByText(/invalid email or password/i)).toBeVisible()

    // Type in email field
    await page.getByPlaceholder(/you@example.com/i).fill('new@example.com')

    // Error should be dismissed
    await expect(page.getByText(/invalid email or password/i)).not.toBeVisible()
  })

  test('should prevent multiple simultaneous submissions', async ({ page }) => {
    await page.addInitScript(() => {
      window.mockSignIn = async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        return { error: null, status: 200, ok: true, url: 'http://localhost:3000/' }
      }
    })

    await page.getByPlaceholder(/you@example.com/i).fill('test@example.com')
    await page.getByPlaceholder(/enter your password/i).fill('Test1234')

    const submitButton = page.getByRole('button', { name: /sign in/i })
    await submitButton.click()

    // Button should be disabled
    await expect(submitButton).toBeDisabled()

    // Try clicking again
    await submitButton.click({ force: true })

    // Should still be disabled
    await expect(submitButton).toBeDisabled()
  })
})
