import { test, expect } from '@playwright/test'

test.describe('Email Verification Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock Resend email service
    await page.route('**/api/auth/resend-verification', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Verification email sent',
        }),
      })
    })
  })

  test('should display verification page after registration', async ({ page }) => {
    await page.goto('/verify-email?email=test@example.com')

    await expect(page.getByRole('heading', { name: /verify.*email/i })).toBeVisible()
    await expect(page.getByText(/test@example\.com/i)).toBeVisible()
  })

  test('should show verification code input', async ({ page }) => {
    await page.goto('/verify-email?email=test@example.com')

    // Should have 6 digit code inputs
    const codeInputs = page.locator('input[type="text"][maxlength="1"]')
    await expect(codeInputs).toHaveCount(6)
  })

  test('should verify email with valid code', async ({ page }) => {
    await page.route('**/api/auth/verify-email', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
        }),
      })
    })

    await page.goto('/verify-email?email=test@example.com')

    // Enter verification code
    const codeInputs = page.locator('input[type="text"][maxlength="1"]')
    const code = '123456'

    for (let i = 0; i < code.length; i++) {
      await codeInputs.nth(i).fill(code[i])
    }

    // Should auto-submit and redirect
    await expect(page).toHaveURL('/')
    await expect(page.getByText(/email verified/i)).toBeVisible()
  })

  test('should verify email with token link', async ({ page }) => {
    await page.route('**/api/auth/verify-email', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
        }),
      })
    })

    // Simulate clicking verification link from email
    await page.goto('/verify-email?token=valid-token&email=test@example.com')

    // Should auto-verify and redirect
    await expect(page).toHaveURL('/')
    await expect(page.getByText(/email verified/i)).toBeVisible()
  })

  test('should handle invalid verification code', async ({ page }) => {
    await page.route('**/api/auth/verify-email', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Invalid verification code',
        }),
      })
    })

    await page.goto('/verify-email?email=test@example.com')

    const codeInputs = page.locator('input[type="text"][maxlength="1"]')
    const code = '000000'

    for (let i = 0; i < code.length; i++) {
      await codeInputs.nth(i).fill(code[i])
    }

    await expect(page.getByText(/invalid.*code/i)).toBeVisible()
  })

  test('should handle expired verification code', async ({ page }) => {
    await page.route('**/api/auth/verify-email', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Verification code has expired',
        }),
      })
    })

    await page.goto('/verify-email?email=test@example.com')

    const codeInputs = page.locator('input[type="text"][maxlength="1"]')
    const code = '123456'

    for (let i = 0; i < code.length; i++) {
      await codeInputs.nth(i).fill(code[i])
    }

    await expect(page.getByText(/expired/i)).toBeVisible()
  })

  test('should resend verification email', async ({ page }) => {
    await page.goto('/verify-email?email=test@example.com')

    await page.getByRole('button', { name: /resend.*code/i }).click()

    await expect(page.getByText(/verification.*sent/i)).toBeVisible()
  })

  test('should handle resend rate limiting', async ({ page }) => {
    await page.route('**/api/auth/resend-verification', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Please wait before requesting another code',
        }),
      })
    })

    await page.goto('/verify-email?email=test@example.com')

    await page.getByRole('button', { name: /resend.*code/i }).click()

    await expect(page.getByText(/wait.*before/i)).toBeVisible()
  })

  test('should show countdown timer after resend', async ({ page }) => {
    await page.goto('/verify-email?email=test@example.com')

    await page.getByRole('button', { name: /resend.*code/i }).click()

    // Should show countdown
    await expect(page.getByText(/resend in.*\d+/i)).toBeVisible()

    // Button should be disabled
    await expect(page.getByRole('button', { name: /resend/i })).toBeDisabled()
  })

  test('should auto-focus next input on digit entry', async ({ page }) => {
    await page.goto('/verify-email?email=test@example.com')

    const codeInputs = page.locator('input[type="text"][maxlength="1"]')

    // Type first digit
    await codeInputs.nth(0).fill('1')

    // Second input should be focused
    await expect(codeInputs.nth(1)).toBeFocused()
  })

  test('should handle backspace navigation', async ({ page }) => {
    await page.goto('/verify-email?email=test@example.com')

    const codeInputs = page.locator('input[type="text"][maxlength="1"]')

    // Fill first two inputs
    await codeInputs.nth(0).fill('1')
    await codeInputs.nth(1).fill('2')

    // Press backspace on second input
    await codeInputs.nth(1).press('Backspace')

    // Should clear and focus previous
    await expect(codeInputs.nth(0)).toBeFocused()
  })

  test('should handle paste of full code', async ({ page }) => {
    await page.route('**/api/auth/verify-email', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
        }),
      })
    })

    await page.goto('/verify-email?email=test@example.com')

    const firstInput = page.locator('input[type="text"][maxlength="1"]').first()

    // Paste full code
    await firstInput.focus()
    await page.evaluate(() => {
      const input = document.querySelector('input[type="text"][maxlength="1"]') as HTMLInputElement
      const event = new ClipboardEvent('paste', {
        clipboardData: new DataTransfer(),
      })
      event.clipboardData?.setData('text/plain', '123456')
      input.dispatchEvent(event)
    })

    // Should auto-submit
    await expect(page).toHaveURL('/')
  })

  test('should only accept numeric input', async ({ page }) => {
    await page.goto('/verify-email?email=test@example.com')

    const firstInput = page.locator('input[type="text"][maxlength="1"]').first()

    await firstInput.fill('a')
    await expect(firstInput).toHaveValue('')

    await firstInput.fill('1')
    await expect(firstInput).toHaveValue('1')
  })

  test('should handle missing email parameter', async ({ page }) => {
    await page.goto('/verify-email')

    await expect(page.getByText(/invalid.*missing.*email/i)).toBeVisible()
  })

  test('should navigate back to registration', async ({ page }) => {
    await page.goto('/verify-email?email=test@example.com')

    await page.getByRole('link', { name: /back.*register/i }).click()
    await expect(page).toHaveURL(/\/register/)
  })

  test('should show loading state during verification', async ({ page }) => {
    await page.route('**/api/auth/verify-email', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    })

    await page.goto('/verify-email?email=test@example.com')

    const codeInputs = page.locator('input[type="text"][maxlength="1"]')
    const code = '123456'

    for (let i = 0; i < code.length; i++) {
      await codeInputs.nth(i).fill(code[i])
    }

    // Should show loading indicator
    await expect(page.getByText(/verifying/i)).toBeVisible()
  })

  test('should handle already verified email', async ({ page }) => {
    await page.route('**/api/auth/verify-email', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Email already verified',
        }),
      })
    })

    await page.goto('/verify-email?token=valid-token&email=test@example.com')

    await expect(page.getByText(/already verified/i)).toBeVisible()
  })

  test('should clear error on new input', async ({ page }) => {
    await page.route('**/api/auth/verify-email', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Invalid verification code',
        }),
      })
    })

    await page.goto('/verify-email?email=test@example.com')

    const codeInputs = page.locator('input[type="text"][maxlength="1"]')

    // Enter invalid code
    for (let i = 0; i < 6; i++) {
      await codeInputs.nth(i).fill('0')
    }

    await expect(page.getByText(/invalid.*code/i)).toBeVisible()

    // Start entering new code
    await codeInputs.nth(0).fill('1')

    // Error should be cleared
    await expect(page.getByText(/invalid.*code/i)).not.toBeVisible()
  })

  test('should handle network error gracefully', async ({ page }) => {
    await page.route('**/api/auth/verify-email', async (route) => {
      await route.abort('failed')
    })

    await page.goto('/verify-email?email=test@example.com')

    const codeInputs = page.locator('input[type="text"][maxlength="1"]')
    const code = '123456'

    for (let i = 0; i < code.length; i++) {
      await codeInputs.nth(i).fill(code[i])
    }

    await expect(page.getByText(/failed.*try again/i)).toBeVisible()
  })

  test('should have accessible form', async ({ page }) => {
    await page.goto('/verify-email?email=test@example.com')

    // Should have proper labels
    const codeInputs = page.locator('input[type="text"][maxlength="1"]')
    for (let i = 0; i < 6; i++) {
      await expect(codeInputs.nth(i)).toHaveAttribute('aria-label')
    }
  })
})
