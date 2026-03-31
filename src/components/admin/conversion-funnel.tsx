'use client'

import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface FunnelStage {
  stage: string
  count: number
  percentage: number
}

interface ConversionFunnelProps {
  data?: FunnelStage[]
}

const MOCK_FUNNEL: FunnelStage[] = [
  { stage: 'Visitors', count: 45200, percentage: 100 },
  { stage: 'Add to Cart', count: 12840, percentage: 28.4 },
  { stage: 'Checkout', count: 6320, percentage: 14.0 },
  { stage: 'Purchase', count: 3890, percentage: 8.6 },
]

const STAGE_COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#06b6d4']
const STAGE_ICONS = ['👁️', '🛒', '💳', '✅']

export function ConversionFunnel({ data }: ConversionFunnelProps) {
  const funnelData: FunnelStage[] = data && data.length > 0 ? data : MOCK_FUNNEL
  const lastStage = funnelData[funnelData.length - 1]
  const firstStage = funnelData[0]
  const overallConversion =
    firstStage && lastStage && firstStage.count > 0 ? (lastStage.count / firstStage.count) * 100 : 0

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6 shadow-xl backdrop-blur-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Conversion Funnel</h3>
        <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-medium text-cyan-400">
          {overallConversion.toFixed(1)}% overall
        </span>
      </div>

      <div className="mb-6 h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={funnelData} layout="vertical">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.06)"
              horizontal={false}
            />
            <XAxis
              type="number"
              stroke="#64748b"
              style={{ fontSize: '12px' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
            />
            <YAxis
              type="category"
              dataKey="stage"
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
              tickLine={false}
              axisLine={false}
              width={100}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '12px',
              }}
              formatter={(value: unknown) => [
                typeof value === 'number' ? value.toLocaleString() : String(value),
                'Count',
              ]}
            />
            <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={32}>
              {funnelData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={STAGE_COLORS[index] || '#6b7280'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {funnelData.map((stage, index) => {
          const prev = index > 0 ? funnelData[index - 1] : undefined
          const dropoff = prev ? ((prev.count - stage.count) / prev.count) * 100 : 0
          const stepConversion = prev ? (stage.count / prev.count) * 100 : 100
          return (
            <motion.div
              key={stage.stage}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="rounded-xl bg-slate-900/40 p-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
            >
              <div className="mb-2 flex items-center gap-2">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-full text-sm"
                  style={{ backgroundColor: `${STAGE_COLORS[index]}25` }}
                >
                  {STAGE_ICONS[index]}
                </div>
                <p className="text-xs text-slate-400">{stage.stage}</p>
              </div>
              <p className="text-lg font-bold text-white">{stage.count.toLocaleString()}</p>
              <div className="mt-1 flex items-center justify-between">
                <p className="text-sm text-slate-400">{stage.percentage.toFixed(1)}% of total</p>
              </div>
              {index > 0 && (
                <div className="mt-2 flex items-center justify-between border-t border-slate-700/50 pt-2">
                  <p className="text-xs text-emerald-400">
                    {stepConversion.toFixed(1)}% step conv.
                  </p>
                  <p className="text-xs text-red-400/80">-{dropoff.toFixed(1)}%</p>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
