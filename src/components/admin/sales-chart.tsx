'use client'

import { useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { formatCurrency, formatPercentage } from '@/lib/analytics/calculations'

interface SalesChartProps {
  data?: { date: string; sales: number; previousPeriod: number; change: number }[]
  currency?: string
}

function generateSalesData(days: number) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (days - 1 - i))
    const sales = Math.floor(Math.random() * 5000) + 3000
    const previousPeriod = Math.floor(Math.random() * 5000) + 2500
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sales,
      previousPeriod,
      change: previousPeriod > 0 ? ((sales - previousPeriod) / previousPeriod) * 100 : 0,
    }
  })
}

export function SalesChart({ data, currency = 'USD' }: SalesChartProps) {
  const [showComparison, setShowComparison] = useState(true)

  const chartData = useMemo(() => {
    if (data && data.length > 0) {
      return data.map((item) => ({
        ...item,
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      }))
    }
    return generateSalesData(14)
  }, [data])

  const totalChange = useMemo(() => {
    const current = chartData.reduce((s, d) => s + d.sales, 0)
    const previous = chartData.reduce((s, d) => s + d.previousPeriod, 0)
    return previous > 0 ? ((current - previous) / previous) * 100 : 0
  }, [chartData])

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6 shadow-xl backdrop-blur-sm">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-white">Sales Comparison</h3>
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-400">
            <input
              type="checkbox"
              checked={showComparison}
              onChange={(e) => setShowComparison(e.target.checked)}
              className="rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500/50 focus:ring-offset-0"
            />
            Show previous period
          </label>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-slate-900/40 p-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
          <p className="mb-1 text-xs text-slate-400">Period Change</p>
          <p
            className={`text-xl font-bold ${totalChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
          >
            {formatPercentage(totalChange)}
          </p>
        </div>
        <div className="rounded-xl bg-slate-900/40 p-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
          <p className="mb-1 text-xs text-slate-400">Total Sales</p>
          <p className="text-xl font-bold text-white">
            {formatCurrency(
              chartData.reduce((s, d) => s + d.sales, 0),
              currency,
            )}
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData}>
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
            }}
            labelStyle={{ color: '#e2e8f0' }}
            formatter={(value: unknown, name: unknown) => {
              const num = typeof value === 'number' ? value : 0
              const key = typeof name === 'string' ? name : ''
              return [
                formatCurrency(num, currency),
                key === 'sales' ? 'Current Period' : 'Previous Period',
              ]
            }}
          />
          {showComparison && (
            <Bar
              dataKey="previousPeriod"
              fill="#475569"
              radius={[6, 6, 0, 0]}
              name="Previous Period"
            />
          )}
          <Bar dataKey="sales" fill="#10b981" radius={[6, 6, 0, 0]} name="Current Period" />
          {showComparison && <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
