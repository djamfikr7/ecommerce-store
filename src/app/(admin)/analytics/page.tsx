'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, ShoppingCart, Eye, TrendingUp, Download, BarChart3 } from 'lucide-react'
import { StatsCard } from '@/components/admin/stats-card'
import { ChartContainer } from '@/components/admin/chart-container'
import { RevenueChart } from '@/components/admin/revenue-chart'
import { SalesChart } from '@/components/admin/sales-chart'
import { TopProducts } from '@/components/admin/top-products'
import { CustomerInsights } from '@/components/admin/customer-insights'
import { ConversionFunnel } from '@/components/admin/conversion-funnel'
import { DateRangePicker, DateRangePreset } from '@/components/admin/date-range-picker'
import { exportToCSV } from '@/lib/analytics/csv-export'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

function generateDailyData(days: number) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (days - 1 - i))
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      conversion: +(Math.random() * 8 + 8).toFixed(1),
      visitors: Math.floor(Math.random() * 2000) + 1000,
    }
  })
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRangePreset>('30d')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const statsData = useMemo(
    () => ({
      totalRevenue: 124580,
      revenueChange: 12.5,
      totalOrders: 1847,
      ordersChange: 8.2,
      totalVisitors: 45678,
      visitorsChange: -2.1,
      conversionRate: 14.2,
      conversionChange: 3.5,
    }),
    [],
  )

  const conversionData = useMemo(() => {
    const days = dateRange === '7d' ? 7 : dateRange === '90d' ? 90 : 30
    return generateDailyData(days)
  }, [dateRange])

  const handleExport = () => {
    const data = conversionData.map((d) => ({
      date: d.date,
      conversionRate: d.conversion,
      visitors: d.visitors,
      revenue: Math.floor(Math.random() * 5000) + 3000,
      orders: Math.floor(Math.random() * 40) + 20,
    }))
    exportToCSV(
      data,
      [
        { key: 'date', label: 'Date' },
        { key: 'revenue', label: 'Revenue' },
        { key: 'orders', label: 'Orders' },
        { key: 'visitors', label: 'Visitors' },
        { key: 'conversionRate', label: 'Conversion Rate (%)' },
      ],
      'analytics-report',
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-white lg:text-3xl">
            <BarChart3 className="text-cyan-400" size={28} />
            Analytics
          </h1>
          <p className="mt-1 text-slate-400">Track your store performance</p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            customStart={customStart}
            customEnd={customEnd}
            onCustomChange={(s, e) => {
              setCustomStart(s)
              setCustomEnd(e)
            }}
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-300 transition-colors hover:bg-slate-700/50"
          >
            <Download size={16} />
            <span className="text-sm font-medium">Export CSV</span>
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <StatsCard
          title="Total Revenue"
          value={`$${statsData.totalRevenue.toLocaleString()}`}
          trend={statsData.revenueChange}
          trendDirection="up"
          icon={DollarSign}
        />
        <StatsCard
          title="Total Orders"
          value={statsData.totalOrders.toLocaleString()}
          trend={statsData.ordersChange}
          trendDirection="up"
          icon={ShoppingCart}
        />
        <StatsCard
          title="Total Visitors"
          value={statsData.totalVisitors.toLocaleString()}
          trend={statsData.visitorsChange}
          trendDirection="down"
          icon={Eye}
        />
        <StatsCard
          title="Conversion Rate"
          value={`${statsData.conversionRate}%`}
          trend={statsData.conversionChange}
          trendDirection="up"
          icon={TrendingUp}
        />
      </div>

      {/* Revenue Chart - Full Width */}
      <RevenueChart />

      {/* Sales & Funnel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SalesChart />
        <ConversionFunnel />
      </div>

      {/* Top Products & Customer Insights */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TopProducts />
        <CustomerInsights />
      </div>

      {/* Conversion Rate Over Time */}
      <ChartContainer
        title="Daily Conversion Rate (%)"
        actions={
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <TrendingUp size={16} className="text-emerald-400" />
            <span>+{statsData.conversionChange}% vs last period</span>
          </div>
        }
      >
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={conversionData}>
              <defs>
                <linearGradient id="convGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                tickFormatter={(v) => `${v}%`}
                domain={[0, 20]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '12px',
                }}
                formatter={(value: unknown) => [`${value}%`, 'Conversion']}
              />
              <Area
                type="monotone"
                dataKey="conversion"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#convGradient)"
                dot={{ fill: '#10b981', r: 3, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>
    </div>
  )
}
