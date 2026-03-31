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
  Line,
  ComposedChart,
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
    const baseSales = 3500 + Math.sin(i * 0.4) * 1200
    const sales = Math.max(1000, Math.floor(baseSales + Math.random() * 2000 - 500))
    const previousBase = 3000 + Math.sin(i * 0.4) * 1000
    const previousPeriod = Math.max(800, Math.floor(previousBase + Math.random() * 1800 - 400))
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sales,
      previousPeriod,
      change: previousPeriod > 0 ? ((sales - previousPeriod) / previousPeriod) * 100 : 0,
      orders: Math.floor(sales / 85) + Math.floor(Math.random() * 10),
    }
  })
}

export function SalesChart({ data, currency = 'USD' }: SalesChartProps) {
  const [showComparison, setShowComparison] = useState(true)
  const [chartType, setChartType] = useState<'bar' | 'composed'>('bar')

  const chartData = useMemo(() => {
    if (data && data.length > 0) {
      return data.map((item) => ({
        ...item,
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        orders: Math.floor(item.sales / 85),
      }))
    }
    return generateSalesData(14)
  }, [data])

  const totalChange = useMemo(() => {
    const current = chartData.reduce((s, d) => s + d.sales, 0)
    const previous = chartData.reduce((s, d) => s + d.previousPeriod, 0)
    return previous > 0 ? ((current - previous) / previous) * 100 : 0
  }, [chartData])

  const totalSales = useMemo(() => chartData.reduce((s, d) => s + d.sales, 0), [chartData])
  const totalPrevSales = useMemo(
    () => chartData.reduce((s, d) => s + d.previousPeriod, 0),
    [chartData],
  )

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
            Previous period
          </label>
          <div className="flex gap-1 rounded-lg bg-slate-900/50 p-1">
            {(['bar', 'composed'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setChartType(t)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  chartType === t
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t === 'bar' ? 'Bars' : 'Trend'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
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
          <p className="text-xl font-bold text-white">{formatCurrency(totalSales, currency)}</p>
        </div>
        <div className="rounded-xl bg-slate-900/40 p-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
          <p className="mb-1 text-xs text-slate-400">Previous Sales</p>
          <p className="text-xl font-bold text-slate-400">
            {formatCurrency(totalPrevSales, currency)}
          </p>
        </div>
      </div>

      {chartType === 'bar' ? (
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
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              style={{ fontSize: '12px' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="left"
              stroke="#64748b"
              style={{ fontSize: '12px' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#64748b"
              style={{ fontSize: '12px' }}
              tickLine={false}
              axisLine={false}
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
                if (key === 'orders') return [num, 'Orders']
                return [formatCurrency(num, currency), key === 'sales' ? 'Current' : 'Previous']
              }}
            />
            {showComparison && (
              <Bar
                yAxisId="left"
                dataKey="previousPeriod"
                fill="#374151"
                radius={[4, 4, 0, 0]}
                name="Previous Period"
                barSize={20}
              />
            )}
            <Bar
              yAxisId="left"
              dataKey="sales"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              name="Current Period"
              barSize={20}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="orders"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ fill: '#f59e0b', r: 3, strokeWidth: 0 }}
              name="Orders"
            />
            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
