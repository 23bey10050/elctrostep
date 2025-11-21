import { NextRequest, NextResponse } from 'next/server'

interface ScenarioRequest {
  date: string
  area: string
  baseline_horizon?: '24h' | '7d'
  temperature_delta?: number
  humidity_delta?: number
  wind_speed_delta?: number
  is_weekend?: boolean
}

interface ForecastPoint {
  time: string
  forecast: number
  baseline: number
  temperature?: number
}

interface Peak {
  time: string
  demand_mw: number
  type: 'primary' | 'secondary'
  window: string
}

interface ScenarioResponse {
  baseline: ForecastPoint[]
  scenario: ForecastPoint[]
  baseline_peaks: Peak[]
  scenario_peaks: Peak[]
  delta: {
    peak_mw: number
    peak_time_shift: number
    second_peak_mw?: number
    avg_change_percent: number
  }
  parameters: {
    temperature_delta: number
    humidity_delta: number
    wind_speed_delta: number
    is_weekend: boolean
  }
  metadata: {
    generated_at: string
    model_version: string
    area: string
  }
}

// Helper to generate realistic Delhi load patterns
function getDiurnalPattern(hour: number): number {
  // Two-peak pattern: afternoon (~15:00) and evening (~23:00)
  const morningRise = Math.max(0, Math.sin((hour - 6) * Math.PI / 12) * 0.3)
  const afternoonPeak = Math.exp(-Math.pow((hour - 15) / 3, 2)) * 0.5
  const eveningPeak = Math.exp(-Math.pow((hour - 23) / 2.5, 2)) * 0.6
  return 0.65 + morningRise + afternoonPeak + eveningPeak
}

function generate24HourForecast(
  baseLoad: number,
  date: string,
  tempDelta = 0,
  humidityDelta = 0,
  windDelta = 0,
  isWeekend = false
): ForecastPoint[] {
  const data: ForecastPoint[] = []
  const dateObj = new Date(date)
  const month = dateObj.getMonth()
  const dayOfWeek = dateObj.getDay()
  const actualIsWeekend = isWeekend || dayOfWeek === 0 || dayOfWeek === 6

  // Seasonal multiplier
  let seasonalMultiplier = 1.0
  if (month >= 4 && month <= 8) seasonalMultiplier = 1.15 // Summer
  else if (month >= 11 || month <= 1) seasonalMultiplier = 1.08 // Winter

  // Weekend reduction
  const weekendMultiplier = actualIsWeekend ? 0.88 : 1.0

  // Temperature impact: +1°C ≈ +2% load in summer, +1.5% in winter
  const tempImpact = month >= 4 && month <= 8 
    ? tempDelta * 0.02 
    : tempDelta * 0.015

  // Humidity impact: +10% humidity ≈ +1% load
  const humidityImpact = (humidityDelta / 10) * 0.01

  // Wind impact: +5 m/s wind ≈ -0.5% load (cooling effect)
  const windImpact = -(windDelta / 5) * 0.005

  const totalMultiplier = seasonalMultiplier * weekendMultiplier * 
    (1 + tempImpact + humidityImpact + windImpact)

  for (let hour = 0; hour < 24; hour++) {
    const diurnalFactor = getDiurnalPattern(hour)
    const noise = (Math.random() - 0.5) * 0.05
    const baseTemp = 25 + Math.sin((hour - 14) * Math.PI / 12) * 8 + (month - 5) * 2
    
    const forecast = Math.round(
      baseLoad * diurnalFactor * totalMultiplier * (1 + noise)
    )

    data.push({
      time: `${hour.toString().padStart(2, '0')}:00`,
      forecast,
      baseline: forecast,
      temperature: Math.round((baseTemp + tempDelta) * 10) / 10
    })
  }

  return data
}

function findPeaks(data: ForecastPoint[]): Peak[] {
  const peaks: Peak[] = []
  
  // Find local maxima
  for (let i = 1; i < data.length - 1; i++) {
    if (data[i].forecast > data[i - 1].forecast && 
        data[i].forecast > data[i + 1].forecast) {
      peaks.push({
        time: data[i].time,
        demand_mw: data[i].forecast,
        type: 'primary',
        window: `${data[i - 1].time} - ${data[i + 1].time}`
      })
    }
  }

  // Sort by demand and mark top 2
  peaks.sort((a, b) => b.demand_mw - a.demand_mw)
  if (peaks.length > 0) peaks[0].type = 'primary'
  if (peaks.length > 1) peaks[1].type = 'secondary'

  return peaks.slice(0, 2)
}

export async function POST(request: NextRequest) {
  try {
    const body: ScenarioRequest = await request.json()
    const {
      date,
      area,
      temperature_delta = 0,
      humidity_delta = 0,
      wind_speed_delta = 0,
      is_weekend = false
    } = body

    // Base loads by area (MW)
    const areaBaseLoads: Record<string, number> = {
      'NDMC': 800,
      'NCR': 8000,
      'Delhi': 6500,
      'Gurgaon': 2200,
      'Noida': 1800,
      'Faridabad': 1400,
      'Ghaziabad': 1600
    }

    const baseLoad = areaBaseLoads[area] || 6500

    // Generate baseline (no adjustments)
    const baseline = generate24HourForecast(baseLoad, date, 0, 0, 0, false)

    // Generate scenario (with adjustments)
    const scenario = generate24HourForecast(
      baseLoad,
      date,
      temperature_delta,
      humidity_delta,
      wind_speed_delta,
      is_weekend
    )

    // Update baseline field in scenario to match actual baseline
    scenario.forEach((point, idx) => {
      point.baseline = baseline[idx].forecast
    })

    // Find peaks
    const baselinePeaks = findPeaks(baseline)
    const scenarioPeaks = findPeaks(scenario)

    // Calculate deltas
    const peakDelta = scenarioPeaks[0] 
      ? scenarioPeaks[0].demand_mw - baselinePeaks[0].demand_mw 
      : 0

    const peakTimeShift = scenarioPeaks[0] && baselinePeaks[0]
      ? parseInt(scenarioPeaks[0].time.split(':')[0]) - parseInt(baselinePeaks[0].time.split(':')[0])
      : 0

    const secondPeakDelta = scenarioPeaks[1] && baselinePeaks[1]
      ? scenarioPeaks[1].demand_mw - baselinePeaks[1].demand_mw
      : undefined

    const avgBaselineLoad = baseline.reduce((sum, p) => sum + p.forecast, 0) / baseline.length
    const avgScenarioLoad = scenario.reduce((sum, p) => sum + p.forecast, 0) / scenario.length
    const avgChangePercent = ((avgScenarioLoad - avgBaselineLoad) / avgBaselineLoad) * 100

    const response: ScenarioResponse = {
      baseline: baseline.map(p => ({
        time: p.time,
        forecast: p.baseline,
        baseline: p.baseline,
        temperature: p.temperature
      })),
      scenario,
      baseline_peaks: baselinePeaks,
      scenario_peaks: scenarioPeaks,
      delta: {
        peak_mw: Math.round(peakDelta),
        peak_time_shift: peakTimeShift,
        second_peak_mw: secondPeakDelta ? Math.round(secondPeakDelta) : undefined,
        avg_change_percent: Math.round(avgChangePercent * 10) / 10
      },
      parameters: {
        temperature_delta,
        humidity_delta,
        wind_speed_delta,
        is_weekend
      },
      metadata: {
        generated_at: new Date().toISOString(),
        model_version: 'v2.3.1-scenario',
        area
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Scenario forecast error:', error)
    return NextResponse.json(
      { error: 'Failed to generate scenario forecast' },
      { status: 500 }
    )
  }
}
