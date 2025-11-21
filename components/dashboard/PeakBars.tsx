'use client'
import React from 'react'
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

type PeakData = {
  label: string
  value: number
  time: string
  type: 'primary' | 'secondary' | 'minimum'
}

type PeakBarsProps = {
  data: PeakData[]
  height?: number
}

const COLORS = {
  primary: '#178FFF',
  secondary: '#4FB9FF',
  minimum: '#9CA3AF',
}

export default function PeakBars({ data, height = 300 }: PeakBarsProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200" style={{ height }}>
        <p className="text-sm text-gray-400">No peak data available</p>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-xs font-semibold text-gray-900 mb-1">{data.label}</p>
          <p className="text-sm font-bold text-primary-600">{data.value.toLocaleString()} MW</p>
          <p className="text-xs text-gray-500 mt-1">{data.time}</p>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#6B7280' }}
          tickLine={false}
          axisLine={{ stroke: '#E5E7EB' }}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#6B7280' }}
          tickLine={false}
          axisLine={{ stroke: '#E5E7EB' }}
          label={{ value: 'MW', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#6B7280' } }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(23, 143, 255, 0.05)' }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.type]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
