'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Users, UserPlus, Repeat, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '@/lib/analytics/calculations'

interface CustomerInsightsProps {
  insights?: {
    totalCustomers: number
    newCustomers: number
    returningCustomers: number
    avgLifetimeValue: number
    avgOrdersPerCustomer: number
  }
  currency?: string
}

const MOCK_INSIGHTS = {
  totalCustomers: 8432,
  newCustomers: 1247,
  returningCustomers: 7185,
  avgLifetimeValue: 342.5,
  avgOrdersPerCustomer: 3.8,
}

const ACQUISITION_DATA = [
  { name: 'Organic Search', value: 38, color: '#06b6d4' },
  { name: 'Direct', value: 25, color: '#8b5cf6' },
  { name: 'Social Media', value: 18, color: '#ec4899' },
  { name: 'Referral', value: 12, color: '#10b981' },
  { name: 'Email', value: 7, color: '#f59e0b' },
]

export function CustomerInsights({ insights, currency = 'USD' }: CustomerInsightsProps) {
  const data = insights || MOCK_INSIGHTS
  const returningRate =
    data.totalCustomers > 0 ? (data.returningCustomers / data.totalCustomers) * 100 : 0

  const metrics = useMemo(
    () => [
      {
        icon: Users,
        label: 'Total Customers',
        value: data.totalCustomers.toLocaleString(),
        color: 'text-blue-400',
        bg: 'bg-blue-500/20',
      },
      {
        icon: UserPlus,
        label: 'New Customers',
        value: data.newCustomers.toLocaleString(),
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/20',
      },
      {
        icon: Repeat,
        label: 'Returning',
        value: `${data.returningCustomers.toLocaleString()} (${returningRate.toFixed(1)}%)`,
        color: 'text-purple-400',
        bg: 'bg-purple-500/20',
      },
      {
        icon: DollarSign,
        label: 'Avg Lifetime Value',
        value: formatCurrency(data.avgLifetimeValue, currency),
        color: 'text-amber-400',
        bg: 'bg-amber-500/20',
      },
      {
        icon: ShoppingCart,
        label: 'Avg Orders / Customer',
        value: data.avgOrdersPerCustomer.toFixed(2),
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/20',
      },
      {
        icon: TrendingUp,
        label: 'Retention Rate',
        value: `${returningRate.toFixed(1)}%`,
        color: 'text-pink-400',
        bg: 'bg-pink-500/20',
      },
    ],
    [data, returningRate, currency],
  )

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6 shadow-xl backdrop-blur-sm">
      <h3 className="mb-6 text-lg font-semibold text-white">Customer Insights</h3>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {metrics.map((m, i) => {
          const Icon = m.icon
          return (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl bg-slate-900/40 p-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
            >
              <div className="mb-2 flex items-center gap-2">
                <div className={`rounded-lg p-2 ${m.bg}`}>
                  <Icon className={`h-4 w-4 ${m.color}`} />
                </div>
                <p className="text-xs text-slate-400">{m.label}</p>
              </div>
              <p className="text-lg font-bold text-white">{m.value}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="flex flex-col items-center gap-6 lg:flex-row">
        <div className="h-[200px] w-full lg:w-1/2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={ACQUISITION_DATA}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {ACQUISITION_DATA.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '12px',
                }}
                formatter={(value: unknown) => [`${value}%`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full space-y-2 lg:w-1/2">
          {ACQUISITION_DATA.map((source) => (
            <div key={source.name} className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: source.color }} />
              <span className="flex-1 text-sm text-slate-300">{source.name}</span>
              <span className="text-sm font-medium text-white">{source.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
