'use client'

import { useMemo } from 'react'
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
import { SalesData, formatCurrency, formatPercentage } from '@/lib/analytics/calculations'

interface SalesChartProps {
  data: SalesData[]
  currency?: string
}

export function SalesChart({ data, currency = 'USD' }: SalesChartProps) {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    }))
  }, [data])

  const totalChange = useMemo(() => {
    const currentTotal = data.reduce((sum, item) => sum + item.sales, 0)
    const previousTotal = data.reduce((sum, item) => sum + item.previousPeriod, 0)
    return previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0
  }, [data])

  const avgChange = useMemo(() => {
    const validChanges = data.filter((item) => !isNaN(item.change) && isFinite(item.change))
    return validChanges.length > 0
      ? validChanges.reduce((sum, item) => sum + item.change, 0) / validChanges.length
      : 0
  }, [data])

  return (
    <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 shadow-[inset_0_2px_8px_rgba(0,0,0,0.3),0_8px_24px_rgba(0,0,0,0.4)]">
      <div className="mb-6">
        <h3 className="mb-4 text-xl font-bold text-white">Sales Comparison</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 p-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
            <p className="mb-1 text-sm text-gray-400">Total Change</p>
            <p
              className={`text-2xl font-bold ${totalChange >= 0 ? 'text-green-400' : 'text-red-400'}`}
            >
              {formatPercentage(totalChange)}
            </p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 p-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
            <p className="mb-1 text-sm text-gray-400">Avg Daily Change</p>
            <p
              className={`text-2xl font-bold ${avgChange >= 0 ? 'text-green-400' : 'text-red-400'}`}
            >
              {formatPercentage(avgChange)}
            </p>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <YAxis
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => formatCurrency(value, currency)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
            labelStyle={{ color: '#f3f4f6' }}
            formatter={(value: any, name: any) => {
              if (typeof value === 'number') {
                return [
                  formatCurrency(value, currency),
                  name === 'sales' ? 'Current Period' : 'Previous Period',
                ]
              }
              return [value, name]
            }}
          />
          <Legend wrapperStyle={{ color: '#9ca3af' }} />
          <Bar
            dataKey="previousPeriod"
            fill="#6b7280"
            radius={[8, 8, 0, 0]}
            name="Previous Period"
          />
          <Bar dataKey="sales" fill="#10b981" radius={[8, 8, 0, 0]} name="Current Period" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
