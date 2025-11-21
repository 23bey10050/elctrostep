// TypeScript types for forecast API
export type ForecastPoint = {
  time: string
  demand_mw: number
  temperature?: number
  confidence?: number
}

export type PeakInfo = {
  time: string
  demand_mw: number
  type: 'primary' | 'secondary'
  window: string
}

export type ForecastResponse = {
  points: ForecastPoint[]
  peaks: PeakInfo[]
  metadata: {
    forecast_date: string
    area: string
    horizon: string
    generated_at: string
    model_version: string
  }
  statistics: {
    peak_demand: number
    min_demand: number
    avg_demand: number
    load_factor: number
    peak_to_valley_ratio: number
  }
}

export type ForecastRequest = {
  date: string
  horizon: '24h' | '7d' | '30d'
  area: string
  weather_override?: {
    temperature?: number
    humidity?: number
    use_actual?: boolean
  }
}
