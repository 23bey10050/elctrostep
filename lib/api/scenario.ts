import { API_BASE_URL } from './index'

export interface ScenarioRequest {
  date: string
  area: string
  baseline_horizon?: '24h' | '7d'
  temperature_delta?: number
  humidity_delta?: number
  wind_speed_delta?: number
  is_weekend?: boolean
}

export interface ForecastPoint {
  time: string
  forecast: number
  baseline: number
  temperature?: number
}

export interface Peak {
  time: string
  demand_mw: number
  type: 'primary' | 'secondary'
  window: string
}

export interface ScenarioResponse {
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

export async function getScenarioForecast(
  request: ScenarioRequest
): Promise<ScenarioResponse> {
  const response = await fetch(`${API_BASE_URL}/scenario-forecast`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`Scenario forecast failed: ${response.statusText}`)
  }

  return response.json()
}
