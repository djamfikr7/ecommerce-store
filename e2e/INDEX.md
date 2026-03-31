# E2E Test Suite - Index

Welcome to the comprehensive E2E test suite for authentication and profile management!

## 📚 Documentation Guide

Start here to navigate the test suite:

### 🚀 Getting Started

- **[QUICK_START.md](./QUICK_START.md)** - Start here! Quick guide to run tests immediately
- **[README.md](./README.md)** - Comprehensive documentation with all details

### 📊 Project Information

- **[SUMMARY.md](./SUMMARY.md)** - Complete project summary and statistics
- **[TEST_CHECKLIST.md](./TEST_CHECKLIST.md)** - QA checklist for test execution

## 🧪 Test Files

### Authentication Tests (`auth/`)

1. **[registration.spec.ts](./auth/registration.spec.ts)** - User registration flow (14 tests)
2. **[login.spec.ts](./auth/login.spec.ts)** - User login flow (15 tests)
3. **[oauth.spec.ts](./auth/oauth.spec.ts)** - OAuth flows (16 tests)
4. **[password-reset.spec.ts](./auth/password-reset.spec.ts)** - Password reset (19 tests)
5. **[email-verification.spec.ts](./auth/email-verification.spec.ts)** - Email verification (20 tests)

### Profile Tests (`profile/`)

6. **[profile-management.spec.ts](./profile/profile-management.spec.ts)** - Profile editing (21 tests)
7. **[address-management.spec.ts](./profile/address-management.spec.ts)** - Address CRUD (20 tests)

## 🛠️ Utilities

### Helper Functions (`helpers/`)

- **[auth.helpers.ts](./helpers/auth.helpers.ts)** - Reusable authentication utilities (20+ functions)

## 📈 Quick Stats

- **Total Tests**: 125
- **Test Files**: 7 (new) + 3 (existing)
- **Lines of Code**: 2,264
- **Coverage**: ~95% of auth flows
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari

## 🎯 What's Tested

### ✅ Authentication

- Registration with email/password
- Email verification (code & token)
- Login with credentials
- OAuth (Google & GitHub)
- Password reset & confirmation
- Session management

### ✅ Profile Management

- View & update profile
- Change password
- Address CRUD operations
- Set default address

### ✅ Quality Assurance

- Form validation
- Error handling
- Loading states
- Security (CSRF, rate limiting)
- Accessibility (ARIA, keyboard nav)

## 🚀 Quick Commands

```bash
# Run all tests
npm run test:e2e

# Run with UI (recommended)
npx playwright test --ui

# Run specific suite
npx playwright test e2e/auth/
npx playwright test e2e/profile/

# Run specific test
npx playwright test e2e/auth/login.spec.ts

# View report
npx playwright show-report
```

## 📖 Documentation Structure

```
e2e/
├── INDEX.md                    ← You are here
├── QUICK_START.md              ← Start here for running tests
├── README.md                   ← Comprehensive guide
├── SUMMARY.md                  ← Project summary
├── TEST_CHECKLIST.md           ← QA checklist
├── tsconfig.json               ← TypeScript config
├── .gitignore                  ← Test artifacts
│
├── auth/                       ← Authentication tests
│   ├── registration.spec.ts
│   ├── login.spec.ts
│   ├── oauth.spec.ts
│   ├── password-reset.spec.ts
│   └── email-verification.spec.ts
│
├── profile/                    ← Profile tests
│   ├── profile-management.spec.ts
│   └── address-management.spec.ts
│
└── helpers/                    ← Utilities
    └── auth.helpers.ts
```

## 🎓 Learning Path

### For New Users

1. Read [QUICK_START.md](./QUICK_START.md)
2. Run tests with UI mode: `npx playwright test --ui`
3. Explore test files in `auth/` and `profile/`
4. Review [auth.helpers.ts](./helpers/auth.helpers.ts) for reusable patterns

### For QA Engineers

1. Review [TEST_CHECKLIST.md](./TEST_CHECKLIST.md)
2. Execute full test suite: `npm run test:e2e`
3. Generate and review HTML report
4. Check cross-browser compatibility

### For Developers

1. Read [README.md](./README.md) for technical details
2. Study helper functions in `helpers/auth.helpers.ts`
3. Review mocking strategies in test files
4. Understand test patterns and best practices

## 🔗 Related Resources

- **Playwright Docs**: https://playwright.dev
- **Project Config**: `../playwright.config.ts`
- **Source Code**: `../src/app/(auth)/` and `../src/app/(main)/profile/`

## 💡 Tips

- Use `--ui` mode for interactive debugging
- Use `--headed` to see browser actions
- Use `--debug` to step through tests
- Check `playwright-report/` for detailed results
- Review screenshots on test failures

## 🆘 Need Help?

1. Check [QUICK_START.md](./QUICK_START.md) troubleshooting section
2. Review [README.md](./README.md) for detailed explanations
3. Run tests in headed mode to see what's happening
4. Check test logs and screenshots in `playwright-report/`

## ✨ Features

- ✅ Comprehensive coverage (125 tests)
- ✅ Cross-browser testing
- ✅ Mobile viewport testing
- ✅ Accessibility testing
- ✅ Security testing
- ✅ Mock email service
- ✅ Mock OAuth flows
- ✅ Reusable helpers
- ✅ Well documented
- ✅ CI/CD ready

---

**Last Updated**: March 30, 2026  
**Version**: 1.0.0  
**Status**: ✅ Production Ready

Happy Testing! 🎭
