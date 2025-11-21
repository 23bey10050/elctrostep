'use client'
import React, { useState } from 'react'
import Card from '../../components/ui/Card'
import Select from '../../components/ui/Select'
import DatePicker from '../../components/ui/DatePicker'
import Skeleton from '../../components/ui/Skeleton'
import LineChartLoadCurve from '../../components/dashboard/LineChartLoadCurve'

interface HistoricalDataPoint {
  time: string
  actual: number
  forecast: number
  temperature?: number
}

interface ErrorMetrics {
  mape: number
  rmse: number
  mae: number
  peak_error: number
  peak_error_percent: number
  r_squared: number
}

// Generate dummy historical data
function generateHistoricalData(date: string): HistoricalDataPoint[] {
  const data: HistoricalDataPoint[] = []
  const baseLoad = 6500
  const dateObj = new Date(date)
  const dayOfWeek = dateObj.getDay()
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

  for (let hour = 0; hour < 24; hour++) {
    // Actual load pattern (with realistic noise)
    const diurnalActual = 0.65 + 
      Math.max(0, Math.sin((hour - 6) * Math.PI / 12) * 0.3) +
      Math.exp(-Math.pow((hour - 15) / 3, 2)) * 0.5 +
      Math.exp(-Math.pow((hour - 23) / 2.5, 2)) * 0.6
    
    const weekendFactorActual = isWeekend ? 0.88 : 1.0
    const noiseActual = (Math.random() - 0.5) * 0.08
    const actual = Math.round(baseLoad * diurnalActual * weekendFactorActual * (1 + noiseActual))

    // Forecast pattern (slightly different, showing model imperfection)
    const diurnalForecast = 0.65 + 
      Math.max(0, Math.sin((hour - 6) * Math.PI / 12) * 0.29) +
      Math.exp(-Math.pow((hour - 14.5) / 3.2, 2)) * 0.48 +
      Math.exp(-Math.pow((hour - 22.8) / 2.6, 2)) * 0.62
    
    const weekendFactorForecast = isWeekend ? 0.90 : 1.0
    const noiseForecast = (Math.random() - 0.5) * 0.05
    const forecast = Math.round(baseLoad * diurnalForecast * weekendFactorForecast * (1 + noiseForecast))

    const baseTemp = 25 + Math.sin((hour - 14) * Math.PI / 12) * 8
    
    data.push({
      time: `${hour.toString().padStart(2, '0')}:00`,
      actual,
      forecast,
      temperature: Math.round(baseTemp * 10) / 10
    })
  }

  return data
}

// Calculate error metrics
function calculateErrorMetrics(data: HistoricalDataPoint[]): ErrorMetrics {
  const n = data.length
  let sumAbsPercentError = 0
  let sumSquaredError = 0
  let sumAbsError = 0
  let sumActual = 0
  let sumSquaredActual = 0

  const actualPeak = Math.max(...data.map(d => d.actual))
  const forecastPeak = Math.max(...data.map(d => d.forecast))
  const peakError = forecastPeak - actualPeak
  const peakErrorPercent = (peakError / actualPeak) * 100

  data.forEach(point => {
    const error = point.forecast - point.actual
    const absError = Math.abs(error)
    const percentError = (absError / point.actual) * 100

    sumAbsPercentError += percentError
    sumSquaredError += error * error
    sumAbsError += absError
    sumActual += point.actual
    sumSquaredActual += point.actual * point.actual
  })

  const mape = sumAbsPercentError / n
  const rmse = Math.sqrt(sumSquaredError / n)
  const mae = sumAbsError / n

  // Calculate R-squared
  const meanActual = sumActual / n
  const meanForecast = data.reduce((sum, d) => sum + d.forecast, 0) / n
  
  let ssRes = 0
  let ssTot = 0
  data.forEach(point => {
    ssRes += Math.pow(point.actual - point.forecast, 2)
    ssTot += Math.pow(point.actual - meanActual, 2)
  })
  const rSquared = 1 - (ssRes / ssTot)

  return {
    mape: Math.round(mape * 100) / 100,
    rmse: Math.round(rmse),
    mae: Math.round(mae),
    peak_error: Math.round(peakError),
    peak_error_percent: Math.round(peakErrorPercent * 100) / 100,
    r_squared: Math.round(rSquared * 1000) / 1000
  }
}

export default function HistoricalPage() {
  const [selectedDate, setSelectedDate] = useState(
    new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Yesterday
  )
  const [viewMode, setViewMode] = useState<'comparison' | 'error-analysis'>('comparison')
  const [isLoading, setIsLoading] = useState(false)

  // Generate data based on selected date
  const historicalData = generateHistoricalData(selectedDate)
  const errorMetrics = calculateErrorMetrics(historicalData)

  // Transform for chart component
  const chartData = historicalData.map(point => ({
    time: point.time,
    forecast: point.forecast,
    actual: point.actual,
    temperature: point.temperature
  }))

  const handleDateChange = (date: string) => {
    setIsLoading(true)
    setSelectedDate(date)
    // Simulate API delay
    setTimeout(() => setIsLoading(false), 300)
  }

  return (
    <main className="min-h-screen bg-gray-25">
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="fade-in">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Historical Performance Analysis</h1>
          <p className="text-sm text-gray-600 mt-1.5">
            Compare actual load against forecasted values and evaluate model accuracy
          </p>
        </div>
        {/* Controls */}
        <Card className="p-6 fade-in" style={{ animationDelay: '0.05s' }}>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">Historical Date</label>
              <DatePicker
                value={selectedDate}
                 onChange={(e) => handleDateChange(e.target.value)}
                 max={new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">View Mode</label>
              <Select
                value={viewMode}
                onChange={(val) => setViewMode(val as 'comparison' | 'error-analysis')}
                options={[
                  { value: 'comparison', label: 'Actual vs Forecast' },
                  { value: 'error-analysis', label: 'Error Analysis' },
                ]}
              />
            </div>

            <div className="ml-auto flex items-end gap-2">
              <div className="text-xs text-gray-500">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-0.5 bg-primary-600"></div>
                  <span>Forecast</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-gray-400"></div>
                  <span>Actual</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Error Metrics KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <Card hover className="p-6 fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">MAPE</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-semibold tracking-tight ${
                  errorMetrics.mape < 3 ? 'text-success-600' : 
                  errorMetrics.mape < 5 ? 'text-warning-600' : 
                  'text-error-600'
                }`}>
                  {errorMetrics.mape}
                </span>
                <span className="text-sm text-gray-600">%</span>
              </div>
              <div className="mt-3">
                <span className="text-xs text-gray-500">Mean Abs % Error</span>
              </div>
            </div>
          </Card>

          <Card hover className="p-6 fade-in" style={{ animationDelay: '0.13s' }}>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">RMSE</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-gray-900 tracking-tight">
                  {errorMetrics.rmse}
                </span>
                <span className="text-sm text-gray-600">MW</span>
              </div>
              <div className="mt-3">
                <span className="text-xs text-gray-500">Root Mean Sq Error</span>
              </div>
            </div>
          </Card>

          <Card hover className="p-6 fade-in" style={{ animationDelay: '0.16s' }}>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">MAE</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-gray-900 tracking-tight">
                  {errorMetrics.mae}
                </span>
                <span className="text-sm text-gray-600">MW</span>
              </div>
              <div className="mt-3">
                <span className="text-xs text-gray-500">Mean Abs Error</span>
              </div>
            </div>
          </Card>

          <Card hover className="p-6 fade-in" style={{ animationDelay: '0.19s' }}>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Peak Error</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-semibold tracking-tight ${
                  Math.abs(errorMetrics.peak_error_percent) < 2 ? 'text-success-600' : 
                  Math.abs(errorMetrics.peak_error_percent) < 5 ? 'text-warning-600' : 
                  'text-error-600'
                }`}>
                  {errorMetrics.peak_error > 0 ? '+' : ''}{errorMetrics.peak_error}
                </span>
                <span className="text-sm text-gray-600">MW</span>
              </div>
              <div className="mt-3">
                <span className="text-xs text-gray-500">
                  {errorMetrics.peak_error_percent > 0 ? '+' : ''}{errorMetrics.peak_error_percent}% error
                </span>
              </div>
            </div>
          </Card>

          <Card hover className="p-6 fade-in" style={{ animationDelay: '0.22s' }}>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">R²</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-semibold tracking-tight ${
                  errorMetrics.r_squared > 0.95 ? 'text-success-600' : 
                  errorMetrics.r_squared > 0.90 ? 'text-warning-600' : 
                  'text-error-600'
                }`}>
                  {errorMetrics.r_squared.toFixed(3)}
                </span>
              </div>
              <div className="mt-3">
                <span className="text-xs text-gray-500">Goodness of Fit</span>
              </div>
            </div>
          </Card>

          <Card hover className="p-6 bg-primary-50 border-primary-200 fade-in" style={{ animationDelay: '0.25s' }}>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-primary-700 uppercase tracking-wider mb-3">Accuracy</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-primary-900 tracking-tight">
                  {(100 - errorMetrics.mape).toFixed(1)}
                </span>
                <span className="text-sm text-primary-700">%</span>
              </div>
              <div className="mt-3">
                <span className="text-xs text-primary-600">Overall Model Score</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Comparison Chart */}
        {viewMode === 'comparison' && (
          <Card className="p-8 fade-in" style={{ animationDelay: '0.28s' }}>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Actual vs Forecast Comparison</h2>
              <p className="text-sm text-gray-600 mt-1">
                24-hour load profile comparison for {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-96 w-full" />
              </div>
            ) : (
              <div className="transition-opacity duration-300">
                <LineChartLoadCurve
                  data={chartData}
                  height={450}
                  showActual={true}
                  showPeakMarkers={true}
                />
              </div>
            )}
          </Card>
        )}

        {/* Error Analysis View */}
        {viewMode === 'error-analysis' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-8 fade-in" style={{ animationDelay: '0.28s' }}>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Error Distribution</h2>
                <p className="text-sm text-gray-600 mt-1">Forecast error by time of day</p>
              </div>

              {isLoading ? (
                <Skeleton className="h-80 w-full" />
              ) : (
                <div className="space-y-2">
                  {historicalData.map((point, idx) => {
                    const error = point.forecast - point.actual
                    const errorPercent = (error / point.actual) * 100
                    const isLarge = Math.abs(errorPercent) > 5

                    return (
                      <div key={idx} className="flex items-center gap-3 text-sm">
                        <span className="text-xs font-medium text-gray-500 w-14">{point.time}</span>
                        <div className="flex-1 relative h-6 bg-gray-100 rounded overflow-hidden">
                          <div 
                            className={`absolute h-full ${
                              error > 0 ? 'bg-error-400 right-1/2' : 'bg-success-400 left-1/2'
                            } ${isLarge ? 'opacity-90' : 'opacity-60'}`}
                            style={{
                              width: `${Math.min(Math.abs(errorPercent) * 5, 50)}%`
                            }}
                          ></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-700">
                              {error > 0 ? '+' : ''}{Math.round(error)} MW
                            </span>
                          </div>
                        </div>
                        <span className={`text-xs font-semibold w-16 text-right ${
                          Math.abs(errorPercent) < 3 ? 'text-success-600' : 
                          Math.abs(errorPercent) < 5 ? 'text-warning-600' : 
                          'text-error-600'
                        }`}>
                          {errorPercent > 0 ? '+' : ''}{errorPercent.toFixed(1)}%
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>

            <Card className="p-8 fade-in" style={{ animationDelay: '0.32s' }}>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Performance Insights</h2>
                <p className="text-sm text-gray-600 mt-1">Model accuracy breakdown</p>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-5 border border-primary-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Model Grade</h3>
                      <p className="text-xs text-gray-600 mt-0.5">Based on MAPE score</p>
                    </div>
                    <div className="text-3xl font-bold text-primary-600">
                      {errorMetrics.mape < 3 ? 'A+' : errorMetrics.mape < 5 ? 'A' : errorMetrics.mape < 7 ? 'B' : errorMetrics.mape < 10 ? 'C' : 'D'}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        errorMetrics.mape < 3 ? 'bg-success-500' : errorMetrics.mape < 5 ? 'bg-success-400' : errorMetrics.mape < 7 ? 'bg-warning-400' : 'bg-warning-500'
                      }`}
                      style={{ width: `${Math.min((100 - errorMetrics.mape) * 1.05, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900">Key Findings</h3>
                  
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <svg className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-900">High R² Score</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        R² of {errorMetrics.r_squared.toFixed(3)} indicates excellent fit quality
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${Math.abs(errorMetrics.peak_error_percent) < 3 ? 'text-success-500' : 'text-warning-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Peak Forecast Accuracy</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Peak demand error: {errorMetrics.peak_error > 0 ? '+' : ''}{errorMetrics.peak_error} MW ({errorMetrics.peak_error_percent}%)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Average Error</p>
                      <p className="text-xs text-gray-600 mt-0.5">MAE of {errorMetrics.mae} MW across all hours</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Recommendations</h3>
                  <ul className="space-y-2 text-xs text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-primary-600 mt-0.5">•</span>
                      <span>{errorMetrics.mape < 5 ? 'Model performance is excellent. Continue monitoring for consistency.' : 'Consider retraining with recent data to improve accuracy.'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-600 mt-0.5">•</span>
                      <span>{Math.abs(errorMetrics.peak_error_percent) < 3 ? 'Peak forecasting is highly accurate. Suitable for capacity planning.' : 'Peak errors detected. Review weather input parameters.'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-600 mt-0.5">•</span>
                      <span>Track error patterns across multiple days for trend analysis.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </main>
  )
}
