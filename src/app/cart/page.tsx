'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useCart } from '@/components/cart/cart-context';
import { CartItem } from '@/components/cart/cart-item';
import { CartSummary } from '@/components/cart/cart-summary';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { EmptyCart } from '@/components/cart/empty-cart';

export default function CartPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, isLoading, updateItem, removeItem } = useCart();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Handle checkout cancel redirect
  useEffect(() => {
    const cancelled = searchParams.get('cancelled');
    if (cancelled === 'true') {
      // Cart items should be preserved from the cart state
    }
  }, [searchParams]);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    router.push('/checkout');
  };

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0f0f23]/80 backdrop-blur-lg sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/products"
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Continue Shopping</span>
            </Link>
            <h1 className="text-xl font-bold text-white">Shopping Cart</h1>
            <div className="w-24 sm:w-32" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <CartPageSkeleton />
        ) : isEmpty ? (
          <EmptyCart />
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items - Left Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 space-y-4"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">
                  {cart.items.length} {cart.items.length === 1 ? 'Item' : 'Items'}
                </h2>
                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="lg:hidden px-4 py-2 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 transition-colors text-sm"
                >
                  View Summary
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdate={updateItem}
                    onRemove={removeItem}
                  />
                ))}
              </div>

              {/* Mobile Summary */}
              <div className="lg:hidden mt-8">
                <CartSummary
                  totals={cart.totals}
                  showCheckoutButton={true}
                  isLoading={isCheckingOut}
                  onCheckout={handleCheckout}
                />
              </div>

              {/* Benefits */}
              <div className="grid sm:grid-cols-2 gap-4 mt-8">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Secure Checkout</p>
                    <p className="text-xs text-white/50">256-bit SSL encryption</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Free Returns</p>
                    <p className="text-xs text-white/50">30-day return policy</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Desktop Summary - Right Column */}
            <div className="hidden lg:block">
              <CartSummary
                totals={cart.totals}
                showCheckoutButton={true}
                isLoading={isCheckingOut}
                onCheckout={handleCheckout}
              >
                {/* Promo Code Section is built into CartSummary */}
              </CartSummary>
            </div>
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
}

function CartPageSkeleton() {
  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-32 bg-white/5 rounded animate-pulse" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 p-6 rounded-2xl bg-white/5">
            <div className="w-32 h-32 rounded-xl bg-white/5 animate-pulse" />
            <div className="flex-1 space-y-3">
              <div className="h-6 w-3/4 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-1/4 bg-white/5 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <div className="h-80 rounded-2xl bg-white/5 animate-pulse" />
      </div>
    </div>
  );
}
