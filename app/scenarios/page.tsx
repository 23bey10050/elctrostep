'use client'
import React, { useState } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import DatePicker from '../../components/ui/DatePicker'
import Slider from '../../components/ui/Slider'
import Toggle from '../../components/ui/Toggle'
import Skeleton from '../../components/ui/Skeleton'
import LineChartLoadCurve from '../../components/dashboard/LineChartLoadCurve'
import { getScenarioForecast } from '../../lib/api/scenario'
import type { ScenarioResponse } from '../../lib/api/scenario'

export default function ScenariosPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [area, setArea] = useState('Delhi')
  const [temperatureDelta, setTemperatureDelta] = useState(0)
  const [humidityDelta, setHumidityDelta] = useState(0)
  const [windSpeedDelta, setWindSpeedDelta] = useState(0)
  const [isWeekend, setIsWeekend] = useState(false)
  
  const [scenarioData, setScenarioData] = useState<ScenarioResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const handleRunScenario = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await getScenarioForecast({
        date: selectedDate,
        area,
        temperature_delta: temperatureDelta,
        humidity_delta: humidityDelta,
        wind_speed_delta: windSpeedDelta,
        is_weekend: isWeekend
      })
      setScenarioData(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetParameters = () => {
    setTemperatureDelta(0)
    setHumidityDelta(0)
    setWindSpeedDelta(0)
    setIsWeekend(false)
  }

  const hasChanges = temperatureDelta !== 0 || humidityDelta !== 0 || 
                     windSpeedDelta !== 0 || isWeekend

  // Transform data for chart component
  const chartData = scenarioData ? scenarioData.scenario.map((point, idx) => ({
    time: point.time,
    forecast: point.forecast,
    actual: point.baseline,
    temperature: point.temperature
  })) : []

  return (
    <main className="min-h-screen bg-gray-25">
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="fade-in">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">What-If Scenario Analysis</h1>
          <p className="text-sm text-gray-600 mt-1.5">
            Explore how environmental and operational changes impact load forecasts
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Control Panel */}
          <Card className="p-8 fade-in lg:col-span-1" style={{ animationDelay: '0.05s' }}>
            <h2 className="text-lg font-semibold text-gray-900 tracking-tight mb-6">Scenario Parameters</h2>
            
            <div className="space-y-6">
              {/* Date and Area */}
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-600">Date</label>
                  <DatePicker
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-600">Area</label>
                  <Select
                    value={area}
                    onChange={setArea}
                    options={[
                      { value: 'NDMC', label: 'NDMC' },
                      { value: 'NCR', label: 'NCR' },
                      { value: 'Delhi', label: 'Delhi' },
                      { value: 'Gurgaon', label: 'Gurgaon' },
                      { value: 'Noida', label: 'Noida' },
                      { value: 'Faridabad', label: 'Faridabad' },
                      { value: 'Ghaziabad', label: 'Ghaziabad' },
                    ]}
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-5">Environmental Factors</h3>
                
                <div className="space-y-4">
                  <Slider
                    value={temperatureDelta}
                    onChange={setTemperatureDelta}
                    min={-5}
                    max={5}
                    step={0.5}
                    label="Temperature Deviation"
                    unit="°C"
                  />

                  <Slider
                    value={humidityDelta}
                    onChange={setHumidityDelta}
                    min={-20}
                    max={20}
                    step={5}
                    label="Humidity Adjustment"
                    unit="%"
                  />

                  <Slider
                    value={windSpeedDelta}
                    onChange={setWindSpeedDelta}
                    min={-10}
                    max={10}
                    step={1}
                    label="Wind Speed Adjustment"
                    unit=" m/s"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-5">Operational Factors</h3>
                
                <Toggle
                  checked={isWeekend}
                  onChange={setIsWeekend}
                  label="Force Weekend Pattern"
                />
                <p className="text-xs text-gray-500 mt-2 ml-15">
                  Apply weekend load reduction (~12% lower)
                </p>
              </div>

              <div className="flex gap-3 pt-5">
                <Button
                  onClick={handleRunScenario}
                  disabled={isLoading}
                  variant="primary"
                  className="flex-1"
                >
                  {isLoading ? 'Running...' : 'Run Scenario'}
                </Button>
                {hasChanges && (
                  <Button
                    onClick={resetParameters}
                    variant="outline"
                    disabled={isLoading}
                  >
                    Reset
                  </Button>
                )}
              </div>

              {hasChanges && !scenarioData && (
                <div className="text-xs text-warning-700 bg-warning-50 border border-warning-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>Parameters changed. Click &quot;Run Scenario&quot; to see updated forecast.</span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Comparison Chart */}
            <Card className="p-8 fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Load Curve Comparison</h2>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="text-primary-600 font-medium">Blue</span> = Scenario Forecast · 
                  <span className="text-gray-400 font-medium ml-2">Gray</span> = Baseline
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
                    <p className="mt-2 text-sm text-gray-500">Failed to load scenario</p>
                    <p className="text-xs text-gray-400 mt-1">{error.message}</p>
                  </div>
                </div>
              ) : !scenarioData ? (
                <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-center">
                    <svg className="mx-auto w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="mt-3 text-sm font-medium text-gray-700">No scenario data</p>
                    <p className="text-xs text-gray-500 mt-1">Adjust parameters and click &quot;Run Scenario&quot;</p>
                  </div>
                </div>
              ) : (
                <LineChartLoadCurve
                  data={chartData}
                  height={400}
                  showActual={true}
                  showPeakMarkers={false}
                />
              )}
            </Card>

            {/* Delta Summary */}
            {scenarioData && (
              <Card className="p-8 fade-in" style={{ animationDelay: '0.15s' }}>
                <h2 className="text-lg font-semibold text-gray-900 tracking-tight mb-6">Impact Summary</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* Delta Peak MW */}
                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                      Peak Change
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-2xl font-bold tracking-tight ${
                        scenarioData.delta.peak_mw > 0 ? 'text-error-600' : 
                        scenarioData.delta.peak_mw < 0 ? 'text-success-600' : 
                        'text-gray-900'
                      }`}>
                        {scenarioData.delta.peak_mw > 0 ? '+' : ''}
                        {scenarioData.delta.peak_mw}
                      </span>
                      <span className="text-sm text-gray-600">MW</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {scenarioData.delta.avg_change_percent > 0 ? '+' : ''}
                      {scenarioData.delta.avg_change_percent}% avg change
                    </div>
                  </div>

                  {/* Delta Peak Time */}
                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                      Peak Time Shift
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-2xl font-bold tracking-tight ${
                        scenarioData.delta.peak_time_shift !== 0 ? 'text-warning-600' : 'text-gray-900'
                      }`}>
                        {scenarioData.delta.peak_time_shift > 0 ? '+' : ''}
                        {scenarioData.delta.peak_time_shift}
                      </span>
                      <span className="text-sm text-gray-600">hrs</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {scenarioData.delta.peak_time_shift === 0 ? 'No shift' : 
                       scenarioData.delta.peak_time_shift > 0 ? 'Later peak' : 'Earlier peak'}
                    </div>
                  </div>

                  {/* Second Peak Delta */}
                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                      2nd Peak Change
                    </div>
                    <div className="flex items-baseline gap-2">
                      {scenarioData.delta.second_peak_mw !== undefined ? (
                        <>
                          <span className={`text-2xl font-bold tracking-tight ${
                            scenarioData.delta.second_peak_mw > 0 ? 'text-error-600' : 
                            scenarioData.delta.second_peak_mw < 0 ? 'text-success-600' : 
                            'text-gray-900'
                          }`}>
                            {scenarioData.delta.second_peak_mw > 0 ? '+' : ''}
                            {scenarioData.delta.second_peak_mw}
                          </span>
                          <span className="text-sm text-gray-600">MW</span>
                        </>
                      ) : (
                        <span className="text-2xl font-bold text-gray-400">—</span>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {scenarioData.scenario_peaks[1]?.time || 'N/A'}
                    </div>
                  </div>

                  {/* Scenario Peaks */}
                  <div className="bg-primary-50 rounded-lg p-5 border border-primary-200">
                    <div className="text-xs font-medium text-primary-700 uppercase tracking-wider mb-3">
                      Scenario Peaks
                    </div>
                    <div className="space-y-1">
                      {scenarioData.scenario_peaks.map((peak, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{peak.time}</span>
                          <span className="font-semibold text-primary-900">
                            {peak.demand_mw.toLocaleString()} MW
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Applied Parameters Summary */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Applied Parameters</h3>
                  <div className="flex flex-wrap gap-2">
                    {scenarioData.parameters.temperature_delta !== 0 && (
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                        Temp: {scenarioData.parameters.temperature_delta > 0 ? '+' : ''}
                        {scenarioData.parameters.temperature_delta}°C
                      </span>
                    )}
                    {scenarioData.parameters.humidity_delta !== 0 && (
                      <span className="px-3 py-1 bg-cyan-50 text-cyan-700 text-xs font-medium rounded-full border border-cyan-200">
                        Humidity: {scenarioData.parameters.humidity_delta > 0 ? '+' : ''}
                        {scenarioData.parameters.humidity_delta}%
                      </span>
                    )}
                    {scenarioData.parameters.wind_speed_delta !== 0 && (
                      <span className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-full border border-teal-200">
                        Wind: {scenarioData.parameters.wind_speed_delta > 0 ? '+' : ''}
                        {scenarioData.parameters.wind_speed_delta} m/s
                      </span>
                    )}
                    {scenarioData.parameters.is_weekend && (
                      <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full border border-purple-200">
                        Weekend Pattern
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
