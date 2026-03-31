# Phase 2: Authentication & User Management

**Started:** 2026-03-30
**Status:** In Progress
**Depends on:** Phase 1 (Foundation & Infrastructure)

## Requirements Covered

AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, PROF-01, PROF-02, PROF-03, PROF-04, PROF-05

## Success Criteria (what must be TRUE)

1. Users can register with email/password
2. Users can log in with email/password
3. Users can log in with OAuth (Google, GitHub)
4. User sessions persist across browser refresh
5. Users can reset forgotten passwords
6. Users can manage their profile (name, email)
7. Users can manage shipping/billing addresses
8. Email verification flow works
9. All auth flows have E2E tests
10. Profile pages are fully responsive

## Implementation Tasks

### 1. Registration Flow

- [ ] Create registration page UI (`/register`)
- [ ] Implement registration form with validation
- [ ] Add password strength indicator
- [ ] Create user registration API endpoint
- [ ] Hash passwords with bcrypt
- [ ] Send verification email
- [ ] Create email verification page
- [ ] Add registration E2E tests

### 2. Login/Logout Flow

- [ ] Create login page UI (`/login`)
- [ ] Implement login form with validation
- [ ] Add "Remember me" functionality
- [ ] Create logout functionality
- [ ] Add session management
- [ ] Implement protected route middleware
- [ ] Add login/logout E2E tests

### 3. OAuth Integration

- [ ] Configure Google OAuth provider
- [ ] Configure GitHub OAuth provider
- [ ] Add OAuth buttons to login/register pages
- [ ] Handle OAuth callback errors
- [ ] Link OAuth accounts to existing users
- [ ] Add OAuth E2E tests

### 4. Password Reset

- [ ] Create forgot password page
- [ ] Implement password reset request flow
- [ ] Send password reset email
- [ ] Create password reset page
- [ ] Implement password reset confirmation
- [ ] Add password reset E2E tests

### 5. Profile Management

- [ ] Create profile page UI (`/profile`)
- [ ] Implement profile edit form
- [ ] Add name update functionality
- [ ] Add email update functionality
- [ ] Add profile image upload
- [ ] Add profile E2E tests

### 6. Address Management

- [ ] Create address management UI
- [ ] Implement add address form
- [ ] Implement edit address form
- [ ] Implement delete address functionality
- [ ] Add default address selection
- [ ] Add address validation
- [ ] Add address E2E tests

### 7. Email Templates

- [ ] Create welcome email template
- [ ] Create email verification template
- [ ] Create password reset email template
- [ ] Configure email service (Resend)
- [ ] Test email delivery

### 8. Testing & Quality

- [ ] Write unit tests for auth utilities
- [ ] Write integration tests for auth API
- [ ] Write E2E tests for all flows
- [ ] Test accessibility (WCAG AA)
- [ ] Test responsive design
- [ ] Test error handling

## Technical Implementation

### Database (Already Complete)

- ✅ User model with email/password
- ✅ Account model for OAuth
- ✅ Session model for NextAuth
- ✅ VerificationToken model
- ✅ Address model

### API Routes (Already Complete)

- ✅ NextAuth API routes configured
- ✅ OAuth providers configured
- ✅ Credentials provider configured

### What Needs to Be Built

#### Pages

- `/register` - Registration page
- `/login` - Login page
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset confirmation
- `/verify-email` - Email verification
- `/profile` - User profile
- `/profile/addresses` - Address management

#### Components

- `RegisterForm` - Registration form
- `LoginForm` - Login form
- `ForgotPasswordForm` - Password reset request form
- `ResetPasswordForm` - Password reset form
- `ProfileForm` - Profile edit form
- `AddressForm` - Address add/edit form
- `AddressList` - Address list with actions
- `OAuthButtons` - Social login buttons

#### Server Actions

- `registerUser` - Create new user
- `sendVerificationEmail` - Send verification email
- `verifyEmail` - Verify email token
- `sendPasswordResetEmail` - Send reset email
- `resetPassword` - Reset password with token
- `updateProfile` - Update user profile
- `addAddress` - Add new address
- `updateAddress` - Update existing address
- `deleteAddress` - Delete address
- `setDefaultAddress` - Set default address

## Progress Tracking

- [ ] **2.1** Registration flow (AUTH-01, AUTH-02)
- [ ] **2.2** Login/logout flow (AUTH-03, AUTH-04, AUTH-06)
- [ ] **2.3** OAuth integration (AUTH-07)
- [ ] **2.4** Password reset (AUTH-05)
- [ ] **2.5** Profile management (PROF-01, PROF-02, PROF-03)
- [ ] **2.6** Address management (PROF-04, PROF-05)
- [ ] **2.7** Email templates
- [ ] **2.8** Testing & quality assurance
- [ ] **2.9** Integration & verification
- [ ] **2.10** Final review

## Dependencies

### Environment Variables Needed

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-with-openssl>

# OAuth Providers
GOOGLE_CLIENT_ID=<from-google-console>
GOOGLE_CLIENT_SECRET=<from-google-console>
GITHUB_CLIENT_ID=<from-github-oauth>
GITHUB_CLIENT_SECRET=<from-github-oauth>

# Email Service
RESEND_API_KEY=<from-resend>
EMAIL_FROM=noreply@yourdomain.com
```

## Estimated Time

- Registration flow: 2-3 hours
- Login/logout flow: 1-2 hours
- OAuth integration: 1-2 hours
- Password reset: 2-3 hours
- Profile management: 2-3 hours
- Address management: 3-4 hours
- Email templates: 1-2 hours
- Testing: 3-4 hours

**Total:** 15-23 hours

---

_Last updated: 2026-03-30_
