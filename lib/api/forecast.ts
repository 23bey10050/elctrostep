import type { ForecastRequest, ForecastResponse } from './types'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || ''

/**
 * Fetch load forecast from the backend API
 * 
 * @param request - Forecast request parameters
 * @returns Promise resolving to forecast response with demand projections and peak information
 * 
 * @example
 * ```typescript
 * const forecast = await getForecast({
 *   date: '2025-11-20',
 *   horizon: '24h',
 *   area: 'all',
 *   weather_override: { temperature: 35 }
 * })
 * ```
 */
export async function getForecast(request: ForecastRequest): Promise<ForecastResponse> {
  try {
    const response = await fetch(`${API_BASE}/api/forecast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }))
      throw new Error(error.message || `API request failed with status ${response.status}`)
    }

    const data: ForecastResponse = await response.json()
    return data
  } catch (error) {
    console.error('Forecast API error:', error)
    throw error
  }
}

/**
 * Fetch historical actual load data for comparison
 * 
 * @param date - Date for historical data (YYYY-MM-DD)
 * @param area - Geographic area identifier
 * @returns Promise resolving to historical load points
 */
export async function getHistoricalLoad(date: string, area: string): Promise<ForecastResponse> {
  try {
    const response = await fetch(`${API_BASE}/api/historical?date=${date}&area=${area}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch historical data: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Historical data API error:', error)
    throw error
  }
}

/**
 * Get available forecast scenarios for comparison
 * 
 * @param date - Forecast date
 * @param area - Geographic area
 * @returns Promise resolving to multiple scenario forecasts
 */
export async function getScenarios(date: string, area: string) {
  try {
    const response = await fetch(`${API_BASE}/api/scenarios?date=${date}&area=${area}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch scenarios: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Scenarios API error:', error)
    throw error
  }
}
