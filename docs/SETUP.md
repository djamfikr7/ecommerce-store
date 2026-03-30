# Development Setup Guide

Complete guide to setting up the E-Commerce Web Store development environment.

## Prerequisites

Ensure you have the following installed:

- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **PostgreSQL**: v16.x (or use Supabase)
- **Git**: Latest version

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd Git_Volt_agent

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Generate Prisma client
npm run db:generate

# Set up database (push schema + seed data)
npm run db:setup

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Environment Variables

Copy `.env.example` to `.env.local` and configure the following:

### Database

```bash
# Local PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce_store?schema=public"

# Or use Supabase (recommended)
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
```

### Authentication (NextAuth v5)

```bash
AUTH_SECRET="generate-with-openssl-rand-base64-32"
AUTH_URL="http://localhost:3000"
```

Generate a secure secret:

```bash
openssl rand -base64 32
```

### Stripe (Payment Processing)

```bash
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# For development without Stripe
NEXT_PUBLIC_MOCK_STRIPE=true
```

Get your keys from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys).

### OAuth Providers (Optional)

```bash
# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Facebook OAuth
FACEBOOK_APP_ID="your-app-id"
FACEBOOK_APP_SECRET="your-app-secret"
```

### Email (Resend)

```bash
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@yourdomain.com"
EMAIL_ADMIN="admin@yourdomain.com"
```

Sign up at [Resend](https://resend.com) for API key.

### Currency Exchange (Optional)

```bash
OPENEXCHANGERATES_APP_ID="your-app-id"
```

Get free API key from [Open Exchange Rates](https://openexchangerates.org).

### App Configuration

```bash
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Database Setup

### Option 1: Local PostgreSQL

Install PostgreSQL locally:

```bash
# macOS (Homebrew)
brew install postgresql@16
brew services start postgresql@16

# Ubuntu/Debian
sudo apt install postgresql-16
sudo systemctl start postgresql

# Create database
createdb ecommerce_store
```

### Option 2: Supabase (Recommended)

1. Create account at [Supabase](https://supabase.com)
2. Create new project
3. Copy connection string from Settings > Database
4. Update `DATABASE_URL` in `.env.local`

### Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed

# Or run all at once
npm run db:setup
```

### Database Commands

```bash
# Open Prisma Studio (GUI)
npm run db:studio

# Create migration
npm run db:migrate

# Reset database (WARNING: deletes all data)
npm run db:reset
```

## Development Workflow

### Start Development Server

```bash
npm run dev
```

Server runs at `http://localhost:3000`.

### Run Tests

```bash
# Unit tests (watch mode)
npm run test

# Unit tests (single run)
npm run test:ci

# Unit tests with UI
npm run test:ui

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui

# Run all tests
npm run test:all
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check

# Type check
npm run typecheck
```

### Build for Production

```bash
# Create production build
npm run build

# Start production server
npm run start
```

## Project Structure

```
Git_Volt_agent/
├── .github/              # GitHub Actions workflows
├── .husky/               # Git hooks
├── .planning/            # Project planning docs
├── docs/                 # Documentation
├── e2e/                  # Playwright E2E tests
├── prisma/               # Database schema & migrations
│   ├── schema.prisma     # Prisma schema
│   └── seed.ts           # Database seed script
├── public/               # Static assets
├── scripts/              # Build & utility scripts
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── (admin)/      # Admin dashboard routes
│   │   ├── (auth)/       # Auth routes
│   │   ├── (main)/       # Main app routes
│   │   ├── [locale]/     # Localized routes
│   │   └── api/          # API routes
│   ├── components/       # React components
│   │   ├── admin/        # Admin components
│   │   ├── auth/         # Auth components
│   │   ├── cart/         # Cart components
│   │   ├── checkout/     # Checkout components
│   │   ├── currency/     # Currency components
│   │   ├── design-system/ # Design system components
│   │   ├── i18n/         # Internationalization
│   │   ├── layout/       # Layout components
│   │   ├── product/      # Product components
│   │   ├── reviews/      # Review components
│   │   ├── ui/           # UI primitives
│   │   └── wishlist/     # Wishlist components
│   ├── lib/              # Utilities & libraries
│   │   ├── auth/         # Auth utilities
│   │   ├── db/           # Database utilities
│   │   ├── emails/       # Email templates
│   │   ├── i18n/         # i18n configuration
│   │   └── utils/        # Helper functions
│   ├── test/             # Test utilities
│   └── types/            # TypeScript types
├── .env.example          # Environment variables template
├── .env.local            # Local environment (gitignored)
├── next.config.ts        # Next.js configuration
├── package.json          # Dependencies & scripts
├── playwright.config.ts  # Playwright configuration
├── prisma/schema.prisma  # Database schema
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── vitest.config.ts      # Vitest configuration
```

## Common Issues

### Port Already in Use

If port 3000 is already in use:

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 npm run dev
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql $DATABASE_URL

# Reset database if corrupted
npm run db:reset
```

### Prisma Client Out of Sync

```bash
# Regenerate Prisma client
npm run db:generate

# If schema changed, push to database
npm run db:push
```

### Module Not Found Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Type Errors After Update

```bash
# Regenerate TypeScript types
npm run typecheck

# Regenerate Prisma types
npm run db:generate
```

## IDE Setup

### VS Code (Recommended)

Install recommended extensions:

- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

Settings (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Next Steps

- Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the system design
- Read [API.md](./API.md) for API documentation
- Read [COMPONENTS.md](./COMPONENTS.md) for component usage
- Read [TESTING.md](./TESTING.md) for testing guidelines
- Read [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions

## Getting Help

- Check [GitHub Issues](https://github.com/anomalyco/opencode/issues)
- Review [Next.js Documentation](https://nextjs.org/docs)
- Review [Prisma Documentation](https://www.prisma.io/docs)
- Review [Stripe Documentation](https://stripe.com/docs)
