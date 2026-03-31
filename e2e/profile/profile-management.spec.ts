import { test, expect } from '@playwright/test'

test.describe('Profile Management', () => {
  test.beforeEach(async ({ page, context }) => {
    // Mock authenticated session
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            image: 'https://example.com/avatar.jpg',
            phone: '+1234567890',
            role: 'USER',
          },
        }),
      })
    })

    await page.goto('/profile')
  })

  test('should display profile page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /profile information/i })).toBeVisible()
    await expect(page.getByDisplayValue('Test User')).toBeVisible()
    await expect(page.getByDisplayValue('test@example.com')).toBeVisible()
  })

  test('should show user avatar', async ({ page }) => {
    await expect(page.locator('img[alt*="Test User"]')).toBeVisible()
  })

  test('should disable email field', async ({ page }) => {
    const emailInput = page.getByDisplayValue('test@example.com')
    await expect(emailInput).toBeDisabled()
  })

  test('should update profile successfully', async ({ page }) => {
    await page.route('**/api/profile/update', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Updated Name',
            phone: '+9876543210',
          },
        }),
      })
    })

    await page.getByLabel(/full name/i).fill('Updated Name')
    await page.getByLabel(/phone/i).fill('+9876543210')
    await page.getByRole('button', { name: /update profile/i }).click()

    await expect(page.getByText(/profile updated/i)).toBeVisible()
  })

  test('should validate phone number format', async ({ page }) => {
    await page.getByLabel(/phone/i).fill('invalid-phone')
    await page.getByRole('button', { name: /update profile/i }).click()

    await expect(page.getByText(/invalid phone/i)).toBeVisible()
  })

  test('should validate name length', async ({ page }) => {
    await page.getByLabel(/full name/i).fill('A')
    await page.getByRole('button', { name: /update profile/i }).click()

    await expect(page.getByText(/at least 2 characters/i)).toBeVisible()
  })

  test('should validate image URL format', async ({ page }) => {
    await page.getByLabel(/profile image/i).fill('not-a-url')
    await page.getByRole('button', { name: /update profile/i }).click()

    await expect(page.getByText(/invalid.*url/i)).toBeVisible()
  })

  test('should show loading state during update', async ({ page }) => {
    await page.route('**/api/profile/update', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    })

    await page.getByLabel(/full name/i).fill('Updated Name')
    await page.getByRole('button', { name: /update profile/i }).click()

    await expect(page.getByRole('button', { name: /updating/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /updating/i })).toBeDisabled()
  })

  test('should handle update error', async ({ page }) => {
    await page.route('**/api/profile/update', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Failed to update profile',
        }),
      })
    })

    await page.getByLabel(/full name/i).fill('Updated Name')
    await page.getByRole('button', { name: /update profile/i }).click()

    await expect(page.getByText(/failed.*update/i)).toBeVisible()
  })

  test('should clear success message after timeout', async ({ page }) => {
    await page.route('**/api/profile/update', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    })

    await page.getByLabel(/full name/i).fill('Updated Name')
    await page.getByRole('button', { name: /update profile/i }).click()

    await expect(page.getByText(/profile updated/i)).toBeVisible()

    // Wait for auto-dismiss
    await page.waitForTimeout(3500)
    await expect(page.getByText(/profile updated/i)).not.toBeVisible()
  })

  test('should redirect unauthenticated users to login', async ({ page, context }) => {
    // Clear session
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      })
    })

    await page.goto('/profile')
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe('Password Change', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authenticated session
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

    await page.goto('/profile')
  })

  test('should display password change form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /change password/i })).toBeVisible()
    await expect(page.getByLabel(/current password/i)).toBeVisible()
    await expect(page.getByLabel(/new password/i)).toBeVisible()
    await expect(page.getByLabel(/confirm.*password/i)).toBeVisible()
  })

  test('should validate all password fields required', async ({ page }) => {
    await page.getByRole('button', { name: /update password/i }).click()

    await expect(page.getByText(/current password.*required/i)).toBeVisible()
    await expect(page.getByText(/new password.*required/i)).toBeVisible()
  })

  test('should validate new password strength', async ({ page }) => {
    await page.getByLabel(/current password/i).fill('OldPass123')
    await page.getByLabel(/new password/i).fill('weak')
    await page.getByLabel(/confirm.*password/i).fill('weak')
    await page.getByRole('button', { name: /update password/i }).click()

    await expect(page.getByText(/at least 8 characters/i)).toBeVisible()
  })

  test('should validate password confirmation match', async ({ page }) => {
    await page.getByLabel(/current password/i).fill('OldPass123')
    await page.getByLabel(/new password/i).fill('NewPass123')
    await page.getByLabel(/confirm.*password/i).fill('DifferentPass123')
    await page.getByRole('button', { name: /update password/i }).click()

    await expect(page.getByText(/passwords.*match/i)).toBeVisible()
  })

  test('should successfully change password', async ({ page }) => {
    await page.route('**/api/profile/password', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
        }),
      })
    })

    await page.getByLabel(/current password/i).fill('OldPass123')
    await page.getByLabel(/new password/i).fill('NewPass123')
    await page.getByLabel(/confirm.*password/i).fill('NewPass123')
    await page.getByRole('button', { name: /update password/i }).click()

    await expect(page.getByText(/password updated/i)).toBeVisible()
  })

  test('should handle incorrect current password', async ({ page }) => {
    await page.route('**/api/profile/password', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Current password is incorrect',
        }),
      })
    })

    await page.getByLabel(/current password/i).fill('WrongPass123')
    await page.getByLabel(/new password/i).fill('NewPass123')
    await page.getByLabel(/confirm.*password/i).fill('NewPass123')
    await page.getByRole('button', { name: /update password/i }).click()

    await expect(page.getByText(/current password.*incorrect/i)).toBeVisible()
  })

  test('should clear form after successful password change', async ({ page }) => {
    await page.route('**/api/profile/password', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    })

    await page.getByLabel(/current password/i).fill('OldPass123')
    await page.getByLabel(/new password/i).fill('NewPass123')
    await page.getByLabel(/confirm.*password/i).fill('NewPass123')
    await page.getByRole('button', { name: /update password/i }).click()

    await expect(page.getByText(/password updated/i)).toBeVisible()

    // Form should be cleared
    await expect(page.getByLabel(/current password/i)).toHaveValue('')
    await expect(page.getByLabel(/new password/i)).toHaveValue('')
    await expect(page.getByLabel(/confirm.*password/i)).toHaveValue('')
  })

  test('should show loading state during password update', async ({ page }) => {
    await page.route('**/api/profile/password', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    })

    await page.getByLabel(/current password/i).fill('OldPass123')
    await page.getByLabel(/new password/i).fill('NewPass123')
    await page.getByLabel(/confirm.*password/i).fill('NewPass123')
    await page.getByRole('button', { name: /update password/i }).click()

    await expect(page.getByRole('button', { name: /updating/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /updating/i })).toBeDisabled()
  })

  test('should show password requirements hint', async ({ page }) => {
    await expect(page.getByText(/at least 8 characters.*uppercase.*number/i)).toBeVisible()
  })

  test('should have accessible password fields', async ({ page }) => {
    await expect(page.getByLabel(/current password/i)).toHaveAttribute('type', 'password')
    await expect(page.getByLabel(/new password/i)).toHaveAttribute('type', 'password')
    await expect(page.getByLabel(/confirm.*password/i)).toHaveAttribute('type', 'password')
  })
})
