# Quick Start Guide - E2E Tests

## Prerequisites

```bash
# Install dependencies (if not already installed)
npm install

# Install Playwright browsers
npx playwright install
```

## Running Tests

### Run All Tests
```bash
npm run test:e2e
```

### Run Specific Test Suite
```bash
# Authentication tests only
npx playwright test e2e/auth/

# Profile tests only
npx playwright test e2e/profile/

# Specific test file
npx playwright test e2e/auth/login.spec.ts
```

### Interactive Mode
```bash
# UI Mode (recommended for development)
npx playwright test --ui

# Headed mode (see browser)
npx playwright test --headed

# Debug mode
npx playwright test --debug
```

### Browser Selection
```bash
# Run on specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run on mobile
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

## View Test Results

```bash
# Generate and open HTML report
npx playwright show-report

# View last test results
npx playwright show-report playwright-report
```

## Common Commands

```bash
# Run tests matching pattern
npx playwright test login

# Run tests in parallel
npx playwright test --workers=4

# Run tests with retries
npx playwright test --retries=2

# Update snapshots
npx playwright test --update-snapshots

# Generate code (record actions)
npx playwright codegen http://localhost:3000
```

## Test Structure

Each test file follows this pattern:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/page-url')
  })

  test('should do something', async ({ page }) => {
    // Test implementation
    await page.getByRole('button').click()
    await expect(page.getByText('Success')).toBeVisible()
  })
})
```

## Using Helper Functions

```typescript
import { mockAuthSession, fillAndSubmitLoginForm } from '@/e2e/helpers/auth.helpers'

test('example with helpers', async ({ page }) => {
  // Mock authenticated session
  await mockAuthSession(page)
  
  // Fill and submit login form
  await fillAndSubmitLoginForm(page, 'user@example.com', 'Password123')
})
```

## Debugging Tips

1. **Use UI Mode**: `npx playwright test --ui`
   - Step through tests
   - See screenshots
   - Inspect DOM

2. **Add Breakpoints**: Use `await page.pause()` in tests

3. **Slow Down**: `npx playwright test --headed --slow-mo=1000`

4. **Screenshots**: Tests automatically capture on failure

5. **Traces**: View traces with `npx playwright show-trace trace.zip`

## CI/CD Integration

Tests are configured to run in CI with:
- Retries on failure
- Parallel execution
- Screenshot/video capture
- HTML report generation

See `playwright.config.ts` for configuration.

## Troubleshooting

### Tests Failing Locally

1. Ensure dev server is running: `npm run dev`
2. Clear browser cache: `npx playwright test --clear-cache`
3. Update browsers: `npx playwright install`

### Timeout Issues

Increase timeout in test:
```typescript
test('slow test', async ({ page }) => {
  test.setTimeout(60000) // 60 seconds
  // test code
})
```

### Flaky Tests

- Add explicit waits: `await page.waitForLoadState('networkidle')`
- Use `toBeVisible()` instead of checking existence
- Ensure proper test isolation

## Next Steps

1. Read `e2e/README.md` for comprehensive documentation
2. Check `e2e/SUMMARY.md` for test coverage details
3. Explore `e2e/helpers/auth.helpers.ts` for reusable utilities
4. Run tests and review the HTML report

Happy Testing! 🎭
