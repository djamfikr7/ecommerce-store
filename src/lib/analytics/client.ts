// Lightweight analytics client using Web Vitals library
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals'

type AnalyticsEvent = {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  id: string
}

async function sendToAnalytics(metric: AnalyticsEvent) {
  try {
    await fetch('/api/analytics/vitals', {
      method: 'POST',
      body: JSON.stringify({
        ...metric,
        timestamp: Date.now(),
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      }),
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    })
  } catch {
    // Fail silently — don't impact UX
  }
}

// Attach all Web Vitals listeners
export function initWebVitals() {
  if (typeof window === 'undefined') return

  onCLS(sendToAnalytics)
  onFCP(sendToAnalytics)
  onINP(sendToAnalytics)
  onLCP(sendToAnalytics)
  onTTFB(sendToAnalytics)
}

// Custom events
export function trackEvent(name: string, params?: Record<string, unknown>) {
  sendToAnalytics({
    name: `custom_${name}`,
    value: 1,
    rating: 'good',
    id: `${name}_${Date.now()}`,
  })

  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.debug('[Analytics]', name, params)
  }
}

// E-commerce specific tracking helpers
export const analytics = {
  pageView: (page: string, referrer?: string) => {
    trackEvent('page_view', { page, referrer })
  },

  productView: (productId: string, productName: string, price: number) => {
    trackEvent('product_view', { productId, productName, price })
  },

  addToCart: (productId: string, quantity: number, price: number) => {
    trackEvent('add_to_cart', { productId, quantity, price })
  },

  removeFromCart: (productId: string, quantity: number) => {
    trackEvent('remove_from_cart', { productId, quantity })
  },

  checkout: (step: string, value?: number) => {
    trackEvent('checkout_step', { step, value })
  },

  purchase: (orderId: string, revenue: number, currency: string) => {
    trackEvent('purchase', { orderId, revenue, currency })
  },

  search: (query: string, resultsCount: number) => {
    trackEvent('search', { query, resultsCount })
  },

  signUp: (method: 'email' | 'google' | 'github') => {
    trackEvent('sign_up', { method })
  },

  login: (method: 'email' | 'google' | 'github') => {
    trackEvent('login', { method })
  },
}

export type { AnalyticsEvent }
