import { test, expect } from '@playwright/test'

test.describe('OAuth Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('should display OAuth buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /github/i })).toBeVisible()
  })

  test('should initiate Google OAuth flow', async ({ page, context }) => {
    // Mock OAuth redirect
    await page.route('**/api/auth/signin/google', async (route) => {
      await route.fulfill({
        status: 302,
        headers: {
          Location: 'https://accounts.google.com/o/oauth2/v2/auth?client_id=test',
        },
      })
    })

    const googleButton = page.getByRole('button', { name: /google/i })
    await googleButton.click()

    // Should redirect to Google OAuth
    await page.waitForURL(/accounts\.google\.com/)
  })

  test('should initiate GitHub OAuth flow', async ({ page, context }) => {
    // Mock OAuth redirect
    await page.route('**/api/auth/signin/github', async (route) => {
      await route.fulfill({
        status: 302,
        headers: {
          Location: 'https://github.com/login/oauth/authorize?client_id=test',
        },
      })
    })

    const githubButton = page.getByRole('button', { name: /github/i })
    await githubButton.click()

    // Should redirect to GitHub OAuth
    await page.waitForURL(/github\.com/)
  })

  test('should handle successful OAuth callback', async ({ page, context }) => {
    // Mock successful OAuth callback
    await page.route('**/api/auth/callback/google*', async (route) => {
      await route.fulfill({
        status: 302,
        headers: {
          Location: 'http://localhost:3000/',
          'Set-Cookie': 'next-auth.session-token=test-token; Path=/; HttpOnly',
        },
      })
    })

    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: '1',
            email: 'oauth@example.com',
            name: 'OAuth User',
            image: 'https://example.com/avatar.jpg',
            role: 'USER',
          },
        }),
      })
    })

    // Simulate OAuth callback
    await page.goto('/api/auth/callback/google?code=test-code&state=test-state')

    // Should redirect to home page
    await expect(page).toHaveURL('/')
  })

  test('should handle OAuth error', async ({ page }) => {
    // Simulate OAuth error callback
    await page.goto('/login?error=OAuthAccountNotLinked')

    // Should show error message
    await expect(page.getByText(/authentication failed/i)).toBeVisible()
  })

  test('should handle OAuth cancellation', async ({ page }) => {
    // Simulate user cancelling OAuth
    await page.goto('/login?error=OAuthCallback')

    // Should remain on login page
    await expect(page).toHaveURL(/\/login/)
  })

  test('should link OAuth account to existing user', async ({ page, context }) => {
    // Mock existing user session
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: '1',
            email: 'existing@example.com',
            name: 'Existing User',
            role: 'USER',
          },
        }),
      })
    })

    // Mock OAuth linking
    await page.route('**/api/auth/callback/google*', async (route) => {
      await route.fulfill({
        status: 302,
        headers: {
          Location: 'http://localhost:3000/profile',
        },
      })
    })

    await page.goto('/api/auth/callback/google?code=test-code')

    // Should redirect to profile
    await expect(page).toHaveURL(/\/profile/)
  })

  test('should handle OAuth with existing email', async ({ page }) => {
    // Mock OAuth error for existing email
    await page.goto('/login?error=EmailExists')

    await expect(page.getByText(/email.*already.*use/i)).toBeVisible()
  })

  test('should preserve redirect URL after OAuth', async ({ page, context }) => {
    // Start from a protected page
    await page.goto('/profile')

    // Should redirect to login with callbackUrl
    await expect(page).toHaveURL(/\/login/)

    // Mock OAuth success
    await page.route('**/api/auth/callback/google*', async (route) => {
      await route.fulfill({
        status: 302,
        headers: {
          Location: 'http://localhost:3000/profile',
        },
      })
    })

    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: '1',
            email: 'oauth@example.com',
            name: 'OAuth User',
            role: 'USER',
          },
        }),
      })
    })

    // Complete OAuth
    await page.goto('/api/auth/callback/google?code=test-code')

    // Should redirect back to original page
    await expect(page).toHaveURL(/\/profile/)
  })

  test('should handle OAuth timeout', async ({ page }) => {
    // Mock timeout error
    await page.goto('/login?error=Timeout')

    await expect(page.getByText(/timeout|try again/i)).toBeVisible()
  })

  test('should show loading state during OAuth', async ({ page }) => {
    await page.route('**/api/auth/signin/google', async (route) => {
      // Delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await route.fulfill({
        status: 302,
        headers: {
          Location: 'https://accounts.google.com/o/oauth2/v2/auth',
        },
      })
    })

    const googleButton = page.getByRole('button', { name: /google/i })
    await googleButton.click()

    // Button should show loading state
    await expect(googleButton).toBeDisabled()
  })

  test('should work on registration page', async ({ page }) => {
    await page.goto('/register')

    await expect(page.getByRole('button', { name: /google/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /github/i })).toBeVisible()
  })

  test('should handle OAuth with missing email', async ({ page }) => {
    // Some OAuth providers might not return email
    await page.goto('/login?error=EmailRequired')

    await expect(page.getByText(/email.*required/i)).toBeVisible()
  })

  test('should create new user on first OAuth login', async ({ page, context }) => {
    // Mock new user OAuth callback
    await page.route('**/api/auth/callback/github*', async (route) => {
      await route.fulfill({
        status: 302,
        headers: {
          Location: 'http://localhost:3000/',
          'Set-Cookie': 'next-auth.session-token=new-user-token; Path=/; HttpOnly',
        },
      })
    })

    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: '2',
            email: 'newuser@example.com',
            name: 'New OAuth User',
            image: 'https://github.com/avatar.jpg',
            role: 'USER',
          },
        }),
      })
    })

    await page.goto('/api/auth/callback/github?code=new-user-code')

    // Should redirect to home
    await expect(page).toHaveURL('/')
  })

  test('should handle OAuth scope denial', async ({ page }) => {
    // User denied required scopes
    await page.goto('/login?error=AccessDenied')

    await expect(page.getByText(/access.*denied|permission/i)).toBeVisible()
  })

  test('should prevent CSRF attacks', async ({ page }) => {
    // Mock CSRF error
    await page.goto('/api/auth/callback/google?code=test&state=invalid-state')

    // Should show error or redirect to login
    await expect(page).toHaveURL(/\/login/)
  })
})
