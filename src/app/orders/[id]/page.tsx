import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Package, MapPin, CreditCard, Truck, RotateCcw } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { OrderStatusBadge } from '@/components/order/order-status-badge';
import { formatPrice } from '@/lib/currency';

// This would be replaced with actual database call
async function getOrder(orderId: string, userId: string) {
  // Placeholder for database query
  // In production, this would query the database
  // Must verify ownership of order
  return null;
}

// This would be replaced with actual database call
async function addItemsToCart(cartId: string, items: Array<{ productId: string; quantity: number }>) {
  // Placeholder for reordering functionality
}

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/api/auth/signin');
  }

  const order = await getOrder(id, session.user.id as string);

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0f0f23]/80 backdrop-blur-lg sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/orders"
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Orders</span>
            </Link>
            <h1 className="text-xl font-bold text-white">Order #{order.orderNumber}</h1>
            <div className="w-24 sm:w-32" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Order Status & Summary */}
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            {/* Status Card */}
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm">
              <h2 className="text-sm font-medium text-white/50 mb-3">Order Status</h2>
              <div className="flex items-center gap-3 mb-4">
                <OrderStatusBadge status={order.status} size="lg" />
              </div>
              <p className="text-white/50 text-sm">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
              {order.trackingNumber && (
                <div className="mt-4 p-3 rounded-xl bg-accent/10">
                  <p className="text-xs text-white/50 mb-1">Tracking Number</p>
                  <p className="text-sm text-accent font-mono">{order.trackingNumber}</p>
                </div>
              )}
            </div>

            {/* Total Card */}
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm">
              <h2 className="text-sm font-medium text-white/50 mb-3">Order Total</h2>
              <p className="text-3xl font-bold text-white mb-4">{formatPrice(order.total)}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-white/70">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Shipping</span>
                  <span>{order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Tax</span>
                  <span>{formatPrice(order.tax)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Order Items</h2>
            <div className="rounded-2xl bg-white/5 backdrop-blur-sm overflow-hidden">
              {order.items.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 p-4 ${
                    index !== order.items.length - 1 ? 'border-b border-white/10' : ''
                  }`}
                >
                  <div className="w-20 h-20 rounded-xl bg-white/5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.slug}`}
                      className="font-medium text-white hover:text-accent transition-colors"
                    >
                      {item.name}
                    </Link>
                    {item.variantName && (
                      <p className="text-sm text-white/50">{item.variantName}</p>
                    )}
                    <p className="text-sm text-white/50">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-white">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Addresses & Payment */}
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            {/* Shipping Address */}
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-white">Shipping Address</h3>
              </div>
              <div className="text-white/70 text-sm space-y-1">
                <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                <p>{order.shippingAddress.address1}</p>
                {order.shippingAddress.address2 && (
                  <p>{order.shippingAddress.address2}</p>
                )}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>

            {/* Billing Address */}
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-white">Payment Method</h3>
              </div>
              <div className="text-white/70 text-sm">
                <p className="mb-2">Card ending in {order.payment.last4}</p>
                <p className="text-xs text-white/50">{order.payment.brand}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-white/50" />
                  <h4 className="text-sm font-medium text-white/70">Billing Address</h4>
                </div>
                {order.sameAsBilling ? (
                  <p className="text-sm text-white/50">Same as shipping address</p>
                ) : (
                  <div className="text-sm text-white/70 space-y-1">
                    <p>{order.billingAddress.firstName} {order.billingAddress.lastName}</p>
                    <p>{order.billingAddress.address1}</p>
                    <p>{order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.postalCode}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            {order.status === 'SHIPPED' && (
              <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent/90 transition-colors">
                <Truck className="w-5 h-5" />
                Track Package
              </button>
            )}
            <form action={async () => {
              'use server';
              // Reorder functionality would go here
            }}>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                Reorder
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
