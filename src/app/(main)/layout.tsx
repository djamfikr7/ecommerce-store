'use client'

import { AuthProvider } from '@/components/providers/auth-provider'
import { CartProviderWrapper } from '@/components/providers/cart-provider'
import { LocaleProvider } from '@/components/i18n/locale-provider'
import { CurrencyProvider } from '@/components/currency/currency-context'
import { WishlistProvider } from '@/components/wishlist/wishlist-context'
import { ToastProvider } from '@/components/notifications/toast-provider'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { BackToTop } from '@/components/layout/back-to-top'
import { BottomNav } from '@/components/layout/bottom-nav'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LocaleProvider>
        <CurrencyProvider>
          <CartProviderWrapper>
            <WishlistProvider>
              <div className="flex min-h-screen flex-col">
                <a href="#main-content" className="skip-link">
                  Skip to main content
                </a>

                <Header />

                <main id="main-content" className="flex-1 pb-16 lg:pb-0" tabIndex={-1}>
                  {children}
                </main>

                <Footer />

                <BackToTop />
                <BottomNav />
                <ToastProvider />
              </div>
            </WishlistProvider>
          </CartProviderWrapper>
        </CurrencyProvider>
      </LocaleProvider>
    </AuthProvider>
  )
}
