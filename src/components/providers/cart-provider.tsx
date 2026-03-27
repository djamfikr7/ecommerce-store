'use client';

import React from 'react';
import { CartProvider } from '@/components/cart/cart-context';

interface CartProviderWrapperProps {
  children: React.ReactNode;
}

export function CartProviderWrapper({ children }: CartProviderWrapperProps) {
  return <CartProvider>{children}</CartProvider>;
}

export default CartProviderWrapper;
