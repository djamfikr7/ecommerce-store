'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart, CartItem } from './cart-context';
import { formatPrice } from '@/lib/currency';
import { QuantitySelector } from './quantity-selector';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, updateItem, removeItem, isLoading } = useCart();

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const subtotal = cart?.totals.subtotal ?? 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-gradient-to-b from-[#1a1a2e] to-[#16213e] shadow-2xl z-50 flex flex-col"
            role="dialog"
            aria-label="Shopping cart"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-accent" />
                <h2 className="text-xl font-bold text-white">Your Cart</h2>
                {itemCount > 0 && (
                  <span className="px-2 py-1 text-xs font-semibold bg-accent text-white rounded-full">
                    {itemCount}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex gap-4">
                      <div className="w-20 h-20 rounded-xl bg-white/5" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 rounded bg-white/5" />
                        <div className="h-3 w-1/2 rounded bg-white/5" />
                        <div className="h-3 w-1/4 rounded bg-white/5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !cart || cart.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-24 h-24 mb-6 rounded-full bg-white/5 flex items-center justify-center">
                    <ShoppingBag className="w-12 h-12 text-white/30" />
                  </div>
                  <p className="text-white/60 mb-4">Your cart is empty</p>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent/90 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <ul className="space-y-4" role="list">
                  <AnimatePresence initial={false}>
                    {cart.items.map((item) => (
                      <motion.li
                        key={item.id}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur"
                      >
                        {/* Product Image */}
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={onClose}
                          className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-white/10"
                        >
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="w-8 h-8 text-white/20" />
                            </div>
                          )}
                        </Link>

                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${item.slug}`}
                            onClick={onClose}
                            className="font-semibold text-white hover:text-accent transition-colors line-clamp-1"
                          >
                            {item.name}
                          </Link>
                          {item.variantName && (
                            <p className="text-sm text-white/50 mt-0.5">{item.variantName}</p>
                          )}
                          <p className="text-accent font-semibold mt-1">
                            {formatPrice(item.price)}
                          </p>

                          {/* Quantity & Remove */}
                          <div className="flex items-center justify-between mt-3">
                            <QuantitySelector
                              value={item.quantity}
                              onChange={(qty) => updateItem(item.id, qty)}
                              min={1}
                              max={99}
                              size="sm"
                            />
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors"
                              aria-label={`Remove ${item.name} from cart`}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Line Total */}
                        <div className="text-right">
                          <p className="font-bold text-white">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* Footer */}
            {cart && cart.items.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-[#0f0f23]">
                {/* Subtotal */}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-white/60">Subtotal</span>
                  <span className="text-xl font-bold text-white">{formatPrice(subtotal)}</span>
                </div>

                <p className="text-xs text-white/40 mb-4">
                  Shipping and taxes calculated at checkout
                </p>

                {/* Actions */}
                <div className="space-y-3">
                  <Link
                    href="/cart"
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors"
                  >
                    View Cart
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent/90 transition-colors shadow-lg shadow-accent/25"
                  >
                    Checkout
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default CartDrawer;
