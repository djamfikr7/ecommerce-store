# E2E Test Execution Checklist

Use this checklist to verify all tests are working correctly.

## Pre-Test Setup

- [ ] Dependencies installed: `npm install`
- [ ] Playwright browsers installed: `npx playwright install`
- [ ] Development server running: `npm run dev`
- [ ] Database seeded (if required)
- [ ] Environment variables configured

## Test Execution

### Authentication Tests

#### Registration Flow
- [ ] `registration.spec.ts` - All 14 tests passing
  - [ ] Form display and validation
  - [ ] OAuth provider buttons
  - [ ] Email format validation
  - [ ] Password strength validation
  - [ ] Terms acceptance
  - [ ] Successful registration
  - [ ] Duplicate email handling
  - [ ] Error handling

#### Login Flow
- [ ] `login.spec.ts` - All 15 tests passing
  - [ ] Form display and validation
  - [ ] Successful login
  - [ ] Invalid credentials
  - [ ] Session persistence
  - [ ] Loading states
  - [ ] Error handling

#### OAuth Flow
- [ ] `oauth.spec.ts` - All 16 tests passing
  - [ ] Google OAuth initiation
  - [ ] GitHub OAuth initiation
  - [ ] Successful callback
  - [ ] Error handling
  - [ ] Account linking
  - [ ] Security checks

#### Password Reset
- [ ] `password-reset.spec.ts` - All 19 tests passing
  - [ ] Forgot password form
  - [ ] Email validation
  - [ ] Reset email sending
  - [ ] Reset confirmation
  - [ ] Token validation
  - [ ] Password requirements

#### Email Verification
- [ ] `email-verification.spec.ts` - All 20 tests passing
  - [ ] Verification page display
  - [ ] Code input (6 digits)
  - [ ] Token verification
  - [ ] Resend functionality
  - [ ] Error handling
  - [ ] Auto-focus and navigation

### Profile Management Tests

#### Profile Editing
- [ ] `profile-management.spec.ts` - All 21 tests passing
  - [ ] Profile display
  - [ ] Profile update
  - [ ] Field validation
  - [ ] Password change
  - [ ] Error handling
  - [ ] Loading states

#### Address Management
- [ ] `address-management.spec.ts` - All 20 tests passing
  - [ ] Address list display
  - [ ] Add new address
  - [ ] Edit address
  - [ ] Delete address
  - [ ] Set default address
  - [ ] Validation

## Cross-Browser Testing

- [ ] Chromium - All tests passing
- [ ] Firefox - All tests passing
- [ ] WebKit - All tests passing
- [ ] Mobile Chrome - All tests passing
- [ ] Mobile Safari - All tests passing

## Test Reports

- [ ] HTML report generated: `npx playwright show-report`
- [ ] No flaky tests detected
- [ ] All screenshots/traces reviewed (if failures)
- [ ] Performance acceptable (< 5 min total)

## Code Quality

- [ ] No TypeScript errors in test files
- [ ] All helper functions working
- [ ] Proper test isolation (no dependencies)
- [ ] Descriptive test names
- [ ] Adequate assertions

## Coverage Verification

### Happy Paths ✓
- [ ] Complete registration → verification → login flow
- [ ] OAuth login flow
- [ ] Password reset flow
- [ ] Profile update flow
- [ ] Address CRUD flow

### Error Cases ✓
- [ ] Form validation errors
- [ ] Server errors (500)
- [ ] Network errors
- [ ] Invalid credentials
- [ ] Expired tokens
- [ ] Rate limiting

### Edge Cases ✓
- [ ] Missing parameters
- [ ] Already verified emails
- [ ] Duplicate data
- [ ] Session expiration
- [ ] CSRF protection

## Accessibility Checks

- [ ] All forms have proper labels
- [ ] ARIA attributes present
- [ ] Keyboard navigation works
- [ ] Screen reader compatible

## Security Checks

- [ ] CSRF protection tested
- [ ] Rate limiting tested
- [ ] Password requirements enforced
- [ ] OAuth security verified
- [ ] Session management secure

## Performance

- [ ] Tests complete in reasonable time
- [ ] No unnecessary waits
- [ ] Parallel execution working
- [ ] No memory leaks

## Documentation

- [ ] README.md reviewed
- [ ] SUMMARY.md reviewed
- [ ] QUICK_START.md reviewed
- [ ] Helper functions documented
- [ ] Test comments clear

## CI/CD Integration

- [ ] Tests run in CI pipeline
- [ ] Artifacts uploaded (reports, screenshots)
- [ ] Notifications configured
- [ ] Retry logic working

## Sign-Off

**Tested By:** _________________

**Date:** _________________

**Environment:** _________________

**Test Results:** 
- Total Tests: 125
- Passed: ___
- Failed: ___
- Skipped: ___

**Notes:**
_________________________________________________
_________________________________________________
_________________________________________________

**Status:** [ ] APPROVED  [ ] NEEDS REVIEW  [ ] FAILED

---

## Quick Commands Reference

```bash
# Run all tests
npm run test:e2e

# Run with UI
npx playwright test --ui

# Run specific suite
npx playwright test e2e/auth/

# Generate report
npx playwright show-report

# Debug mode
npx playwright test --debug
```

## Troubleshooting

If tests fail:
1. Check dev server is running
2. Verify database state
3. Clear browser cache
4. Review error screenshots
5. Check test logs
6. Run in headed mode for debugging

## Next Actions

After successful test execution:
- [ ] Merge test code to main branch
- [ ] Update CI/CD pipeline
- [ ] Train team on test execution
- [ ] Schedule regular test runs
- [ ] Monitor test stability
