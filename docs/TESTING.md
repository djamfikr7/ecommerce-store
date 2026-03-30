# Testing Guide

Comprehensive testing guide for the E-Commerce Web Store.

## Testing Stack

- **Vitest 4.x**: Unit and integration tests
- **Playwright 1.48+**: End-to-end tests
- **Testing Library**: Component testing
- **MSW 2.x**: API mocking

## Test Structure

```
Git_Volt_agent/
├── src/
│   ├── test/
│   │   ├── setup.ts              # Test setup
│   │   ├── utils/
│   │   │   └── render-with-providers.tsx
│   │   └── examples/
│   │       └── button.test.tsx
│   └── **/*.test.tsx             # Component tests
├── e2e/
│   ├── auth.spec.ts              # Auth E2E tests
│   ├── checkout.spec.ts          # Checkout E2E tests
│   ├── products.spec.ts          # Product E2E tests
│   └── admin.spec.ts             # Admin E2E tests
├── vitest.config.ts              # Vitest configuration
└── playwright.config.ts          # Playwright configuration
```

## Running Tests

### Unit & Integration Tests

```bash
# Run tests in watch mode
npm run test

# Run tests once (CI mode)
npm run test:ci

# Run with UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# Run specific test file
npm run test src/components/ui/button.test.tsx

# Run tests matching pattern
npm run test -- --grep "Button"
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI (interactive)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npm run test:e2e e2e/checkout.spec.ts

# Run specific browser
npm run test:e2e -- --project=chromium
```

### All Tests

```bash
# Run all tests (unit + E2E)
npm run test:all
```

## Unit Testing

### Component Testing

**Example: Button Component**

```typescript
// src/components/ui/button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);

    await userEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeDisabled();
  });

  it('applies variant classes', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByText('Delete');
    expect(button).toHaveClass('bg-red-600');
  });
});
```

### Testing with Providers

**Example: Component with Context**

```typescript
// src/test/utils/render-with-providers.tsx
import { render } from '@testing-library/react';
import { CartProvider } from '@/components/providers/cart-provider';
import { CurrencyProvider } from '@/components/currency/currency-context';

export function renderWithProviders(ui: React.ReactElement) {
  return render(
    <CurrencyProvider>
      <CartProvider>
        {ui}
      </CartProvider>
    </CurrencyProvider>
  );
}

// Usage in test
import { renderWithProviders } from '@/test/utils/render-with-providers';
import { ProductCard } from './product-card';

test('adds product to cart', async () => {
  renderWithProviders(<ProductCard product={mockProduct} />);

  await userEvent.click(screen.getByText('Add to Cart'));
  expect(screen.getByText('Added to cart')).toBeInTheDocument();
});
```

### Testing Async Components

```typescript
import { waitFor } from '@testing-library/react';

test('loads and displays products', async () => {
  render(<ProductList />);

  // Wait for loading to finish
  await waitFor(() => {
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  // Check products are displayed
  expect(screen.getByText('Product 1')).toBeInTheDocument();
});
```

### Testing Forms

```typescript
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './login-form';

test('submits form with valid data', async () => {
  const handleSubmit = vi.fn();
  render(<LoginForm onSubmit={handleSubmit} />);

  // Fill form
  await userEvent.type(screen.getByLabelText('Email'), 'user@example.com');
  await userEvent.type(screen.getByLabelText('Password'), 'password123');

  // Submit
  await userEvent.click(screen.getByText('Log In'));

  // Check submission
  await waitFor(() => {
    expect(handleSubmit).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });
  });
});

test('shows validation errors', async () => {
  render(<LoginForm onSubmit={vi.fn()} />);

  // Submit without filling
  await userEvent.click(screen.getByText('Log In'));

  // Check errors
  expect(screen.getByText('Email is required')).toBeInTheDocument();
  expect(screen.getByText('Password is required')).toBeInTheDocument();
});
```

### API Mocking with MSW

**Setup:**

```typescript
// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/products', () => {
    return HttpResponse.json({
      products: [
        { id: '1', name: 'Product 1', price: 9999 },
        { id: '2', name: 'Product 2', price: 14999 },
      ],
    })
  }),

  http.post('/api/cart/items', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      message: 'Item added to cart',
      cart: { items: [body] },
    })
  }),
]

// src/test/setup.ts
import { setupServer } from 'msw/node'
import { handlers } from './mocks/handlers'

const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

**Usage in tests:**

```typescript
import { http, HttpResponse } from 'msw';
import { server } from '@/test/setup';

test('handles API error', async () => {
  // Override handler for this test
  server.use(
    http.get('/api/products', () => {
      return HttpResponse.json(
        { error: 'Server error' },
        { status: 500 }
      );
    })
  );

  render(<ProductList />);

  await waitFor(() => {
    expect(screen.getByText('Failed to load products')).toBeInTheDocument();
  });
});
```

## Integration Testing

### Testing API Routes

```typescript
// src/app/api/products/route.test.ts
import { GET } from './route'

describe('GET /api/products', () => {
  it('returns products', async () => {
    const request = new Request('http://localhost:3000/api/products')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.products).toHaveLength(20)
  })

  it('filters by category', async () => {
    const request = new Request('http://localhost:3000/api/products?category=electronics')
    const response = await GET(request)
    const data = await response.json()

    expect(data.products.every((p) => p.category.slug === 'electronics')).toBe(true)
  })
})
```

### Testing Database Operations

```typescript
import { prisma } from '@/lib/db/prisma'
import { createProduct } from '@/lib/db/products'

describe('createProduct', () => {
  afterEach(async () => {
    // Clean up test data
    await prisma.product.deleteMany({
      where: { sku: { startsWith: 'TEST-' } },
    })
  })

  it('creates product in database', async () => {
    const product = await createProduct({
      name: 'Test Product',
      slug: 'test-product',
      sku: 'TEST-001',
      price: 9999,
      stockQuantity: 100,
    })

    expect(product.id).toBeDefined()
    expect(product.name).toBe('Test Product')

    // Verify in database
    const dbProduct = await prisma.product.findUnique({
      where: { id: product.id },
    })
    expect(dbProduct).toBeTruthy()
  })
})
```

## E2E Testing with Playwright

### Basic E2E Test

```typescript
// e2e/products.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Product Listing', () => {
  test('displays products', async ({ page }) => {
    await page.goto('/')

    // Wait for products to load
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible()

    // Check product count
    const productCount = await page.locator('[data-testid="product-card"]').count()
    expect(productCount).toBeGreaterThan(0)
  })

  test('filters products by category', async ({ page }) => {
    await page.goto('/')

    // Click category filter
    await page.click('text=Electronics')

    // Wait for filtered results
    await page.waitForURL(/category=electronics/)

    // Verify filtered products
    const products = page.locator('[data-testid="product-card"]')
    await expect(products.first()).toBeVisible()
  })

  test('searches for products', async ({ page }) => {
    await page.goto('/')

    // Search
    await page.fill('[placeholder="Search products"]', 'laptop')
    await page.press('[placeholder="Search products"]', 'Enter')

    // Wait for results
    await page.waitForURL(/search=laptop/)

    // Verify results contain search term
    const firstProduct = page.locator('[data-testid="product-card"]').first()
    await expect(firstProduct).toContainText(/laptop/i)
  })
})
```

### Testing Authentication Flow

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('user can register', async ({ page }) => {
    await page.goto('/register')

    // Fill registration form
    await page.fill('[name="name"]', 'Test User')
    await page.fill('[name="email"]', `test-${Date.now()}@example.com`)
    await page.fill('[name="password"]', 'SecurePass123!')

    // Submit
    await page.click('button[type="submit"]')

    // Check success message
    await expect(page.locator('text=Please check your email')).toBeVisible()
  })

  test('user can login', async ({ page }) => {
    await page.goto('/login')

    // Fill login form
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')

    // Submit
    await page.click('button[type="submit"]')

    // Check redirect to home
    await page.waitForURL('/')

    // Verify logged in
    await expect(page.locator('[data-testid="user-button"]')).toBeVisible()
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.fill('[name="email"]', 'wrong@example.com')
    await page.fill('[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=Invalid credentials')).toBeVisible()
  })
})
```

### Testing Checkout Flow

```typescript
// e2e/checkout.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Checkout', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/')
  })

  test('completes checkout flow', async ({ page }) => {
    // Add product to cart
    await page.goto('/products/test-product')
    await page.click('text=Add to Cart')

    // Go to cart
    await page.click('[data-testid="cart-button"]')
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible()

    // Proceed to checkout
    await page.click('text=Checkout')

    // Fill shipping address
    await page.fill('[name="firstName"]', 'John')
    await page.fill('[name="lastName"]', 'Doe')
    await page.fill('[name="addressLine1"]', '123 Main St')
    await page.fill('[name="city"]', 'New York')
    await page.fill('[name="state"]', 'NY')
    await page.fill('[name="postalCode"]', '10001')
    await page.fill('[name="country"]', 'US')
    await page.click('text=Continue to Payment')

    // Fill payment (test mode)
    await page.fill('[placeholder="Card number"]', '4242424242424242')
    await page.fill('[placeholder="MM / YY"]', '12/30')
    await page.fill('[placeholder="CVC"]', '123')

    // Complete order
    await page.click('text=Place Order')

    // Verify success
    await expect(page.locator('text=Order confirmed')).toBeVisible()
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible()
  })
})
```

### Testing with Different Viewports

```typescript
test('is responsive on mobile', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 })

  await page.goto('/')

  // Check mobile menu
  await page.click('[data-testid="mobile-menu-button"]')
  await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
})
```

### Testing with Authentication State

```typescript
// e2e/auth.setup.ts
import { test as setup } from '@playwright/test'

const authFile = 'playwright/.auth/user.json'

setup('authenticate', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')
  await page.waitForURL('/')

  // Save authentication state
  await page.context().storageState({ path: authFile })
})

// Use in tests
test.use({ storageState: authFile })
```

## Test Coverage

### Generate Coverage Report

```bash
npm run test:coverage
```

Coverage report is generated in `coverage/` directory.

### Coverage Goals

- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

### View Coverage

```bash
# Open HTML report
open coverage/index.html
```

## Testing Best Practices

### 1. Test Behavior, Not Implementation

```typescript
// ❌ Bad: Testing implementation details
test('sets state to true', () => {
  const { result } = renderHook(() => useState(false));
  act(() => result.current[1](true));
  expect(result.current[0]).toBe(true);
});

// ✅ Good: Testing user behavior
test('shows success message after submission', async () => {
  render(<Form />);
  await userEvent.click(screen.getByText('Submit'));
  expect(screen.getByText('Success!')).toBeInTheDocument();
});
```

### 2. Use Data Test IDs Sparingly

```typescript
// ❌ Bad: Overusing test IDs
<button data-testid="submit-button">Submit</button>

// ✅ Good: Use accessible queries
<button type="submit">Submit</button>

// In test
screen.getByRole('button', { name: 'Submit' });
```

### 3. Avoid Testing Third-Party Libraries

```typescript
// ❌ Bad: Testing Stripe library
test('stripe processes payment', () => {
  // Testing Stripe's functionality
})

// ✅ Good: Test your integration
test('calls payment API with correct data', () => {
  // Test your code that uses Stripe
})
```

### 4. Keep Tests Independent

```typescript
// ❌ Bad: Tests depend on each other
let userId
test('creates user', () => {
  userId = createUser()
})
test('updates user', () => {
  updateUser(userId) // Depends on previous test
})

// ✅ Good: Independent tests
test('creates user', () => {
  const userId = createUser()
  expect(userId).toBeDefined()
})
test('updates user', () => {
  const userId = createUser()
  updateUser(userId)
  // ...
})
```

### 5. Use Descriptive Test Names

```typescript
// ❌ Bad
test('button test', () => {})

// ✅ Good
test('disables submit button when form is invalid', () => {})
```

## Debugging Tests

### Debug Vitest Tests

```bash
# Run tests in debug mode
npm run test -- --inspect-brk

# Or use VS Code debugger
# Add breakpoint and press F5
```

### Debug Playwright Tests

```bash
# Run with headed browser
npm run test:e2e:headed

# Run with Playwright Inspector
PWDEBUG=1 npm run test:e2e

# Run with UI mode
npm run test:e2e:ui
```

### View Test Traces

```bash
# Generate trace
npm run test:e2e -- --trace on

# View trace
npx playwright show-trace trace.zip
```

## Continuous Integration

Tests run automatically on every PR via GitHub Actions:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:ci
      - run: npm run test:e2e
```

## Common Testing Patterns

### Testing Loading States

```typescript
test('shows loading spinner', () => {
  render(<ProductList />);
  expect(screen.getByTestId('spinner')).toBeInTheDocument();
});
```

### Testing Error States

```typescript
test('shows error message on failure', async () => {
  server.use(
    http.get('/api/products', () => {
      return HttpResponse.json({ error: 'Failed' }, { status: 500 });
    })
  );

  render(<ProductList />);

  await waitFor(() => {
    expect(screen.getByText('Failed to load products')).toBeInTheDocument();
  });
});
```

### Testing Optimistic Updates

```typescript
test('updates UI optimistically', async () => {
  render(<CartButton productId="123" />);

  await userEvent.click(screen.getByText('Add to Cart'));

  // Should update immediately
  expect(screen.getByText('Added to cart')).toBeInTheDocument();

  // Then confirm with server
  await waitFor(() => {
    expect(screen.getByText('1 item in cart')).toBeInTheDocument();
  });
});
```

## Resources

- [Vitest Documentation](https://vitest.dev)
- [Playwright Documentation](https://playwright.dev)
- [Testing Library Documentation](https://testing-library.com)
- [MSW Documentation](https://mswjs.io)
