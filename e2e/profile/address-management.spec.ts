import { test, expect } from '@playwright/test'

test.describe('Address Management', () => {
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

    await page.goto('/profile/addresses')
  })

  test('should display addresses page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /addresses/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /add address/i })).toBeVisible()
  })

  test('should show empty state when no addresses', async ({ page }) => {
    await page.route('**/api/addresses', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    })

    await page.reload()

    await expect(page.getByText(/no addresses yet/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /add.*first address/i })).toBeVisible()
  })

  test('should display existing addresses', async ({ page }) => {
    await page.route('**/api/addresses', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            type: 'SHIPPING',
            firstName: 'John',
            lastName: 'Doe',
            addressLine1: '123 Main St',
            addressLine2: 'Apt 4B',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94102',
            country: 'US',
            phone: '+1234567890',
            isDefault: true,
          },
        ]),
      })
    })

    await page.reload()

    await expect(page.getByText('John Doe')).toBeVisible()
    await expect(page.getByText('123 Main St')).toBeVisible()
    await expect(page.getByText(/san francisco.*ca.*94102/i)).toBeVisible()
    await expect(page.getByText('Default')).toBeVisible()
  })

  test('should open add address form', async ({ page }) => {
    await page.getByRole('button', { name: /add address/i }).click()

    await expect(page.getByRole('heading', { name: /add new address/i })).toBeVisible()
    await expect(page.getByLabel(/first name/i)).toBeVisible()
    await expect(page.getByLabel(/last name/i)).toBeVisible()
    await expect(page.getByLabel(/address line 1/i)).toBeVisible()
  })

  test('should validate required address fields', async ({ page }) => {
    await page.getByRole('button', { name: /add address/i }).click()
    await page
      .getByRole('button', { name: /add address/i })
      .nth(1)
      .click()

    await expect(page.getByText(/first name.*required/i)).toBeVisible()
    await expect(page.getByText(/last name.*required/i)).toBeVisible()
    await expect(page.getByText(/address.*required/i)).toBeVisible()
    await expect(page.getByText(/city.*required/i)).toBeVisible()
    await expect(page.getByText(/state.*required/i)).toBeVisible()
    await expect(page.getByText(/zip.*required/i)).toBeVisible()
  })

  test('should validate ZIP code format', async ({ page }) => {
    await page.getByRole('button', { name: /add address/i }).click()

    await page.getByLabel(/zip code/i).fill('invalid')
    await page
      .getByRole('button', { name: /add address/i })
      .nth(1)
      .click()

    await expect(page.getByText(/invalid zip code/i)).toBeVisible()
  })

  test('should validate phone number format', async ({ page }) => {
    await page.getByRole('button', { name: /add address/i }).click()

    await page.getByLabel(/phone/i).fill('invalid-phone')
    await page
      .getByRole('button', { name: /add address/i })
      .nth(1)
      .click()

    await expect(page.getByText(/invalid phone/i)).toBeVisible()
  })

  test('should successfully add new address', async ({ page }) => {
    await page.route('**/api/addresses', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            address: {
              id: '2',
              type: 'SHIPPING',
              firstName: 'Jane',
              lastName: 'Smith',
              addressLine1: '456 Oak Ave',
              city: 'Los Angeles',
              state: 'CA',
              postalCode: '90001',
              country: 'US',
              isDefault: false,
            },
          }),
        })
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        })
      }
    })

    await page.getByRole('button', { name: /add address/i }).click()

    await page.getByLabel(/first name/i).fill('Jane')
    await page.getByLabel(/last name/i).fill('Smith')
    await page.getByLabel(/address line 1/i).fill('456 Oak Ave')
    await page.getByLabel(/city/i).fill('Los Angeles')
    await page.getByLabel(/state/i).selectOption('CA')
    await page.getByLabel(/zip code/i).fill('90001')

    await page
      .getByRole('button', { name: /add address/i })
      .nth(1)
      .click()

    // Form should close
    await expect(page.getByRole('heading', { name: /add new address/i })).not.toBeVisible()
  })

  test('should edit existing address', async ({ page }) => {
    await page.route('**/api/addresses', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            type: 'SHIPPING',
            firstName: 'John',
            lastName: 'Doe',
            addressLine1: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94102',
            country: 'US',
            isDefault: false,
          },
        ]),
      })
    })

    await page.reload()

    // Click edit button
    await page.getByRole('button', { name: /edit/i }).first().click()

    await expect(page.getByRole('heading', { name: /edit address/i })).toBeVisible()

    // Fields should be pre-filled
    await expect(page.getByLabel(/first name/i)).toHaveValue('John')
    await expect(page.getByLabel(/last name/i)).toHaveValue('Doe')
  })

  test('should update address successfully', async ({ page }) => {
    await page.route('**/api/addresses', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            type: 'SHIPPING',
            firstName: 'John',
            lastName: 'Doe',
            addressLine1: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94102',
            country: 'US',
            isDefault: false,
          },
        ]),
      })
    })

    await page.route('**/api/addresses/1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          address: {
            id: '1',
            firstName: 'John',
            lastName: 'Smith',
            addressLine1: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94102',
            country: 'US',
          },
        }),
      })
    })

    await page.reload()

    await page.getByRole('button', { name: /edit/i }).first().click()
    await page.getByLabel(/last name/i).fill('Smith')
    await page.getByRole('button', { name: /update address/i }).click()

    // Form should close
    await expect(page.getByRole('heading', { name: /edit address/i })).not.toBeVisible()
  })

  test('should delete address with confirmation', async ({ page }) => {
    await page.route('**/api/addresses', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            type: 'SHIPPING',
            firstName: 'John',
            lastName: 'Doe',
            addressLine1: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94102',
            country: 'US',
            isDefault: false,
          },
        ]),
      })
    })

    await page.reload()

    // Mock confirmation dialog
    page.on('dialog', (dialog) => dialog.accept())

    await page.route('**/api/addresses/1', async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        })
      }
    })

    await page
      .getByRole('button', { name: /delete/i })
      .first()
      .click()
  })

  test('should cancel delete on dialog dismiss', async ({ page }) => {
    await page.route('**/api/addresses', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            type: 'SHIPPING',
            firstName: 'John',
            lastName: 'Doe',
            addressLine1: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94102',
            country: 'US',
            isDefault: false,
          },
        ]),
      })
    })

    await page.reload()

    // Mock confirmation dialog - dismiss
    page.on('dialog', (dialog) => dialog.dismiss())

    await page
      .getByRole('button', { name: /delete/i })
      .first()
      .click()

    // Address should still be visible
    await expect(page.getByText('John Doe')).toBeVisible()
  })

  test('should set address as default', async ({ page }) => {
    await page.route('**/api/addresses', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            type: 'SHIPPING',
            firstName: 'John',
            lastName: 'Doe',
            addressLine1: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94102',
            country: 'US',
            isDefault: false,
          },
        ]),
      })
    })

    await page.route('**/api/addresses/1/default', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          address: { id: '1', isDefault: true },
        }),
      })
    })

    await page.reload()

    await page.getByRole('button', { name: /set as default/i }).click()
  })

  test('should cancel form', async ({ page }) => {
    await page.getByRole('button', { name: /add address/i }).click()

    await expect(page.getByRole('heading', { name: /add new address/i })).toBeVisible()

    await page.getByRole('button', { name: /cancel/i }).click()

    await expect(page.getByRole('heading', { name: /add new address/i })).not.toBeVisible()
  })

  test('should show loading state during submission', async ({ page }) => {
    await page.route('**/api/addresses', async (route) => {
      if (route.request().method() === 'POST') {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        })
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        })
      }
    })

    await page.getByRole('button', { name: /add address/i }).click()

    await page.getByLabel(/first name/i).fill('Jane')
    await page.getByLabel(/last name/i).fill('Smith')
    await page.getByLabel(/address line 1/i).fill('456 Oak Ave')
    await page.getByLabel(/city/i).fill('Los Angeles')
    await page.getByLabel(/state/i).selectOption('CA')
    await page.getByLabel(/zip code/i).fill('90001')

    await page
      .getByRole('button', { name: /add address/i })
      .nth(1)
      .click()

    // Should show loading state
    const submitButton = page.getByRole('button', { name: /add address/i }).nth(1)
    await expect(submitButton).toBeDisabled()
  })

  test('should handle server error', async ({ page }) => {
    await page.route('**/api/addresses', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Failed to save address',
          }),
        })
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        })
      }
    })

    await page.getByRole('button', { name: /add address/i }).click()

    await page.getByLabel(/first name/i).fill('Jane')
    await page.getByLabel(/last name/i).fill('Smith')
    await page.getByLabel(/address line 1/i).fill('456 Oak Ave')
    await page.getByLabel(/city/i).fill('Los Angeles')
    await page.getByLabel(/state/i).selectOption('CA')
    await page.getByLabel(/zip code/i).fill('90001')

    await page
      .getByRole('button', { name: /add address/i })
      .nth(1)
      .click()

    await expect(page.getByText(/failed.*save/i)).toBeVisible()
  })

  test('should display address type badges', async ({ page }) => {
    await page.route('**/api/addresses', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            type: 'SHIPPING',
            firstName: 'John',
            lastName: 'Doe',
            addressLine1: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94102',
            country: 'US',
            isDefault: false,
          },
          {
            id: '2',
            type: 'BILLING',
            firstName: 'Jane',
            lastName: 'Smith',
            addressLine1: '456 Oak Ave',
            city: 'Los Angeles',
            state: 'CA',
            postalCode: '90001',
            country: 'US',
            isDefault: false,
          },
        ]),
      })
    })

    await page.reload()

    await expect(page.getByText('SHIPPING')).toBeVisible()
    await expect(page.getByText('BILLING')).toBeVisible()
  })

  test('should clear validation errors on input change', async ({ page }) => {
    await page.getByRole('button', { name: /add address/i }).click()
    await page
      .getByRole('button', { name: /add address/i })
      .nth(1)
      .click()

    await expect(page.getByText(/first name.*required/i)).toBeVisible()

    await page.getByLabel(/first name/i).fill('John')

    await expect(page.getByText(/first name.*required/i)).not.toBeVisible()
  })

  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      })
    })

    await page.goto('/profile/addresses')
    await expect(page).toHaveURL(/\/login/)
  })

  test('should have accessible form labels', async ({ page }) => {
    await page.getByRole('button', { name: /add address/i }).click()

    await expect(page.getByLabel(/first name/i)).toBeVisible()
    await expect(page.getByLabel(/last name/i)).toBeVisible()
    await expect(page.getByLabel(/address line 1/i)).toBeVisible()
    await expect(page.getByLabel(/city/i)).toBeVisible()
    await expect(page.getByLabel(/state/i)).toBeVisible()
    await expect(page.getByLabel(/zip code/i)).toBeVisible()
  })
})
