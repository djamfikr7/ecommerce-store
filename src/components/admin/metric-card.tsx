'use client'

import { motion } from 'framer-motion'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

interface MetricCardProps {
  title: string
  value: string
  trend?: number
  trendDirection?: 'up' | 'down'
  icon: LucideIcon
  chartData?: { value: number }[]
  chartColor?: 'cyan' | 'purple' | 'emerald' | 'amber'
  subtitle?: string
}

interface ColorScheme {
  from: string
  to: string
  chart: string
}

const gradientMap = {
  cyan: {
    from: 'from-cyan-500/20',
    to: 'to-blue-500/20',
    chart: '#06b6d4',
  },
  purple: {
    from: 'from-purple-500/20',
    to: 'to-pink-500/20',
    chart: '#a855f7',
  },
  emerald: {
    from: 'from-emerald-500/20',
    to: 'to-teal-500/20',
    chart: '#10b981',
  },
  amber: {
    from: 'from-amber-500/20',
    to: 'to-orange-500/20',
    chart: '#f59e0b',
  },
} as const

const defaultColors: ColorScheme = gradientMap.cyan

export function MetricCard({
  title,
  value,
  trend,
  trendDirection = 'up',
  icon: Icon,
  chartData,
  chartColor = 'cyan' as const,
  subtitle,
}: MetricCardProps) {
  const colors: ColorScheme = gradientMap[chartColor] ?? defaultColors

  const miniChartData =
    chartData ||
    Array.from({ length: 12 }, () => ({
      value: Math.floor(Math.random() * 100) + 20,
    }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6 shadow-xl backdrop-blur-sm"
    >
      {/* Background decoration */}
      <div
        className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${colors.from} ${colors.to} blur-3xl`}
      />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-400">{title}</p>
            <motion.p
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="mt-2 text-2xl font-bold text-white lg:text-3xl"
            >
              {value}
            </motion.p>
            {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
          </div>
          <div className={`rounded-xl bg-gradient-to-br ${colors.from} ${colors.to} p-3`}>
            <Icon className="text-slate-300" size={24} />
          </div>
        </div>

        {/* Trend */}
        {trend !== undefined && (
          <div className="mt-3 flex items-center gap-1.5">
            {trendDirection === 'up' ? (
              <TrendingUp size={16} className="text-emerald-400" />
            ) : (
              <TrendingDown size={16} className="text-red-400" />
            )}
            <span
              className={`text-sm font-medium ${
                trendDirection === 'up' ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {trend > 0 ? '+' : ''}
              {trend}%
            </span>
            <span className="text-sm text-slate-500">vs last period</span>
          </div>
        )}

        {/* Mini Chart */}
        <div className="mt-4 h-12">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={miniChartData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={colors.chart}
                strokeWidth={2}
                dot={false}
                fill="none"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  )
}
