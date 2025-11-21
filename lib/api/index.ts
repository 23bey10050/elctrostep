/**
 * Core API utilities and exports
 * 
 * Re-export all API client functions and types for easy imports
 */

export const API_BASE_URL = '/api'

export * from './forecast'
export * from './types'
export * from './scenario'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || ''

/**
 * Generic API fetch utility
 * @deprecated Use specific API functions like getForecast() instead
 */
export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint}`
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })
  if (!res.ok) {
    throw new Error(`API request failed with status ${res.status}`)
  }
  return res.json()
}
