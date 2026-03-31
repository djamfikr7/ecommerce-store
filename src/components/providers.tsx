'use client'

import { SessionProvider } from 'next-auth/react'
import { CartProvider } from '@/components/cart/cart-context'
import { WishlistProvider } from '@/components/wishlist/wishlist-context'
import { ToastProvider } from '@/components/notifications/toast-provider'
import { CurrencyProvider } from '@/components/currency/currency-context'
import { LocaleProvider } from '@/components/i18n/locale-provider'
import { AnalyticsProvider } from '@/components/analytics/analytics-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LocaleProvider>
        <CurrencyProvider>
          <CartProvider>
            <WishlistProvider>
              <AnalyticsProvider>
                {children}
                <ToastProvider />
              </AnalyticsProvider>
            </WishlistProvider>
          </CartProvider>
        </CurrencyProvider>
      </LocaleProvider>
    </SessionProvider>
  )
}
