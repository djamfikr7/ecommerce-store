# Contributing Guidelines

Thank you for considering contributing to the E-Commerce Web Store project!

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)
- [Issue Reporting](#issue-reporting)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Expected Behavior

- Be respectful and considerate
- Use welcoming and inclusive language
- Accept constructive criticism gracefully
- Focus on what's best for the project
- Show empathy towards other contributors

### Unacceptable Behavior

- Harassment or discriminatory language
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information
- Any conduct that could be considered inappropriate

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- PostgreSQL 16.x (or Supabase account)
- Git

### Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR-USERNAME/Git_Volt_agent.git
cd Git_Volt_agent

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL-OWNER/Git_Volt_agent.git
```

### Install Dependencies

```bash
npm install
```

### Set Up Environment

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your credentials
```

### Initialize Database

```bash
npm run db:setup
```

### Start Development Server

```bash
npm run dev
```

## Development Workflow

### 1. Create a Branch

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or changes
- `chore/` - Maintenance tasks

### 2. Make Changes

- Write clean, readable code
- Follow coding standards (see below)
- Add tests for new features
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run linter
npm run lint

# Run type check
npm run typecheck

# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Run all checks
npm run test:all
```

### 4. Commit Your Changes

```bash
# Stage changes
git add .

# Commit with conventional commit message
git commit -m "feat: add product filtering by price range"
```

See [Commit Guidelines](#commit-guidelines) below.

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill out PR template
5. Submit for review

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types (avoid `any`)
- Use interfaces for object shapes
- Export types when needed

```typescript
// ✅ Good
interface Product {
  id: string
  name: string
  price: number
}

function getProduct(id: string): Promise<Product> {
  // ...
}

// ❌ Bad
function getProduct(id: any): any {
  // ...
}
```

### React Components

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper prop types

```typescript
// ✅ Good
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export function Button({ onClick, children, variant = 'primary' }: ButtonProps) {
  return (
    <button onClick={onClick} className={`btn-${variant}`}>
      {children}
    </button>
  );
}

// ❌ Bad
export function Button(props: any) {
  return <button onClick={props.onClick}>{props.children}</button>;
}
```

### File Organization

```
src/
├── app/              # Next.js pages and API routes
├── components/       # React components
│   ├── ui/          # Primitive components
│   └── feature/     # Feature-specific components
├── lib/             # Utilities and libraries
│   ├── db/          # Database utilities
│   ├── utils/       # Helper functions
│   └── hooks/       # Custom hooks
└── types/           # TypeScript types
```

### Naming Conventions

- **Files**: `kebab-case.tsx`
- **Components**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Types/Interfaces**: `PascalCase`

```typescript
// File: product-card.tsx
export interface ProductCardProps {
  product: Product;
}

const MAX_PRODUCTS = 100;

export function ProductCard({ product }: ProductCardProps) {
  const handleClick = () => {
    // ...
  };

  return <div onClick={handleClick}>{product.name}</div>;
}
```

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Format code
npm run format

# Check formatting
npm run format:check

# Fix linting issues
npm run lint:fix
```

**Key Rules:**

- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons
- Max line length: 100 characters
- Use trailing commas

### Comments

- Write self-documenting code
- Add comments for complex logic
- Use JSDoc for public APIs

```typescript
/**
 * Calculates the total price including tax and shipping
 * @param subtotal - Subtotal in cents
 * @param taxRate - Tax rate as decimal (e.g., 0.08 for 8%)
 * @param shippingCost - Shipping cost in cents
 * @returns Total price in cents
 */
export function calculateTotal(subtotal: number, taxRate: number, shippingCost: number): number {
  const tax = Math.round(subtotal * taxRate)
  return subtotal + tax + shippingCost
}
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### Examples

```bash
# Feature
git commit -m "feat(cart): add quantity selector to cart items"

# Bug fix
git commit -m "fix(checkout): resolve payment validation error"

# Documentation
git commit -m "docs: update API documentation for products endpoint"

# Breaking change
git commit -m "feat(api)!: change product API response format

BREAKING CHANGE: Product API now returns price in cents instead of dollars"
```

### Commit Message Rules

- Use imperative mood ("add" not "added")
- Don't capitalize first letter
- No period at the end
- Keep subject line under 72 characters
- Reference issues in footer (`Closes #123`)

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] No commented-out code
- [ ] Branch is up to date with main

### PR Title

Use conventional commit format:

```
feat(products): add price range filter
fix(auth): resolve login redirect issue
docs: update setup instructions
```

### PR Description Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues

Closes #123

## Testing

- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)

[Add screenshots here]

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
```

### Review Process

1. **Automated Checks**: CI runs tests and linting
2. **Code Review**: Maintainers review code
3. **Feedback**: Address review comments
4. **Approval**: At least one approval required
5. **Merge**: Maintainer merges PR

### Addressing Feedback

```bash
# Make changes based on feedback
git add .
git commit -m "refactor: address review feedback"
git push origin feature/your-feature-name
```

## Testing Requirements

### Unit Tests

All new features must include unit tests:

```typescript
// src/lib/utils/calculate-total.test.ts
import { calculateTotal } from './calculate-total'

describe('calculateTotal', () => {
  it('calculates total with tax and shipping', () => {
    const result = calculateTotal(10000, 0.08, 500)
    expect(result).toBe(11300) // 10000 + 800 + 500
  })
})
```

### Component Tests

Test component behavior, not implementation:

```typescript
// src/components/ui/button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './button';

test('calls onClick when clicked', async () => {
  const handleClick = vi.fn();
  render(<Button onClick={handleClick}>Click Me</Button>);

  await userEvent.click(screen.getByText('Click Me'));
  expect(handleClick).toHaveBeenCalled();
});
```

### E2E Tests

Add E2E tests for critical user flows:

```typescript
// e2e/checkout.spec.ts
import { test, expect } from '@playwright/test'

test('completes checkout flow', async ({ page }) => {
  await page.goto('/')
  await page.click('text=Add to Cart')
  await page.click('text=Checkout')
  // ... complete checkout
  await expect(page.locator('text=Order confirmed')).toBeVisible()
})
```

### Coverage Requirements

- Minimum 80% code coverage
- All new features must have tests
- Critical paths must have E2E tests

## Documentation

### Code Documentation

- Add JSDoc comments for public APIs
- Document complex algorithms
- Explain non-obvious code

### README Updates

Update README.md if you:

- Add new features
- Change setup process
- Modify dependencies

### API Documentation

Update `docs/API.md` for:

- New API endpoints
- Changed request/response formats
- New query parameters

### Component Documentation

Update `docs/COMPONENTS.md` for:

- New components
- Changed component APIs
- New props or features

## Issue Reporting

### Before Creating an Issue

- Search existing issues
- Check documentation
- Try latest version

### Bug Reports

Use the bug report template:

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:

1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen

**Screenshots**
If applicable

**Environment**

- OS: [e.g., macOS 14]
- Browser: [e.g., Chrome 122]
- Node version: [e.g., 20.11.0]

**Additional context**
Any other relevant information
```

### Feature Requests

Use the feature request template:

```markdown
**Is your feature request related to a problem?**
Clear description of the problem

**Describe the solution you'd like**
Clear description of desired solution

**Describe alternatives you've considered**
Alternative solutions or features

**Additional context**
Any other relevant information
```

## Questions?

- Check [documentation](./SETUP.md)
- Search [existing issues](https://github.com/your-org/your-repo/issues)
- Ask in [discussions](https://github.com/your-org/your-repo/discussions)

## License

By contributing, you agree that your contributions will be licensed under the project's license.

## Recognition

Contributors will be recognized in:

- GitHub contributors page
- Release notes
- Project README (for significant contributions)

Thank you for contributing! 🎉
