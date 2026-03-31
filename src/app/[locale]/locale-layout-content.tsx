'use client'

import { useTranslations } from 'next-intl'
import { LocaleProvider, type Locale, defaultLocale, locales, localeNames, localeFlags } from '@/components/i18n/locale-provider'
import { LocaleSwitcher } from '@/components/i18n/locale-switcher'
import { CurrencyProvider } from '@/components/currency/currency-context'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { AuthProvider } from '@/components/providers/auth-provider'
import { CartProviderWrapper } from '@/components/providers/cart-provider'
import { WishlistProvider } from '@/components/wishlist/wishlist-context'
import { AnalyticsProvider } from '@/components/analytics/analytics-provider'
import { AnimatePresence } from 'framer-motion'

interface LocaleLayoutContentProps {
  children: React.ReactNode
  locale: string
}

export function LocaleLayoutContent({ children, locale }: LocaleLayoutContentProps) {
  const validLocale = locales.includes(locale as Locale) ? locale : defaultLocale

  return (
    <LocaleProvider initialLocale={validLocale as Locale}>
      <AuthProvider>
        <CartProviderWrapper>
          <WishlistProvider>
            <CurrencyProvider>
              <AnalyticsProvider>
                <div className="min-h-screen flex flex-col" lang={validLocale}>
                  <Header />
                  <AnimatePresence mode="wait">
                    <main id="main-content" role="main" className="flex-1">
                      {children}
                    </main>
                  </AnimatePresence>
                  <Footer />
                </div>
              </AnalyticsProvider>
            </CurrencyProvider>
          </WishlistProvider>
        </CartProviderWrapper>
      </AuthProvider>
    </LocaleProvider>
  )
}
