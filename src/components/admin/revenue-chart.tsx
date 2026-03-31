'use client'

import { useMemo, useState } from 'react'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { formatCurrency } from '@/lib/analytics/calculations'

interface RevenueChartProps {
  data?: { date: string; revenue: number; orders: number }[]
  currency?: string
}

function generateRevenueData(days: number) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (days - 1 - i))
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: Math.floor(Math.random() * 5000) + 3000,
      orders: Math.floor(Math.random() * 40) + 20,
    }
  })
}

type Granularity = 'daily' | 'weekly' | 'monthly'

export function RevenueChart({ data, currency = 'USD' }: RevenueChartProps) {
  const [granularity, setGranularity] = useState<Granularity>('daily')

  const chartData = useMemo(() => {
    if (data && data.length > 0) {
      return data.map((item) => ({
        ...item,
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      }))
    }
    const days = granularity === 'daily' ? 30 : granularity === 'weekly' ? 12 : 12
    return generateRevenueData(days)
  }, [data, granularity])

  const totalRevenue = useMemo(() => chartData.reduce((s, d) => s + d.revenue, 0), [chartData])
  const totalOrders = useMemo(() => chartData.reduce((s, d) => s + d.orders, 0), [chartData])
  const avgOrderValue = useMemo(
    () => (totalOrders > 0 ? totalRevenue / totalOrders : 0),
    [totalRevenue, totalOrders],
  )

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6 shadow-xl backdrop-blur-sm">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-white">Revenue Overview</h3>
        <div className="flex gap-1 rounded-xl bg-slate-900/50 p-1">
          {(['daily', 'weekly', 'monthly'] as Granularity[]).map((g) => (
            <button
              key={g}
              onClick={() => setGranularity(g)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                granularity === g
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: formatCurrency(totalRevenue, currency) },
          { label: 'Total Orders', value: totalOrders.toLocaleString() },
          { label: 'Avg Order Value', value: formatCurrency(avgOrderValue, currency) },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-slate-900/40 p-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
          >
            <p className="mb-1 text-xs text-slate-400">{stat.label}</p>
            <p className="text-lg font-bold text-white lg:text-xl">{stat.value}</p>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="revenueAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis
            dataKey="date"
            stroke="#64748b"
            style={{ fontSize: '12px' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#64748b"
            style={{ fontSize: '12px' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '12px',
              backdropFilter: 'blur(8px)',
            }}
            labelStyle={{ color: '#e2e8f0' }}
            formatter={(value: unknown, name: unknown) => {
              const num = typeof value === 'number' ? value : 0
              const key = typeof name === 'string' ? name : ''
              return [
                key === 'revenue' ? formatCurrency(num, currency) : num,
                key === 'revenue' ? 'Revenue' : 'Orders',
              ]
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#06b6d4"
            strokeWidth={2.5}
            fill="url(#revenueAreaGradient)"
            dot={{ fill: '#06b6d4', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#06b6d4' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
