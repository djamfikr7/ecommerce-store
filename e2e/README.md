# E2E Test Suite - Authentication & Profile Management

## Overview

Comprehensive Playwright E2E tests covering all authentication flows and profile management features.

## Test Files Created

### Authentication Tests (`e2e/auth/`)

1. **registration.spec.ts** - Registration flow tests
   - Form display and validation
   - OAuth provider buttons
   - Email format validation
   - Password strength validation
   - Terms acceptance requirement
   - Successful registration flow
   - Duplicate email handling
   - Server error handling
   - Loading states
   - Navigation between pages

2. **login.spec.ts** - Login flow tests
   - Form display and validation
   - OAuth provider buttons
   - Email/password validation
   - Successful login with valid credentials
   - Invalid credentials error handling
   - Loading states during submission
   - Session persistence
   - Network error handling
   - Accessibility features
   - Error message dismissal
   - Multiple submission prevention

3. **oauth.spec.ts** - OAuth flow tests
   - Google OAuth initiation
   - GitHub OAuth initiation
   - Successful OAuth callback
   - OAuth error handling
   - OAuth cancellation
   - Account linking to existing user
   - Existing email handling
   - Redirect URL preservation
   - OAuth timeout handling
   - Loading states
   - Missing email handling
   - New user creation
   - Scope denial handling
   - CSRF protection

4. **password-reset.spec.ts** - Password reset tests
   - Forgot password form display
   - Email validation
   - Successful reset email sending
   - Non-existent email handling (security)
   - Loading states
   - Server error handling
   - Rate limiting
   - Reset password form with valid token
   - Password requirements validation
   - Password confirmation matching
   - Successful password reset
   - Expired token handling
   - Invalid token handling
   - Missing token handling
   - Password strength indicator
   - Old password reuse prevention

5. **email-verification.spec.ts** - Email verification tests
   - Verification page display
   - 6-digit code input
   - Verification with valid code
   - Verification with token link
   - Invalid code handling
   - Expired code handling
   - Resend verification email
   - Resend rate limiting
   - Countdown timer after resend
   - Auto-focus next input
   - Backspace navigation
   - Paste full code handling
   - Numeric input only
   - Missing email parameter
   - Loading states
   - Already verified email
   - Error clearing on new input
   - Network error handling
   - Accessibility features

### Profile Management Tests (`e2e/profile/`)

6. **profile-management.spec.ts** - Profile edit tests
   - Profile page display
   - User avatar display
   - Email field disabled
   - Successful profile update
   - Phone number validation
   - Name length validation
   - Image URL validation
   - Loading states
   - Update error handling
   - Success message auto-dismiss
   - Unauthenticated user redirect
   - Password change form display
   - Password field validation
   - Password strength validation
   - Password confirmation matching
   - Successful password change
   - Incorrect current password handling
   - Form clearing after success
   - Password requirements hint
   - Accessibility features

7. **address-management.spec.ts** - Address CRUD tests
   - Addresses page display
   - Empty state when no addresses
   - Display existing addresses
   - Add address form opening
   - Required field validation
   - ZIP code format validation
   - Phone number format validation
   - Successful address addition
   - Edit existing address
   - Update address successfully
   - Delete address with confirmation
   - Cancel delete on dialog dismiss
   - Set address as default
   - Form cancellation
   - Loading states
   - Server error handling
   - Address type badges
   - Validation error clearing
   - Unauthenticated user redirect
   - Accessibility features

## Test Coverage

### Happy Paths ✓

- Successful registration and login
- OAuth authentication flows
- Password reset completion
- Email verification
- Profile updates
- Address CRUD operations

### Error Cases ✓

- Form validation errors
- Invalid credentials
- Expired tokens
- Server errors
- Network failures
- Rate limiting
- Duplicate data

### Edge Cases ✓

- Missing parameters
- Already verified emails
- Non-existent users (security)
- Session persistence
- Multiple submissions
- CSRF protection

### User Experience ✓

- Loading states
- Error messages
- Success notifications
- Auto-dismiss messages
- Form clearing
- Navigation flows

### Accessibility ✓

- Form labels
- ARIA attributes
- Keyboard navigation
- Screen reader support

## Mocking Strategy

### Email Service (Resend)

All email-related tests mock the Resend API to avoid sending real emails during testing.

### NextAuth

OAuth flows and session management are mocked using route interception.

### API Routes

All API endpoints are mocked with appropriate responses for different scenarios.

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test e2e/auth/login.spec.ts

# Run tests in headed mode
npx playwright test --headed

# Run tests in specific browser
npx playwright test --project=chromium

# Run tests with UI mode
npx playwright test --ui

# Generate test report
npx playwright show-report
```

## Test Organization

```
e2e/
├── auth/
│   ├── registration.spec.ts       (Registration flow)
│   ├── login.spec.ts              (Login flow)
│   ├── oauth.spec.ts              (OAuth providers)
│   ├── password-reset.spec.ts     (Password reset)
│   └── email-verification.spec.ts (Email verification)
└── profile/
    ├── profile-management.spec.ts (Profile editing)
    └── address-management.spec.ts (Address CRUD)
```

## Best Practices Implemented

1. **Page Object Pattern** - Reusable selectors and actions
2. **Route Mocking** - Consistent API mocking
3. **Test Isolation** - Each test is independent
4. **Descriptive Names** - Clear test descriptions
5. **Comprehensive Coverage** - Happy paths, errors, and edge cases
6. **Accessibility Testing** - ARIA labels and keyboard navigation
7. **Loading States** - Verify UI feedback during async operations
8. **Error Handling** - Test all error scenarios
9. **Security Testing** - CSRF, rate limiting, and data validation

## Notes

- All tests use Playwright's built-in assertions
- Tests are configured to run in parallel for faster execution
- Screenshots are captured on failure
- Traces are recorded on first retry
- Tests work across all configured browsers (Chromium, Firefox, WebKit)
- Mobile viewports are also tested (Pixel 5, iPhone 12)
