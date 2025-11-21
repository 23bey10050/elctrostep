'use client'
import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  Legend,
} from 'recharts'

type DataPoint = {
  time: string
  forecast: number
  actual?: number
  temperature?: number
}

type LineChartLoadCurveProps = {
  data: DataPoint[]
  height?: number
  showActual?: boolean
  showPeakMarkers?: boolean
  colors?: {
    forecast?: string
    actual?: string
    grid?: string
  }
}

export default function LineChartLoadCurve({
  data,
  height = 400,
  showActual = false,
  showPeakMarkers = true,
  colors = {
    forecast: '#178FFF',
    actual: '#6B7280',
    grid: '#E5E7EB',
  },
}: LineChartLoadCurveProps) {
  // Safety check for empty data
  if (!data || data.length === 0) {
    return (
      <div className="w-full flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200" style={{ height }}>
        <p className="text-sm text-gray-400">No data available</p>
      </div>
    )
  }

  // Find peak values for markers
  const peakForecast = data.reduce((max, point) => 
    point.forecast > max.forecast ? point : max, data[0]
  )
  
  const secondaryPeaks = data
    .filter(point => point.forecast > peakForecast.forecast * 0.92 && point.time !== peakForecast.time)
    .sort((a, b) => b.forecast - a.forecast)
    .slice(0, 1)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-xs font-medium text-gray-500 mb-2">{payload[0].payload.time}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="text-xs font-medium" style={{ color: entry.color }}>
                {entry.name}:
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {entry.value.toLocaleString()} MW
              </span>
            </div>
          ))}
          {payload[0].payload.temperature && (
            <div className="flex items-center justify-between gap-4 mt-1 pt-1 border-t border-gray-100">
              <span className="text-xs text-gray-500">Temperature:</span>
              <span className="text-xs font-medium text-gray-700">
                {payload[0].payload.temperature}°C
              </span>
            </div>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
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
          label={{ value: 'Demand (MW)', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#6B7280' } }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
          iconType="line"
        />
        
        {showActual && (
          <Line
            type="monotone"
            dataKey="actual"
            stroke={colors.actual}
            strokeWidth={2}
            dot={false}
            name="Actual"
            strokeDasharray="5 5"
          />
        )}
        
        <Line
          type="monotone"
          dataKey="forecast"
          stroke={colors.forecast}
          strokeWidth={3}
          dot={false}
          name="Forecast"
          activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
        />

        {showPeakMarkers && (
          <>
            <ReferenceDot
              x={peakForecast.time}
              y={peakForecast.forecast}
              r={8}
              fill={colors.forecast}
              stroke="#fff"
              strokeWidth={2}
              label={{
                value: `Peak: ${peakForecast.forecast.toLocaleString()} MW`,
                position: 'top',
                fill: '#374151',
                fontSize: 11,
                fontWeight: 600,
              }}
            />
            {secondaryPeaks.map((peak, idx) => (
              <ReferenceDot
                key={idx}
                x={peak.time}
                y={peak.forecast}
                r={6}
                fill={colors.forecast}
                fillOpacity={0.7}
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </>
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}
