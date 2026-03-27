import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from '@/components/providers/auth-provider'
import { CartProviderWrapper } from '@/components/providers/cart-provider'
import { WishlistProvider } from '@/components/wishlist/wishlist-context'
import { Header } from '@/components/layout/header'
import { AnalyticsProvider } from '@/components/analytics/analytics-provider'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

const metadata: Metadata = {
  title: {
    default: 'E-Commerce Store',
    template: '%s | E-Commerce Store',
  },
  description: 'A full-featured e-commerce platform with dark neomorphic design',
  keywords: ['e-commerce', 'store', 'shopping', 'online store', 'neomorphic'],
  authors: [{ name: 'E-Commerce Team' }],
  creator: 'E-Commerce Team',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'E-Commerce Store',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const viewport: Viewport = {
  themeColor: '#0f0f1a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased`}
        style={{
          background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
        }}
      >
        <AuthProvider>
          <CartProviderWrapper>
            <WishlistProvider>
              <AnalyticsProvider>
              {/* Skip to main content for accessibility */}
              <a href="#main-content" className="skip-link">
                Skip to main content
              </a>

              {/* Header */}
              <Header />

              {/* Main content */}
              <AnimatePresence mode="wait">
                <main id="main-content" role="main">
                  {children}
                </main>
              </AnimatePresence>
              </AnalyticsProvider>
            </WishlistProvider>
          </CartProviderWrapper>
        </AuthProvider>
      </body>
    </html>
  )
}

export { metadata, viewport }
