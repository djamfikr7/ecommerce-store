// Prometheus metrics using prom-client
import { register, Counter, Histogram, Gauge } from 'prom-client'

// HTTP metrics
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.3, 0.5, 1, 3, 5, 10],
})

export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
})

// Business metrics
export const ordersTotal = new Counter({
  name: 'orders_total',
  help: 'Total orders',
  labelNames: ['status'],
})

export const revenueTotal = new Counter({
  name: 'revenue_total',
  help: 'Total revenue in cents',
  labelNames: ['currency'],
})

export const cartAbandons = new Counter({
  name: 'cart_abandons_total',
  help: 'Total abandoned carts',
})

export const conversionRate = new Gauge({
  name: 'conversion_rate',
  help: 'Current conversion rate',
})

// Performance metrics
export const webVitalsScore = new Gauge({
  name: 'webvitals_score',
  help: 'Web Vitals scores (0-100)',
  labelNames: ['metric'],
})

// Database metrics
export const dbQueryDuration = new Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries',
  labelNames: ['operation', 'table'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
})

export const dbConnectionsActive = new Gauge({
  name: 'db_connections_active',
  help: 'Number of active database connections',
})

// Cache metrics
export const cacheHits = new Counter({
  name: 'cache_hits_total',
  help: 'Total cache hits',
})

export const cacheMisses = new Counter({
  name: 'cache_misses_total',
  help: 'Total cache misses',
})

// User metrics
export const activeUsers = new Gauge({
  name: 'active_users',
  help: 'Number of currently active users',
})

export const newUsersTotal = new Counter({
  name: 'new_users_total',
  help: 'Total new users registered',
})

// Product metrics
export const productsViewed = new Counter({
  name: 'products_viewed_total',
  help: 'Total product views',
})

export const productsAddedToCart = new Counter({
  name: 'products_added_to_cart_total',
  help: 'Total products added to cart',
})

// API metrics
export const apiRequestErrors = new Counter({
  name: 'api_request_errors_total',
  help: 'Total API request errors',
  labelNames: ['endpoint', 'error_code'],
})

// Helper function to record HTTP request
export function recordHttpRequest(
  method: string,
  route: string,
  status: number,
  durationSeconds: number
) {
  httpRequestDuration.observe({ method, route, status }, durationSeconds)
  httpRequestsTotal.inc({ method, route, status })
}

// Helper function to record an order
export function recordOrder(status: string, amountCents: number, currency: string) {
  ordersTotal.inc({ status })
  revenueTotal.inc({ currency }, amountCents)
}

// Helper to record Web Vital score
export function recordWebVital(metric: 'CLS' | 'FID' | 'LCP' | 'FCP' | 'TTFB' | 'INP', score: number) {
  // Convert to 0-100 scale (invert for some metrics)
  const normalizedScore = metric === 'CLS'
    ? Math.max(0, 100 - score * 10) // CLS: lower is better
    : metric === 'FID' || metric === 'TTFB'
    ? Math.max(0, 100 - score)
    : Math.max(0, 100 - score / 10) // LCP, FCP, INP

  webVitalsScore.set({ metric }, normalizedScore)
}

export { register }
