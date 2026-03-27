'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, Truck, Package, XCircle } from 'lucide-react';

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<OrderStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  PENDING: {
    label: 'Pending',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/20',
    icon: <Clock className="w-4 h-4" />,
  },
  CONFIRMED: {
    label: 'Confirmed',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/20',
    icon: <CheckCircle className="w-4 h-4" />,
  },
  SHIPPED: {
    label: 'Shipped',
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/20',
    icon: <Truck className="w-4 h-4" />,
  },
  DELIVERED: {
    label: 'Delivered',
    color: 'text-green-400',
    bgColor: 'bg-green-400/20',
    icon: <Package className="w-4 h-4" />,
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'text-red-400',
    bgColor: 'bg-red-400/20',
    icon: <XCircle className="w-4 h-4" />,
  },
};

export function OrderStatusBadge({ status, size = 'md' }: OrderStatusBadgeProps) {
  const config = statusConfig[status];

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
  };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        inline-flex items-center rounded-full font-medium
        ${config.bgColor} ${config.color}
        ${sizeClasses[size]}
      `}
    >
      {config.icon}
      <span>{config.label}</span>
    </motion.span>
  );
}

export default OrderStatusBadge;
