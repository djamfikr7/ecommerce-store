'use client'

import { ConversionFunnelData } from '@/lib/analytics/calculations'
import { FunnelChart, Funnel, LabelList, ResponsiveContainer, Tooltip } from 'recharts'

interface ConversionFunnelProps {
  data: ConversionFunnelData[]
}

export function ConversionFunnel({ data }: ConversionFunnelProps) {
  const chartData = data.map((item, index) => ({
    ...item,
    fill: ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981'][index] || '#6b7280',
  }))

  return (
    <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 shadow-[inset_0_2px_8px_rgba(0,0,0,0.3),0_8px_24px_rgba(0,0,0,0.4)]">
      <h3 className="mb-6 text-xl font-bold text-white">Conversion Funnel</h3>

      <ResponsiveContainer width="100%" height={400}>
        <FunnelChart>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
            labelStyle={{ color: '#f3f4f6' }}
            formatter={(value: any, name: any) => {
              if (name === 'count') {
                return [value.toLocaleString(), 'Count']
              }
              if (name === 'percentage') {
                return [`${value.toFixed(1)}%`, 'Conversion Rate']
              }
              return [value, name]
            }}
          />
          <Funnel dataKey="count" data={chartData} isAnimationActive>
            <LabelList
              position="right"
              fill="#fff"
              stroke="none"
              dataKey="stage"
              style={{ fontSize: '14px', fontWeight: 'bold' }}
            />
            <LabelList
              position="inside"
              fill="#fff"
              stroke="none"
              dataKey="percentage"
              formatter={(value: any) =>
                typeof value === 'number' ? `${value.toFixed(1)}%` : value
              }
              style={{ fontSize: '16px', fontWeight: 'bold' }}
            />
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {data.map((item, index) => (
          <div
            key={item.stage}
            className="rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 p-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
          >
            <div
              className="mb-2 h-3 w-3 rounded-full"
              style={{ backgroundColor: chartData[index]?.fill || '#6b7280' }}
            />
            <p className="mb-1 text-xs text-gray-400">{item.stage}</p>
            <p className="text-lg font-bold text-white">{item.count.toLocaleString()}</p>
            <p className="text-sm text-gray-400">{item.percentage.toFixed(1)}%</p>
          </div>
        ))}
      </div>
    </div>
  )
}
