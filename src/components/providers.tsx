'use client'

import { SessionProvider } from 'next-auth/react'
import { CartProvider } from '@/components/cart/cart-context'
import { WishlistProvider } from '@/components/wishlist/wishlist-context'
import { ToastProvider } from '@/components/notifications/toast-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        <WishlistProvider>
          {children}
          <ToastProvider />
        </WishlistProvider>
      </CartProvider>
    </SessionProvider>
  )
}
