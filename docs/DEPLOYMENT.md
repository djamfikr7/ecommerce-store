# Deployment Guide

Complete guide to deploying the E-Commerce Web Store to production.

## Deployment Stack

- **Hosting**: Vercel (Next.js optimized)
- **Database**: Supabase (PostgreSQL)
- **CDN**: Vercel Edge Network
- **Email**: Resend
- **Payments**: Stripe
- **CI/CD**: GitHub Actions

## Prerequisites

Before deploying, ensure you have:

- GitHub account
- Vercel account (free tier)
- Supabase account (free tier)
- Stripe account (test/live keys)
- Resend account (for emails)
- Domain name (optional)

## Quick Deploy

### 1. Deploy to Vercel

**Option A: Deploy Button**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/your-repo)

**Option B: Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

**Option C: GitHub Integration**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure environment variables (see below)
5. Click "Deploy"

### 2. Set Up Database

**Create Supabase Project:**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose organization and region
4. Set database password
5. Wait for project to be ready

**Get Connection String:**

1. Go to Project Settings > Database
2. Copy connection string (URI format)
3. Replace `[YOUR-PASSWORD]` with your password

**Add to Vercel:**

```bash
# Via CLI
vercel env add DATABASE_URL

# Or in Vercel Dashboard:
# Settings > Environment Variables
```

### 3. Configure Environment Variables

Add these variables in Vercel Dashboard (Settings > Environment Variables):

#### Required Variables

```bash
# Database
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# Auth
AUTH_SECRET="generate-with-openssl-rand-base64-32"
AUTH_URL="https://yourdomain.com"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Email
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@yourdomain.com"
EMAIL_ADMIN="admin@yourdomain.com"

# App
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

#### Optional Variables

```bash
# OAuth Providers
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
FACEBOOK_APP_ID="..."
FACEBOOK_APP_SECRET="..."

# Currency Exchange
OPENEXCHANGERATES_APP_ID="..."

# Redis (optional)
REDIS_URL="redis://..."
```

### 4. Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to production database
DATABASE_URL="your-production-url" npm run db:push

# Seed production data (optional)
DATABASE_URL="your-production-url" npm run db:seed
```

### 5. Configure Stripe Webhooks

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy webhook signing secret
6. Add to Vercel as `STRIPE_WEBHOOK_SECRET`

### 6. Verify Deployment

```bash
# Check deployment status
vercel ls

# View logs
vercel logs

# Test production URL
curl https://yourdomain.com/api/health
```

## Custom Domain Setup

### Add Domain to Vercel

1. Go to Project Settings > Domains
2. Add your domain (e.g., `yourdomain.com`)
3. Follow DNS configuration instructions

### DNS Configuration

**Option A: Vercel Nameservers (Recommended)**

1. Update nameservers at your domain registrar:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```

**Option B: CNAME Record**

1. Add CNAME record:
   ```
   CNAME @ cname.vercel-dns.com
   ```

### SSL Certificate

Vercel automatically provisions SSL certificates via Let's Encrypt. No configuration needed.

## Environment-Specific Configuration

### Development

```bash
# .env.local
DATABASE_URL="postgresql://localhost:5432/ecommerce_dev"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_MOCK_STRIPE=true
```

### Staging

```bash
# Vercel Preview Deployments
DATABASE_URL="postgresql://...staging..."
NEXT_PUBLIC_APP_URL="https://staging.yourdomain.com"
STRIPE_SECRET_KEY="sk_test_..."
```

### Production

```bash
# Vercel Production
DATABASE_URL="postgresql://...production..."
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
STRIPE_SECRET_KEY="sk_live_..."
```

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run typecheck

      - name: Run tests
        run: npm run test:ci

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

      - name: Build
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Vercel Integration

Vercel automatically deploys:

- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches

## Database Migrations

### Production Migration Strategy

```bash
# 1. Create migration locally
npm run db:migrate

# 2. Test migration on staging
DATABASE_URL="staging-url" npx prisma migrate deploy

# 3. Deploy to production
DATABASE_URL="production-url" npx prisma migrate deploy

# 4. Verify
DATABASE_URL="production-url" npx prisma migrate status
```

### Zero-Downtime Migrations

For breaking changes:

1. **Add new column** (backward compatible)
2. **Deploy code** that writes to both old and new columns
3. **Backfill data** from old to new column
4. **Deploy code** that reads from new column
5. **Remove old column** after verification

## Monitoring & Logging

### Vercel Analytics

Enable in Vercel Dashboard:

1. Go to Analytics tab
2. Enable Web Analytics
3. View real-time metrics

### Error Tracking

**Option A: Vercel Logs**

```bash
# View logs
vercel logs --follow

# Filter by function
vercel logs --function api/products
```

**Option B: External Service (Sentry)**

```bash
npm install @sentry/nextjs

# Configure in next.config.ts
```

### Performance Monitoring

**Vercel Speed Insights:**

```typescript
// src/app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Database Monitoring

**Supabase Dashboard:**

1. Go to Database > Query Performance
2. Monitor slow queries
3. Check connection pool usage

## Backup & Recovery

### Database Backups

**Supabase Automatic Backups:**

- Daily backups (retained 7 days on free tier)
- Point-in-time recovery (paid plans)

**Manual Backup:**

```bash
# Export database
pg_dump $DATABASE_URL > backup.sql

# Restore database
psql $DATABASE_URL < backup.sql
```

### Disaster Recovery Plan

1. **Database failure**: Restore from Supabase backup
2. **Vercel outage**: Deploy to alternative platform (Netlify, Railway)
3. **Data corruption**: Restore from point-in-time backup

## Security Checklist

### Pre-Deployment

- [ ] All secrets in environment variables (not in code)
- [ ] `.env.local` in `.gitignore`
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS prevention (React handles this)
- [ ] CSRF protection (NextAuth handles this)
- [ ] Secure headers configured

### Post-Deployment

- [ ] Test authentication flow
- [ ] Test payment flow (with test cards)
- [ ] Verify webhook endpoints
- [ ] Check error handling
- [ ] Monitor logs for errors
- [ ] Test rate limiting
- [ ] Verify email delivery

## Performance Optimization

### Next.js Configuration

```typescript
// next.config.ts
const nextConfig = {
  // Enable compression
  compress: true,

  // Image optimization
  images: {
    domains: ['yourdomain.com'],
    formats: ['image/avif', 'image/webp'],
  },

  // Enable SWC minification
  swcMinify: true,

  // Production source maps (optional)
  productionBrowserSourceMaps: false,
}
```

### Caching Strategy

```typescript
// ISR for product pages
export const revalidate = 60 // Revalidate every 60 seconds

// Static for marketing pages
export const dynamic = 'force-static'

// Dynamic for user pages
export const dynamic = 'force-dynamic'
```

### CDN Configuration

Vercel automatically caches:

- Static assets (images, CSS, JS)
- API responses with `Cache-Control` headers
- ISR pages

## Scaling Considerations

### Database Scaling

**Vertical Scaling:**

- Upgrade Supabase plan for more resources

**Horizontal Scaling:**

- Add read replicas (Supabase Pro)
- Implement connection pooling

### Application Scaling

**Vercel automatically scales:**

- Serverless functions scale to zero
- Edge network handles traffic spikes
- No configuration needed

### Rate Limiting

```typescript
// Implement rate limiting for API routes
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: Request) {
  const limiter = rateLimit({
    interval: 60 * 1000, // 1 minute
    limit: 10, // 10 requests per minute
  })

  await limiter.check(req)
  // ... handle request
}
```

## Rollback Strategy

### Instant Rollback

```bash
# Via Vercel Dashboard
# Go to Deployments > Select previous deployment > Promote to Production

# Via CLI
vercel rollback
```

### Database Rollback

```bash
# Revert migration
npx prisma migrate resolve --rolled-back [migration-name]

# Restore from backup
psql $DATABASE_URL < backup.sql
```

## Cost Optimization

### Vercel Free Tier Limits

- 100 GB bandwidth/month
- 100 GB-hours serverless function execution
- 1000 GB-hours edge middleware execution
- Unlimited deployments

### Supabase Free Tier Limits

- 500 MB database storage
- 1 GB file storage
- 2 GB bandwidth
- 50,000 monthly active users

### Tips to Stay Within Free Tier

1. **Optimize images**: Use Next.js Image component
2. **Cache aggressively**: Use ISR and CDN caching
3. **Limit API calls**: Implement pagination and rate limiting
4. **Database indexes**: Optimize queries
5. **Clean up old data**: Archive or delete unused records

## Troubleshooting

### Build Failures

```bash
# Check build logs
vercel logs --build

# Common issues:
# - Missing environment variables
# - TypeScript errors
# - Dependency issues
```

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL

# Check connection pool
# Supabase Dashboard > Database > Connection Pooling
```

### Stripe Webhook Issues

```bash
# Test webhook locally
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Verify webhook signature
# Check STRIPE_WEBHOOK_SECRET matches Stripe Dashboard
```

### Email Delivery Issues

```bash
# Check Resend logs
# Resend Dashboard > Logs

# Verify sender domain
# Resend Dashboard > Domains
```

## Post-Deployment Checklist

- [ ] Verify homepage loads
- [ ] Test user registration
- [ ] Test user login
- [ ] Test product browsing
- [ ] Test add to cart
- [ ] Test checkout flow (with test card)
- [ ] Verify order confirmation email
- [ ] Test admin dashboard access
- [ ] Check analytics tracking
- [ ] Monitor error logs
- [ ] Test on mobile devices
- [ ] Test in different browsers
- [ ] Verify SSL certificate
- [ ] Check page load times
- [ ] Test social media sharing

## Maintenance

### Regular Tasks

**Daily:**

- Monitor error logs
- Check payment processing
- Review user feedback

**Weekly:**

- Review analytics
- Check database performance
- Update dependencies (security patches)

**Monthly:**

- Database backup verification
- Performance audit
- Security audit
- Dependency updates

### Update Strategy

```bash
# Update dependencies
npm update

# Check for outdated packages
npm outdated

# Update major versions carefully
npm install package@latest

# Test thoroughly
npm run test:all

# Deploy
git push origin main
```

## Support & Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Stripe Production Checklist](https://stripe.com/docs/development/checklist)

## Emergency Contacts

- **Vercel Support**: support@vercel.com
- **Supabase Support**: support@supabase.io
- **Stripe Support**: https://support.stripe.com

## Deployment Timeline

Typical deployment takes:

1. **Initial setup**: 30-60 minutes
2. **Environment configuration**: 15-30 minutes
3. **Database migration**: 5-10 minutes
4. **DNS propagation**: 1-48 hours
5. **Testing**: 1-2 hours

**Total**: 2-4 hours (excluding DNS propagation)
