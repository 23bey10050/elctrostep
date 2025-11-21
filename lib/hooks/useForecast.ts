'use client'
import { useState, useEffect } from 'react'
import type { ForecastResponse, ForecastRequest } from '../api/types'
import { getForecast } from '../api/forecast'

type UseForecastOptions = {
  date: string
  horizon: ForecastRequest['horizon']
  area: string
  weatherOverride?: ForecastRequest['weather_override']
  enabled?: boolean
}

type UseForecastResult = {
  data: ForecastResponse | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * React hook for fetching load forecast data
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useForecast({
 *   date: '2025-11-20',
 *   horizon: '24h',
 *   area: 'all'
 * })
 * ```
 */
export function useForecast(options: UseForecastOptions): UseForecastResult {
  const { date, horizon, area, weatherOverride, enabled = true } = options
  
  const [data, setData] = useState<ForecastResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)
  const [refetchKey, setRefetchKey] = useState(0)

  useEffect(() => {
    if (!enabled) return

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const request: ForecastRequest = {
          date,
          horizon,
          area,
          weather_override: weatherOverride,
        }

        const response = await getForecast(request)
        setData(response)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [date, horizon, area, weatherOverride, enabled, refetchKey])

  const refetch = () => setRefetchKey(prev => prev + 1)

  return { data, isLoading, error, refetch }
}
