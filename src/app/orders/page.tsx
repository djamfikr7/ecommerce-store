import React from 'react';
import Link from 'next/link';
import { Package, Plus } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { OrderSummaryCard } from '@/components/order/order-summary-card';

// This would be replaced with actual database call
async function getOrders(userId: string) {
  // Placeholder for database query
  // In production, this would query the database
  return [];
}

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/api/auth/signin');
  }

  const orders = await getOrders(session.user.id as string);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0f0f23]/80 backdrop-blur-lg sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">My Orders</h1>
            <Link
              href="/products"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white font-medium hover:bg-accent/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Order</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {orders.length === 0 ? (
          <EmptyOrders />
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {orders.map((order, index) => (
              <OrderSummaryCard key={order.id} order={order} index={index} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyOrders() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
        <Package className="w-12 h-12 text-white/20" />
      </div>
      <h2 className="text-xl font-bold text-white mb-3">No orders yet</h2>
      <p className="text-white/50 text-center max-w-md mb-8">
        You haven&apos;t placed any orders yet. Start shopping to see your order history here.
      </p>
      <Link
        href="/products"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent/90 transition-colors"
      >
        Start Shopping
      </Link>
    </div>
  );
}
