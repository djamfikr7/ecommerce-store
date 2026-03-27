# E-Commerce Web Store

A full-featured, modern e-commerce platform with dark gradient neomorphic design, 3D animated buttons, social media automation, and multi-currency localization.

## Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-cyan)
![Prisma](https://img.shields.io/badge/Prisma-6.x-5B4D8C)
![Stripe](https://img.shields.io/badge/Stripe-17-635BFF)

## Features

- 🛍️ **Product Catalog** — Categories, search, filters, variants
- 🛒 **Shopping Cart** — Persistent, guest-friendly, multi-currency
- 💳 **Checkout** — Multi-step, Stripe payments, order confirmation
- 👤 **User Accounts** — Email/password + social login (Google, Facebook)
- 📦 **Order Management** — Tracking, history, admin dashboard
- ⭐ **Reviews & Ratings** — Verified purchase badges
- ❤️ **Wishlist** — Save for later
- 📱 **Responsive** — Mobile-first, dark gradient neomorphic design
- 🎨 **3D Animations** — Three.js powered interactive elements
- 🌐 **Localization** — Multi-language, multi-currency
- 📊 **Analytics** — Event tracking, conversion funnels
- 🤖 **Social Media** — Facebook, Instagram, Twitter, TikTok integration
- 🔒 **Security** — WCAG AA, CSRF protection, secure payments
- 🧪 **TDD** — Vitest + Playwright, comprehensive test coverage

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 16+ (or Supabase)
- npm or pnpm

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd e-commerce-store

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# 4. Set up database
npm run db:setup

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run test` | Run Vitest unit tests |
| `npm run test:ui` | Run tests with UI |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:ci` | Run tests for CI |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:e2e:ui` | Run E2E tests with UI |
| `npm run test:types` | Run type tests |
| `npm run format` | Format code with Prettier |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio |

## Environment Variables

See [`.env.example`](.env.example) for all required environment variables.

Key variables:
- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET` — Secret for NextAuth session encryption
- `STRIPE_*` — Stripe API keys for payment processing
- `GOOGLE_*`, `FACEBOOK_*` — OAuth provider credentials

## Deployment

The app is configured for deployment on Vercel with:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

Database is hosted on Supabase (PostgreSQL free tier).

## Testing

```bash
# Unit & Integration Tests
npm run test

# E2E Tests
npm run test:e2e

# All Tests (CI)
npm run test:all

# Type Checking
npm run test:types
```

## Architecture

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
│   ├── ui/          # Base UI components
│   ├── design-system/ # Design system
│   └── layout/      # Layout components
├── lib/             # Utilities & helpers
├── types/           # TypeScript types
└── test/            # Test utilities & mocks

prisma/
└── schema.prisma    # Database schema

e2e/                 # Playwright E2E tests
```

## License

MIT
