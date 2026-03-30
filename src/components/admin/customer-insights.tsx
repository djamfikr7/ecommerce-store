'use client'

import { CustomerInsight, formatCurrency } from '@/lib/analytics/calculations'
import { Users, UserPlus, Repeat, DollarSign, ShoppingCart } from 'lucide-react'

interface CustomerInsightsProps {
  insights: CustomerInsight
  currency?: string
}

export function CustomerInsights({ insights, currency = 'USD' }: CustomerInsightsProps) {
  const returningRate =
    insights.totalCustomers > 0 ? (insights.returningCustomers / insights.totalCustomers) * 100 : 0

  return (
    <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 shadow-[inset_0_2px_8px_rgba(0,0,0,0.3),0_8px_24px_rgba(0,0,0,0.4)]">
      <h3 className="mb-6 text-xl font-bold text-white">Customer Insights</h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 p-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/20 p-2">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <p className="text-sm text-gray-400">Total Customers</p>
          </div>
          <p className="ml-11 text-2xl font-bold text-white">
            {insights.totalCustomers.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 p-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-lg bg-green-500/20 p-2">
              <UserPlus className="h-5 w-5 text-green-400" />
            </div>
            <p className="text-sm text-gray-400">New Customers</p>
          </div>
          <p className="ml-11 text-2xl font-bold text-white">
            {insights.newCustomers.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 p-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/20 p-2">
              <Repeat className="h-5 w-5 text-purple-400" />
            </div>
            <p className="text-sm text-gray-400">Returning Customers</p>
          </div>
          <div className="ml-11">
            <p className="text-2xl font-bold text-white">
              {insights.returningCustomers.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-gray-400">{returningRate.toFixed(1)}% return rate</p>
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 p-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-lg bg-yellow-500/20 p-2">
              <DollarSign className="h-5 w-5 text-yellow-400" />
            </div>
            <p className="text-sm text-gray-400">Avg Lifetime Value</p>
          </div>
          <p className="ml-11 text-2xl font-bold text-white">
            {formatCurrency(insights.avgLifetimeValue, currency)}
          </p>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 p-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] md:col-span-2">
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-lg bg-orange-500/20 p-2">
              <ShoppingCart className="h-5 w-5 text-orange-400" />
            </div>
            <p className="text-sm text-gray-400">Avg Orders Per Customer</p>
          </div>
          <p className="ml-11 text-2xl font-bold text-white">
            {insights.avgOrdersPerCustomer.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  )
}
