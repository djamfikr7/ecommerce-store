'use client'

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { RevenueData, formatCurrency } from '@/lib/analytics/calculations'

interface RevenueChartProps {
  data: RevenueData[]
  currency?: string
}

export function RevenueChart({ data, currency = 'USD' }: RevenueChartProps) {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    }))
  }, [data])

  const totalRevenue = useMemo(() => {
    return data.reduce((sum, item) => sum + item.revenue, 0)
  }, [data])

  const totalOrders = useMemo(() => {
    return data.reduce((sum, item) => sum + item.orders, 0)
  }, [data])

  const avgOrderValue = useMemo(() => {
    return totalOrders > 0 ? totalRevenue / totalOrders : 0
  }, [totalRevenue, totalOrders])

  return (
    <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 shadow-[inset_0_2px_8px_rgba(0,0,0,0.3),0_8px_24px_rgba(0,0,0,0.4)]">
      <div className="mb-6">
        <h3 className="mb-4 text-xl font-bold text-white">Revenue Overview</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 p-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
            <p className="mb-1 text-sm text-gray-400">Total Revenue</p>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(totalRevenue, currency)}
            </p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 p-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
            <p className="mb-1 text-sm text-gray-400">Total Orders</p>
            <p className="text-2xl font-bold text-white">{totalOrders.toLocaleString()}</p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 p-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
            <p className="mb-1 text-sm text-gray-400">Avg Order Value</p>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(avgOrderValue, currency)}
            </p>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
            </linearGradient>
          </defs>
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
            itemStyle={{ color: '#3b82f6' }}
            formatter={(value: any) => {
              if (typeof value === 'number') {
                return [formatCurrency(value, currency), 'Revenue']
              }
              return [value, 'Revenue']
            }}
          />
          <Legend wrapperStyle={{ color: '#9ca3af' }} />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
            name="Revenue"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
