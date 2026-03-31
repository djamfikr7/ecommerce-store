'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Eye,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Package,
  Download,
} from 'lucide-react'
import { ChartContainer } from '@/components/admin/chart-container'
import { StatsCard } from '@/components/admin/stats-card'
import { DateRangePicker, DateRangePreset } from '@/components/admin/date-range-picker'
import { exportToCSV } from '@/lib/analytics/csv-export'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const PRODUCTS: Record<string, { name: string; sku: string }> = {
  '1': { name: 'Wireless Headphones Pro', sku: 'WHP-001' },
  '2': { name: 'Smart Watch Series 5', sku: 'SWS-005' },
  '3': { name: 'USB-C Hub 7-in-1', sku: 'UCH-007' },
  '4': { name: 'Bluetooth Speaker Mini', sku: 'BSM-004' },
  '5': { name: 'Portable Charger 20000mAh', sku: 'PCH-020' },
  '6': { name: 'Mechanical Keyboard RGB', sku: 'MKR-006' },
  '7': { name: 'Webcam 4K Ultra', sku: 'WC4-007' },
}

const TRAFFIC_COLORS = ['#06b6d4', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b']

function generateViewsData(days: number) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (days - 1 - i))
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      views: Math.floor(Math.random() * 200) + 100,
    }
  })
}

function generateRevenueData(days: number) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (days - 1 - i))
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: Math.floor(Math.random() * 1000) + 500,
    }
  })
}

function generateConversionData() {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      addToCart: Math.floor(Math.random() * 30) + 10,
      purchases: Math.floor(Math.random() * 15) + 5,
    }
  })
}

export default function ProductAnalyticsPage({ params }: { params: { id: string } }) {
  const product = PRODUCTS[params.id] || { name: 'Unknown Product', sku: `SKU-${params.id}` }
  const [dateRange, setDateRange] = useState<DateRangePreset>('30d')

  const days = dateRange === '7d' ? 7 : dateRange === '90d' ? 90 : 30

  const viewsData = useMemo(() => generateViewsData(days), [days])
  const revenueData = useMemo(() => generateRevenueData(days), [days])
  const conversionData = useMemo(() => generateConversionData(), [])

  const statsData = useMemo(
    () => ({
      totalViews: 4520,
      viewsChange: 12.5,
      addToCartRate: 28.4,
      cartChange: 5.2,
      purchaseRate: 12.3,
      purchaseChange: 3.1,
      totalRevenue: 15420,
      revenueChange: 15.8,
    }),
    [],
  )

  const trafficSources = useMemo(
    () => [
      { source: 'Organic Search', value: 1850, percentage: 41 },
      { source: 'Direct', value: 1120, percentage: 25 },
      { source: 'Social Media', value: 890, percentage: 20 },
      { source: 'Referral', value: 450, percentage: 10 },
      { source: 'Email', value: 210, percentage: 4 },
    ],
    [],
  )

  const handleExport = () => {
    const data = revenueData.map((r, i) => ({
      date: r.date,
      revenue: r.revenue,
      views: viewsData[i]?.views ?? 0,
    }))
    exportToCSV(
      data,
      [
        { key: 'date', label: 'Date' },
        { key: 'views', label: 'Views' },
        { key: 'revenue', label: 'Revenue' },
      ],
      `product-${params.id}-analytics`,
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/analytics"
            className="rounded-xl bg-slate-800/50 p-2 text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-white"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white lg:text-3xl">{product.name}</h1>
            <p className="mt-1 text-slate-400">SKU: {product.sku}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-300 transition-colors hover:bg-slate-700/50"
          >
            <Download size={16} />
            <span className="text-sm font-medium">Export CSV</span>
          </button>
          <Link
            href={`/admin/products/${params.id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800/50 px-4 py-2.5 text-slate-300 transition-colors hover:bg-slate-700/50"
          >
            <Package size={16} />
            <span className="text-sm font-medium">Edit Product</span>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <StatsCard
          title="Total Views"
          value={statsData.totalViews.toLocaleString()}
          trend={statsData.viewsChange}
          trendDirection="up"
          icon={Eye}
        />
        <StatsCard
          title="Add to Cart Rate"
          value={`${statsData.addToCartRate}%`}
          trend={statsData.cartChange}
          trendDirection="up"
          icon={ShoppingCart}
        />
        <StatsCard
          title="Purchase Rate"
          value={`${statsData.purchaseRate}%`}
          trend={statsData.purchaseChange}
          trendDirection="up"
          icon={TrendingUp}
        />
        <StatsCard
          title="Total Revenue"
          value={`$${statsData.totalRevenue.toLocaleString()}`}
          trend={statsData.revenueChange}
          trendDirection="up"
          icon={DollarSign}
        />
      </div>

      {/* Views Chart */}
      <ChartContainer title="Product Views (Daily)">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={viewsData}>
              <defs>
                <linearGradient id="prodViewsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
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
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '12px',
                }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Area
                type="monotone"
                dataKey="views"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill="url(#prodViewsGrad)"
                dot={{ fill: '#6366f1', r: 3, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>

      {/* Conversion & Traffic */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartContainer
          title="Add to Cart vs Purchases"
          actions={
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-cyan-500" />
                <span className="text-slate-400">Add to Cart</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="text-slate-400">Purchases</span>
              </div>
            </div>
          }
        >
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis
                  dataKey="day"
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
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '12px',
                  }}
                />
                <Bar dataKey="addToCart" fill="#06b6d4" radius={[6, 6, 0, 0]} name="Add to Cart" />
                <Bar dataKey="purchases" fill="#10b981" radius={[6, 6, 0, 0]} name="Purchases" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>

        <ChartContainer title="Traffic Sources">
          <div className="flex flex-col items-center gap-6 lg:flex-row">
            <div className="h-[200px] w-full lg:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={trafficSources}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {trafficSources.map((_, i) => (
                      <Cell key={`cell-${i}`} fill={TRAFFIC_COLORS[i] ?? '#6b7280'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '12px',
                    }}
                    formatter={(value: unknown) => [
                      typeof value === 'number' ? value.toLocaleString() : String(value),
                      'Visits',
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full space-y-3 lg:w-1/2">
              {trafficSources.map((source, i) => (
                <div key={source.source} className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: TRAFFIC_COLORS[i] }}
                  />
                  <span className="flex-1 text-sm text-slate-300">{source.source}</span>
                  <span className="text-sm font-medium text-slate-400">
                    {source.value.toLocaleString()}
                  </span>
                  <span className="w-10 text-right text-sm font-medium text-cyan-400">
                    {source.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ChartContainer>
      </div>

      {/* Revenue Chart */}
      <ChartContainer title="Revenue Over Time">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="prodRevenueGrad" x1="0" y1="0" x2="0" y2="1">
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
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '12px',
                }}
                labelStyle={{ color: '#e2e8f0' }}
                formatter={(value: unknown) => [
                  `$${typeof value === 'number' ? value.toFixed(2) : value}`,
                  'Revenue',
                ]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#prodRevenueGrad)"
                dot={{ fill: '#10b981', r: 3, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>
    </div>
  )
}
