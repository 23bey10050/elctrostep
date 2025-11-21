import { NextRequest, NextResponse } from 'next/server'
import type { ForecastRequest, ForecastResponse, ForecastPoint, PeakInfo } from '../../../lib/api/types'

/**
 * Mock API route for load forecasting
 * POST /api/forecast
 * 
 * This simulates a production ML-based forecasting API with realistic demand patterns
 * for Delhi's power grid, including:
 * - Diurnal patterns with morning and evening peaks
 * - Temperature correlation
 * - Seasonal adjustments
 * - Weekend vs weekday variations
 */
export async function POST(request: NextRequest) {
  try {
    const body: ForecastRequest = await request.json()
    
    const { date, horizon, area, weather_override } = body

    // Validate request
    if (!date || !horizon || !area) {
      return NextResponse.json(
        { error: 'Missing required parameters: date, horizon, area' },
        { status: 400 }
      )
    }

    // Generate forecast based on horizon
    const forecastData = generateForecastData(date, horizon, area, weather_override)

    return NextResponse.json(forecastData, { status: 200 })
  } catch (error) {
    console.error('Forecast API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Generate realistic forecast data with seasonal patterns and daily peaks
 */
function generateForecastData(
  date: string,
  horizon: string,
  area: string,
  weatherOverride?: ForecastRequest['weather_override']
): ForecastResponse {
  const forecastDate = new Date(date)
  const month = forecastDate.getMonth()
  const dayOfWeek = forecastDate.getDay()
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

  // Seasonal adjustment factors (Delhi climate)
  const isSummer = month >= 3 && month <= 8 // April to September
  const isWinter = month === 11 || month === 0 || month === 1 // Dec, Jan, Feb
  const seasonalFactor = isSummer ? 1.15 : isWinter ? 1.08 : 1.0

  // Area-specific base load (MW)
  const areaBaseLoad = getAreaBaseLoad(area)

  // Weekend reduction factor
  const weekendFactor = isWeekend ? 0.88 : 1.0

  let points: ForecastPoint[]

  if (horizon === '24h') {
    points = generate24HourForecast(
      areaBaseLoad,
      seasonalFactor,
      weekendFactor,
      weatherOverride
    )
  } else if (horizon === '7d') {
    points = generate7DayForecast(
      forecastDate,
      areaBaseLoad,
      seasonalFactor
    )
  } else {
    points = generate30DayForecast(
      forecastDate,
      areaBaseLoad,
      seasonalFactor
    )
  }

  // Identify peaks
  const peaks = identifyPeaks(points)

  // Calculate statistics
  const demands = points.map(p => p.demand_mw)
  const peakDemand = Math.max(...demands)
  const minDemand = Math.min(...demands)
  const avgDemand = demands.reduce((a, b) => a + b, 0) / demands.length
  const loadFactor = avgDemand / peakDemand
  const peakToValleyRatio = peakDemand / minDemand

  return {
    points,
    peaks,
    metadata: {
      forecast_date: date,
      area,
      horizon,
      generated_at: new Date().toISOString(),
      model_version: 'v2.4.1-lstm',
    },
    statistics: {
      peak_demand: Math.round(peakDemand),
      min_demand: Math.round(minDemand),
      avg_demand: Math.round(avgDemand),
      load_factor: Math.round(loadFactor * 1000) / 1000,
      peak_to_valley_ratio: Math.round(peakToValleyRatio * 100) / 100,
    },
  }
}

/**
 * Generate 24-hour forecast with realistic diurnal pattern
 */
function generate24HourForecast(
  baseLoad: number,
  seasonalFactor: number,
  weekendFactor: number,
  weatherOverride?: ForecastRequest['weather_override']
): ForecastPoint[] {
  const points: ForecastPoint[] = []
  
  for (let hour = 0; hour < 24; hour++) {
    // Diurnal pattern coefficients (normalized 0-1)
    const hourlyPattern = getDiurnalPattern(hour)
    
    // Base demand with pattern
    const baseDemand = baseLoad * (0.4 + 0.6 * hourlyPattern)
    
    // Apply adjustments
    const adjustedDemand = baseDemand * seasonalFactor * weekendFactor
    
    // Add realistic noise (±3%)
    const noise = (Math.random() - 0.5) * 0.06 * adjustedDemand
    const finalDemand = adjustedDemand + noise
    
    // Temperature correlation
    const baseTemp = 28
    const tempVariation = Math.sin((hour - 6) / 12 * Math.PI) * 8
    const temperature = weatherOverride?.temperature || (baseTemp + tempVariation)
    
    // Confidence decreases with forecast horizon
    const confidence = 0.95 - (hour / 24) * 0.15
    
    points.push({
      time: `${hour.toString().padStart(2, '0')}:00`,
      demand_mw: Math.round(finalDemand),
      temperature: Math.round(temperature * 10) / 10,
      confidence: Math.round(confidence * 100) / 100,
    })
  }
  
  return points
}

/**
 * Generate 7-day forecast with daily peak values
 */
function generate7DayForecast(
  startDate: Date,
  baseLoad: number,
  seasonalFactor: number
): ForecastPoint[] {
  const points: ForecastPoint[] = []
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  
  for (let day = 0; day < 7; day++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + day)
    const dayOfWeek = currentDate.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const weekendFactor = isWeekend ? 0.88 : 1.0
    
    // Daily peak (around 15:00)
    const peakDemand = baseLoad * 1.2 * seasonalFactor * weekendFactor
    const noise = (Math.random() - 0.5) * 0.04 * peakDemand
    
    points.push({
      time: days[day] || currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
      demand_mw: Math.round(peakDemand + noise),
      temperature: 28 + Math.random() * 6,
      confidence: 0.85 - (day / 7) * 0.1,
    })
  }
  
  return points
}

/**
 * Generate 30-day forecast
 */
function generate30DayForecast(
  startDate: Date,
  baseLoad: number,
  seasonalFactor: number
): ForecastPoint[] {
  const points: ForecastPoint[] = []
  
  for (let day = 0; day < 30; day++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + day)
    const dayOfWeek = currentDate.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const weekendFactor = isWeekend ? 0.88 : 1.0
    
    const peakDemand = baseLoad * 1.2 * seasonalFactor * weekendFactor
    const noise = (Math.random() - 0.5) * 0.06 * peakDemand
    
    points.push({
      time: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      demand_mw: Math.round(peakDemand + noise),
      confidence: 0.75 - (day / 30) * 0.15,
    })
  }
  
  return points
}

/**
 * Realistic diurnal load pattern for Delhi
 * Returns normalized coefficient (0-1) for given hour
 * 
 * Pattern characteristics:
 * - Early morning valley (04:00-05:00): ~0.4
 * - Morning ramp (06:00-09:00): 0.5 → 0.8
 * - Afternoon peak (15:00-16:00): ~1.0
 * - Evening peak (23:00): ~0.95
 */
function getDiurnalPattern(hour: number): number {
  // Two-peak pattern using sinusoidal components
  const morningComponent = 0.3 * Math.sin((hour - 2) / 6 * Math.PI)
  const afternoonComponent = 0.5 * Math.sin((hour - 7) / 8 * Math.PI)
  const eveningComponent = 0.2 * Math.sin((hour + 1) / 12 * Math.PI)
  
  const combined = 0.5 + morningComponent + afternoonComponent + eveningComponent
  
  // Clamp between 0 and 1
  return Math.max(0, Math.min(1, combined))
}

/**
 * Get base load for different areas of Delhi (MW)
 */
function getAreaBaseLoad(area: string): number {
  const baseLoads: Record<string, number> = {
    all: 4800,
    north: 1200,
    south: 1400,
    east: 900,
    west: 800,
    central: 500,
  }
  
  return baseLoads[area] || baseLoads.all
}

/**
 * Identify primary and secondary peaks from forecast points
 */
function identifyPeaks(points: ForecastPoint[]): PeakInfo[] {
  if (points.length === 0) return []
  
  // Find primary peak
  const primaryPeak = points.reduce((max, point) =>
    point.demand_mw > max.demand_mw ? point : max
  , points[0])
  
  // Find secondary peak (>92% of primary, different time window)
  const threshold = primaryPeak.demand_mw * 0.92
  const secondaryPeaks = points
    .filter(p => p.demand_mw >= threshold && p.time !== primaryPeak.time)
    .sort((a, b) => b.demand_mw - a.demand_mw)
  
  const peaks: PeakInfo[] = [
    {
      time: primaryPeak.time,
      demand_mw: primaryPeak.demand_mw,
      type: 'primary',
      window: determineTimeWindow(primaryPeak.time),
    },
  ]
  
  if (secondaryPeaks.length > 0) {
    peaks.push({
      time: secondaryPeaks[0].time,
      demand_mw: secondaryPeaks[0].demand_mw,
      type: 'secondary',
      window: determineTimeWindow(secondaryPeaks[0].time),
    })
  }
  
  return peaks
}

/**
 * Determine time window label (morning/afternoon/evening/night)
 */
function determineTimeWindow(time: string): string {
  const hour = parseInt(time.split(':')[0])
  
  if (hour >= 5 && hour < 12) return 'Morning'
  if (hour >= 12 && hour < 17) return 'Afternoon'
  if (hour >= 17 && hour < 22) return 'Evening'
  return 'Night'
}
