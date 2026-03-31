import { Metadata } from 'next'
import Link from 'next/link'
import { DollarSign, ShoppingCart, Users, TrendingUp, Plus, BarChart3, Package } from 'lucide-react'
import { MetricCard } from '@/components/admin/metric-card'
import { RecentOrders } from '@/components/admin/recent-orders'
import { LowStockAlert } from '@/components/admin/low-stock-alert'

export const metadata: Metadata = {
  title: 'Dashboard | Admin',
  description: 'E-Commerce Admin Dashboard',
}

const metricsData = {
  totalRevenue: {
    value: '$12,450',
    trend: 12.5,
    trendDirection: 'up' as const,
    subtitle: 'Today vs yesterday',
    chartColor: 'cyan' as const,
  },
  ordersToday: {
    value: '47',
    trend: 8.2,
    trendDirection: 'up' as const,
    subtitle: 'Orders processed today',
    chartColor: 'purple' as const,
  },
  activeUsers: {
    value: '1,234',
    trend: -2.1,
    trendDirection: 'down' as const,
    subtitle: 'Currently browsing',
    chartColor: 'emerald' as const,
  },
  conversionRate: {
    value: '3.8%',
    trend: 0.5,
    trendDirection: 'up' as const,
    subtitle: 'Visitors to buyers',
    chartColor: 'amber' as const,
  },
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white lg:text-3xl">Dashboard</h1>
          <p className="mt-1 text-slate-400">Welcome back, Admin</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 px-4 py-2 font-medium text-white transition-opacity hover:opacity-90"
          >
            View Orders
          </Link>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2 font-medium text-slate-300 transition-colors hover:bg-slate-700/50"
          >
            Products
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <MetricCard
          title="Total Revenue"
          value={metricsData.totalRevenue.value}
          trend={metricsData.totalRevenue.trend}
          trendDirection={metricsData.totalRevenue.trendDirection}
          subtitle={metricsData.totalRevenue.subtitle}
          icon={DollarSign}
          chartColor={metricsData.totalRevenue.chartColor}
        />
        <MetricCard
          title="Orders Today"
          value={metricsData.ordersToday.value}
          trend={metricsData.ordersToday.trend}
          trendDirection={metricsData.ordersToday.trendDirection}
          subtitle={metricsData.ordersToday.subtitle}
          icon={ShoppingCart}
          chartColor={metricsData.ordersToday.chartColor}
        />
        <MetricCard
          title="Active Users"
          value={metricsData.activeUsers.value}
          trend={metricsData.activeUsers.trend}
          trendDirection={metricsData.activeUsers.trendDirection}
          subtitle={metricsData.activeUsers.subtitle}
          icon={Users}
          chartColor={metricsData.activeUsers.chartColor}
        />
        <MetricCard
          title="Conversion Rate"
          value={metricsData.conversionRate.value}
          trend={metricsData.conversionRate.trend}
          trendDirection={metricsData.conversionRate.trendDirection}
          subtitle={metricsData.conversionRate.subtitle}
          icon={TrendingUp}
          chartColor={metricsData.conversionRate.chartColor}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/admin/products/new"
          className="group flex items-center gap-4 rounded-2xl border border-slate-700/50 bg-slate-800/30 p-5 shadow-xl backdrop-blur-sm transition-all hover:border-cyan-500/30 hover:bg-slate-700/30"
        >
          <div className="rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 p-3 transition-transform group-hover:scale-110">
            <Plus className="text-cyan-400" size={24} />
          </div>
          <div>
            <p className="font-semibold text-white">Add Product</p>
            <p className="text-sm text-slate-400">Create new listing</p>
          </div>
        </Link>
        <Link
          href="/admin/orders"
          className="group flex items-center gap-4 rounded-2xl border border-slate-700/50 bg-slate-800/30 p-5 shadow-xl backdrop-blur-sm transition-all hover:border-purple-500/30 hover:bg-slate-700/30"
        >
          <div className="rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-3 transition-transform group-hover:scale-110">
            <Package className="text-purple-400" size={24} />
          </div>
          <div>
            <p className="font-semibold text-white">View Orders</p>
            <p className="text-sm text-slate-400">Manage transactions</p>
          </div>
        </Link>
        <Link
          href="/admin/analytics"
          className="group flex items-center gap-4 rounded-2xl border border-slate-700/50 bg-slate-800/30 p-5 shadow-xl backdrop-blur-sm transition-all hover:border-emerald-500/30 hover:bg-slate-700/30"
        >
          <div className="rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 p-3 transition-transform group-hover:scale-110">
            <BarChart3 className="text-emerald-400" size={24} />
          </div>
          <div>
            <p className="font-semibold text-white">View Analytics</p>
            <p className="text-sm text-slate-400">Detailed insights</p>
          </div>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <RecentOrders />
        </div>

        {/* Low Stock Alerts */}
        <div>
          <LowStockAlert />
        </div>
      </div>
    </div>
  )
}
