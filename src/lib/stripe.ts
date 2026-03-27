import Stripe from 'stripe'

// Mock mode check
const IS_MOCK = process.env.NEXT_PUBLIC_MOCK_STRIPE === 'true'

if (!IS_MOCK && !process.env.STRIPE_SECRET_KEY) {
  console.warn('WARNING: Running without Stripe. Set NEXT_PUBLIC_MOCK_STRIPE=true for dev mode.')
}

// Only initialize real Stripe if not in mock mode
let stripe: Stripe | null = null

if (!IS_MOCK) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
    apiVersion: '2025-02-24.acacia',
    typescript: true,
  })
}

export { stripe, IS_MOCK }

/**
 * Get Stripe publishable key for client-side
 */
export function getStripePublishableKey(): string {
  if (IS_MOCK) return 'pk_test_mock'
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set')
  }
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
}

/**
 * Mock Stripe session for development
 */
export function createMockSession(params: {
  cartId: string
  userId?: string
  email?: string
  successUrl: string
  cancelUrl: string
}) {
  const mockSessionId = `mock_session_${Date.now()}_${Math.random().toString(36).slice(2)}`
  const mockUrl = `${params.successUrl.split('?')[0]}/mock?session_id=${mockSessionId}&mock=true`
  return {
    id: mockSessionId,
    url: mockUrl,
  }
}
