import { Page } from '@playwright/test'

/**
 * Authentication Test Helpers
 * Reusable utilities for E2E authentication tests
 */

export interface MockUser {
  id: string
  email: string
  name: string
  image?: string
  phone?: string
  role: 'USER' | 'ADMIN' | 'SUPERADMIN'
}

export const defaultMockUser: MockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  image: 'https://example.com/avatar.jpg',
  phone: '+1234567890',
  role: 'USER',
}

/**
 * Mock authenticated session for a user
 */
export async function mockAuthSession(page: Page, user: MockUser = defaultMockUser) {
  await page.route('**/api/auth/session', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          phone: user.phone,
          role: user.role,
        },
      }),
    })
  })
}

/**
 * Mock unauthenticated session (logged out)
 */
export async function mockNoSession(page: Page) {
  await page.route('**/api/auth/session', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    })
  })
}

/**
 * Mock successful login
 */
export async function mockSuccessfulLogin(page: Page, user: MockUser = defaultMockUser) {
  await page.route('**/api/auth/signin/credentials', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ url: 'http://localhost:3000/' }),
    })
  })

  await mockAuthSession(page, user)
}

/**
 * Mock failed login
 */
export async function mockFailedLogin(page: Page, error: string = 'Invalid credentials') {
  await page.route('**/api/auth/signin/credentials', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ error }),
    })
  })
}

/**
 * Mock successful registration
 */
export async function mockSuccessfulRegistration(page: Page, email: string = 'test@example.com') {
  await page.route('**/api/auth/register', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        user: { id: '1', email },
      }),
    })
  })
}

/**
 * Mock failed registration
 */
export async function mockFailedRegistration(page: Page, error: string = 'Registration failed') {
  await page.route('**/api/auth/register', async (route) => {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({
        success: false,
        error,
      }),
    })
  })
}

/**
 * Mock email verification success
 */
export async function mockEmailVerificationSuccess(page: Page) {
  await page.route('**/api/auth/verify-email', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
      }),
    })
  })
}

/**
 * Mock email verification failure
 */
export async function mockEmailVerificationFailure(page: Page, error: string = 'Invalid code') {
  await page.route('**/api/auth/verify-email', async (route) => {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({
        success: false,
        error,
      }),
    })
  })
}

/**
 * Mock resend verification email
 */
export async function mockResendVerification(page: Page, success: boolean = true) {
  await page.route('**/api/auth/resend-verification', async (route) => {
    await route.fulfill({
      status: success ? 200 : 429,
      contentType: 'application/json',
      body: JSON.stringify({
        success,
        message: success ? 'Verification email sent' : 'Too many requests',
      }),
    })
  })
}

/**
 * Mock password reset request
 */
export async function mockPasswordResetRequest(page: Page, success: boolean = true) {
  await page.route('**/api/auth/forgot-password', async (route) => {
    await route.fulfill({
      status: success ? 200 : 500,
      contentType: 'application/json',
      body: JSON.stringify({
        success,
        message: success ? 'Reset email sent' : 'Failed to send email',
      }),
    })
  })
}

/**
 * Mock password reset confirmation
 */
export async function mockPasswordResetConfirmation(page: Page, success: boolean = true) {
  await page.route('**/api/auth/reset-password', async (route) => {
    await route.fulfill({
      status: success ? 200 : 400,
      contentType: 'application/json',
      body: JSON.stringify({
        success,
        message: success ? 'Password reset successful' : 'Invalid token',
      }),
    })
  })
}

/**
 * Mock OAuth redirect
 */
export async function mockOAuthRedirect(
  page: Page,
  provider: 'google' | 'github',
  redirectUrl: string,
) {
  await page.route(`**/api/auth/signin/${provider}`, async (route) => {
    await route.fulfill({
      status: 302,
      headers: {
        Location: redirectUrl,
      },
    })
  })
}

/**
 * Mock OAuth callback success
 */
export async function mockOAuthCallbackSuccess(
  page: Page,
  provider: 'google' | 'github',
  user: MockUser = defaultMockUser,
) {
  await page.route(`**/api/auth/callback/${provider}*`, async (route) => {
    await route.fulfill({
      status: 302,
      headers: {
        Location: 'http://localhost:3000/',
        'Set-Cookie': 'next-auth.session-token=test-token; Path=/; HttpOnly',
      },
    })
  })

  await mockAuthSession(page, user)
}

/**
 * Fill login form and submit
 */
export async function fillAndSubmitLoginForm(
  page: Page,
  email: string = 'test@example.com',
  password: string = 'Test1234',
) {
  await page.getByPlaceholder(/you@example.com/i).fill(email)
  await page.getByPlaceholder(/enter your password/i).fill(password)
  await page.getByRole('button', { name: /sign in/i }).click()
}

/**
 * Fill registration form and submit
 */
export async function fillAndSubmitRegistrationForm(
  page: Page,
  data: {
    name?: string
    email?: string
    password?: string
    acceptTerms?: boolean
  } = {},
) {
  const {
    name = 'Test User',
    email = 'test@example.com',
    password = 'Test1234',
    acceptTerms = true,
  } = data

  if (name) {
    await page.getByPlaceholder(/john doe/i).fill(name)
  }
  await page.getByPlaceholder(/you@example.com/i).fill(email)
  await page.getByPlaceholder(/create a strong password/i).fill(password)

  if (acceptTerms) {
    await page.getByRole('button', { name: /terms of service/i }).click()
  }

  await page.getByRole('button', { name: /create account/i }).click()
}

/**
 * Fill verification code
 */
export async function fillVerificationCode(page: Page, code: string = '123456') {
  const codeInputs = page.locator('input[type="text"][maxlength="1"]')

  for (let i = 0; i < code.length; i++) {
    const digit = code[i]
    if (digit) {
      await codeInputs.nth(i).fill(digit)
    }
  }
}

/**
 * Wait for navigation with timeout
 */
export async function waitForNavigation(page: Page, url: string | RegExp, timeout: number = 5000) {
  await page.waitForURL(url, { timeout })
}

/**
 * Mock Resend email service (prevent actual emails)
 */
export async function mockResendEmailService(page: Page) {
  await page.route('**/api/send-email', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    })
  })
}

/**
 * Check if user is authenticated (session exists)
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const cookies = await page.context().cookies()
  return cookies.some((c) => c.name.includes('session') || c.name.includes('next-auth'))
}

/**
 * Clear all authentication cookies
 */
export async function clearAuthCookies(page: Page) {
  await page.context().clearCookies()
}
