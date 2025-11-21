'use client'
import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

type ScenarioDataPoint = {
  time: string
  baseline: number
  optimistic?: number
  pessimistic?: number
  conservative?: number
}

type ScenarioComparisonChartProps = {
  data: ScenarioDataPoint[]
  height?: number
  scenarios?: ('baseline' | 'optimistic' | 'pessimistic' | 'conservative')[]
}

const SCENARIO_COLORS = {
  baseline: '#178FFF',
  optimistic: '#10B981',
  pessimistic: '#EF4444',
  conservative: '#F59E0B',
}

const SCENARIO_LABELS = {
  baseline: 'Baseline',
  optimistic: 'Optimistic',
  pessimistic: 'Pessimistic',
  conservative: 'Conservative',
}

export default function ScenarioComparisonChart({
  data,
  height = 400,
  scenarios = ['baseline', 'optimistic', 'pessimistic'],
}: ScenarioComparisonChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-xs font-medium text-gray-500 mb-2">{payload[0].payload.time}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 mb-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs font-medium text-gray-700">
                  {entry.name}:
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {entry.value.toLocaleString()} MW
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 12, fill: '#6B7280' }}
          tickLine={false}
          axisLine={{ stroke: '#E5E7EB' }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#6B7280' }}
          tickLine={false}
          axisLine={{ stroke: '#E5E7EB' }}
          label={{
            value: 'Demand (MW)',
            angle: -90,
            position: 'insideLeft',
            style: { fontSize: 12, fill: '#6B7280' },
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
          iconType="line"
        />

        {scenarios.map((scenario) => (
          <Line
            key={scenario}
            type="monotone"
            dataKey={scenario}
            stroke={SCENARIO_COLORS[scenario]}
            strokeWidth={scenario === 'baseline' ? 3 : 2}
            dot={false}
            name={SCENARIO_LABELS[scenario]}
            activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
            strokeDasharray={scenario === 'baseline' ? '0' : '5 5'}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
