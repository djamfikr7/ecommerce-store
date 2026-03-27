'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Calendar, ChevronRight, Package } from 'lucide-react';
import { OrderStatusBadge } from './order-status-badge';
import { formatPrice } from '@/lib/currency';

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

interface OrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  itemCount: number;
  date: string;
  thumbnail?: string;
}

interface OrderSummaryCardProps {
  order: OrderSummary;
  index?: number;
}

export function OrderSummaryCard({ order, index = 0 }: OrderSummaryCardProps) {
  const formattedDate = new Date(order.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/orders/${order.id}`}>
        <div className="group p-4 sm:p-6 rounded-2xl bg-white/5 backdrop-blur-sm hover:bg-white/8 transition-all cursor-pointer">
          <div className="flex items-start gap-4">
            {/* Thumbnail */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white/5 flex-shrink-0 overflow-hidden">
              {order.thumbnail ? (
                <Image
                  src={order.thumbnail}
                  alt={`Order ${order.orderNumber}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-8 h-8 text-white/20" />
                </div>
              )}
            </div>

            {/* Order Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-semibold text-white group-hover:text-accent transition-colors">
                    Order #{order.orderNumber}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-white/50">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formattedDate}</span>
                  </div>
                </div>
                <OrderStatusBadge status={order.status} size="sm" />
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-white">
                    {formatPrice(order.total)}
                  </span>
                  <span className="text-sm text-white/50">
                    {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {/* Arrow */}
                <div className="flex items-center gap-1 text-white/30 group-hover:text-accent transition-colors">
                  <span className="hidden sm:inline text-sm">View Details</span>
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default OrderSummaryCard;
