'use client'
import React, { useState, useMemo } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import DatePicker from '../../components/ui/DatePicker'
import LineChartLoadCurve from '../../components/dashboard/LineChartLoadCurve'
import PeakBars from '../../components/dashboard/PeakBars'
import Skeleton from '../../components/ui/Skeleton'
import { useForecast } from '../../lib/hooks/useForecast'

type Horizon = '24h' | '7d'

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [selectedZone, setSelectedZone] = useState<string>('all')
  const [horizon, setHorizon] = useState<Horizon>('24h')
  const [weatherOverride, setWeatherOverride] = useState<boolean>(false)

  const { data: forecastData, isLoading, error } = useForecast({
    date: selectedDate,
    horizon,
    area: selectedZone,
    weatherOverride: weatherOverride ? { use_actual: true } : undefined,
  })

  const loadCurveData = useMemo(() => {
    if (!forecastData) return []
    return forecastData.points.map(point => ({
      time: point.time,
      forecast: point.demand_mw,
      temperature: point.temperature,
      actual: undefined,
    }))
  }, [forecastData])

  const peakBreakdownData = useMemo(() => {
    if (!forecastData) return []
    return forecastData.peaks.map(peak => ({
      label: peak.type === 'primary' ? 'Primary Peak' : 'Secondary Peak',
      value: peak.demand_mw,
      time: `${peak.time} IST`,
      type: peak.type,
    }))
  }, [forecastData])

  const stats = forecastData?.statistics

  return (
    <main className="min-h-screen bg-gray-25">
      <div className="container py-8 space-y-8">
        <div className="fade-in">
          <h1 className="text-gray-900">Load Forecasting Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1.5">Real-time demand forecasting and analytics for grid operations</p>
        </div>

        <Card className="p-6 fade-in" style={{ animationDelay: '0.05s' }}>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">Forecast Date</label>
              <DatePicker
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-44"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">Area / Zone</label>
              <Select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-48"
              >
                <option value="all">All Delhi</option>
                <option value="north">North Delhi</option>
                <option value="south">South Delhi</option>
                <option value="east">East Delhi</option>
                <option value="west">West Delhi</option>
                <option value="central">Central Delhi</option>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">Forecast Horizon</label>
              <div className="flex gap-2">
                <Button
                  variant={horizon === '24h' ? 'primary' : 'ghost'}
                  onClick={() => setHorizon('24h')}
                  className="px-4 py-2"
                >
                  24 Hours
                </Button>
                <Button
                  variant={horizon === '7d' ? 'primary' : 'ghost'}
                  onClick={() => setHorizon('7d')}
                  className="px-4 py-2"
                >
                  7 Days
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 ml-auto">
              <label className="text-xs font-medium text-gray-600">Weather Override</label>
              <Button
                variant={weatherOverride ? 'primary' : 'ghost'}
                onClick={() => setWeatherOverride(!weatherOverride)}
                className="px-4 py-2"
              >
                {weatherOverride ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="p-6 fade-in" style={{ animationDelay: `${i * 0.03}s` }}>
                  <Skeleton className="h-4 w-24 mb-4" variant="text" />
                  <Skeleton className="h-9 w-20 mb-2" />
                  <Skeleton className="h-3 w-16" variant="text" />
                </Card>
              ))}
            </>
          ) : error ? (
            <div className="col-span-4 fade-in">
              <Card className="p-6 bg-error-50 border-error-200">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-error-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-semibold text-error-900">Failed to load forecast data</h3>
                    <p className="text-sm text-error-700 mt-1">{error.message}</p>
                    <button 
                      onClick={() => window.location.reload()}
                      className="mt-3 text-xs font-medium text-error-700 hover:text-error-800 underline"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <>
              <Card hover className="p-6 fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Forecasted Peak Demand</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-semibold text-gray-900 tracking-tight">
                      {stats?.peak_demand.toLocaleString() || '---'}
                    </span>
                    <span className="text-sm text-gray-600">MW</span>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-xs text-success-600 font-medium">Live data</span>
                  </div>
                </div>
              </Card>

              <Card hover className="p-6 fade-in" style={{ animationDelay: '0.13s' }}>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Peak Time</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-semibold text-gray-900 tracking-tight">
                      {forecastData?.peaks[0]?.time || '---'}
                    </span>
                    <span className="text-sm text-gray-600">IST</span>
                  </div>
                  <div className="mt-3">
                    <span className="text-xs text-gray-500">{forecastData?.peaks[0]?.window || '---'}</span>
                  </div>
                </div>
              </Card>

              <Card hover className="p-6 fade-in" style={{ animationDelay: '0.16s' }}>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Minimum Demand</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-semibold text-gray-900 tracking-tight">
                      {stats?.min_demand.toLocaleString() || '---'}
                    </span>
                    <span className="text-sm text-gray-600">MW</span>
                  </div>
                  <div className="mt-3">
                    <span className="text-xs text-gray-500">Off-peak minimum</span>
                  </div>
                </div>
              </Card>

              <Card hover className="p-6 fade-in" style={{ animationDelay: '0.19s' }}>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Load Factor</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-semibold text-gray-900 tracking-tight">
                      {stats ? `${Math.round(stats.load_factor * 100)}%` : '---'}
                    </span>
                  </div>
                  <div className="mt-3">
                    <span className="text-xs text-gray-500">
                      Avg: {stats?.avg_demand.toLocaleString() || '---'} MW
                    </span>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-8 lg:col-span-2 fade-in" style={{ animationDelay: '0.22s' }}>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Load Curve Forecast</h2>
              <p className="text-sm text-gray-600 mt-1">
                {horizon === '24h' ? '24-hour demand projection' : '7-day demand projection'}
              </p>
            </div>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-96 w-full" />
              </div>
            ) : error ? (
              <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-center">
                  <svg className="mx-auto w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">Failed to load chart</p>
                </div>
              </div>
            ) : (
              <div className="transition-opacity duration-300">
                <LineChartLoadCurve 
                  data={loadCurveData} 
                  height={400}
                  showActual={false}
                  showPeakMarkers={horizon === '24h'}
                />
              </div>
            )}
          </Card>

          <Card className="p-8 fade-in" style={{ animationDelay: '0.25s' }}>
            <h3 className="text-lg font-semibold text-gray-900 tracking-tight mb-6">Peak Breakdown</h3>
            
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-60 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : error ? (
              <div className="h-60 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-400">No data</p>
              </div>
            ) : (
              <div className="transition-opacity duration-300">
                <div className="mb-6">
                  <PeakBars data={peakBreakdownData} height={240} />
                </div>

                <div className="space-y-5">
                  <div className="flex flex-col gap-2 pb-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Primary Peak</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {forecastData?.peaks[0]?.demand_mw.toLocaleString() || '---'} MW
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{forecastData?.peaks[0]?.time || '---'} IST</span>
                      <span>{forecastData?.peaks[0]?.window || '---'} window</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                      <div className="bg-primary-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                    </div>
                  </div>

                  {forecastData?.peaks[1] && (
                    <div className="flex flex-col gap-2 pb-4 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Secondary Peak</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {forecastData.peaks[1].demand_mw.toLocaleString()} MW
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{forecastData.peaks[1].time} IST</span>
                        <span>{forecastData.peaks[1].window} window</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                        <div className="bg-primary-400 h-2 rounded-full" style={{ width: '91%' }}></div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Off-Peak Minimum</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {stats?.min_demand.toLocaleString() || '---'} MW
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Early morning</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                      <div className="bg-gray-400 h-2 rounded-full" style={{ width: '38%' }}></div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Peak-to-Valley Ratio</span>
                      <span className="font-semibold text-gray-900">
                        {stats?.peak_to_valley_ratio.toFixed(2) || '---'}x
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-gray-600">Load Factor</span>
                      <span className="font-semibold text-gray-900">
                        {stats ? `${Math.round(stats.load_factor * 100)}%` : '---'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </main>
  )
}
