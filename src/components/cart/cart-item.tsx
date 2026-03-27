'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { X, ShoppingBag } from 'lucide-react';
import { formatPrice } from '@/lib/currency';
import { QuantitySelector } from './quantity-selector';

export interface CartItemWithRelations {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  name: string;
  slug: string;
  image?: string;
  variantName?: string;
  sku?: string;
}

interface CartItemProps {
  item: CartItemWithRelations;
  onUpdate: (id: string, quantity: number) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  isUpdating?: boolean;
}

export function CartItem({ item, onUpdate, onRemove, isUpdating = false }: CartItemProps) {
  const handleQuantityChange = async (qty: number) => {
    await onUpdate(item.id, qty);
  };

  const handleRemove = async () => {
    await onRemove(item.id);
  };

  const lineTotal = item.price * item.quantity;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <div className="flex gap-4 p-4 sm:p-6 rounded-2xl bg-white/5 backdrop-blur-sm hover:bg-white/8 transition-colors">
        {/* Product Image */}
        <Link
          href={`/products/${item.slug}`}
          className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden flex-shrink-0 bg-white/10"
        >
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 96px, 128px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-white/20" />
            </div>
          )}
        </Link>

        {/* Item Details */}
        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <Link
              href={`/products/${item.slug}`}
              className="font-semibold text-white hover:text-accent transition-colors line-clamp-2"
            >
              {item.name}
            </Link>

            {item.variantName && (
              <p className="text-sm text-white/50 mt-1">{item.variantName}</p>
            )}

            {item.sku && (
              <p className="text-xs text-white/30 mt-0.5">SKU: {item.sku}</p>
            )}

            <div className="flex items-center gap-3 mt-3">
              <span className="text-accent font-semibold">
                {formatPrice(item.price)}
              </span>
              <span className="text-white/30">×</span>
              <span className="text-white/60">{item.quantity}</span>
            </div>

            {/* Mobile Quantity Controls */}
            <div className="flex items-center justify-between mt-4 sm:hidden">
              <QuantitySelector
                value={item.quantity}
                onChange={handleQuantityChange}
                min={1}
                max={99}
                size="sm"
              />
              <button
                onClick={handleRemove}
                disabled={isUpdating}
                className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors disabled:opacity-50"
                aria-label={`Remove ${item.name} from cart`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Desktop Controls */}
          <div className="hidden sm:flex items-start gap-6">
            {/* Quantity */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-white/40 uppercase tracking-wide">Qty</span>
              <QuantitySelector
                value={item.quantity}
                onChange={handleQuantityChange}
                min={1}
                max={99}
                size="md"
              />
            </div>

            {/* Line Total */}
            <div className="text-right">
              <span className="text-xs text-white/40 uppercase tracking-wide">Total</span>
              <p className="text-xl font-bold text-white mt-1">
                {formatPrice(lineTotal)}
              </p>
            </div>

            {/* Remove Button */}
            <button
              onClick={handleRemove}
              disabled={isUpdating}
              className="p-3 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors disabled:opacity-50"
              aria-label={`Remove ${item.name} from cart`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Line Total */}
        <div className="flex sm:hidden items-center justify-between">
          <span className="text-lg font-bold text-white">
            {formatPrice(lineTotal)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default CartItem;
