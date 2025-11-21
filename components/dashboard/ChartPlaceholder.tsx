'use client'
import React from 'react'

type ChartPlaceholderProps = {
  height?: string
}

export default function ChartPlaceholder({ height = '300px' }: ChartPlaceholderProps) {
  return (
    <div 
      className="w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg"
      style={{ height }}
    >
      <div className="text-center">
        <svg 
          className="mx-auto h-12 w-12 text-gray-300" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
          />
        </svg>
        <p className="mt-3 text-sm font-medium text-gray-400">Load Curve Chart</p>
        <p className="mt-1 text-xs text-gray-400">Chart.js / Recharts integration placeholder</p>
      </div>
    </div>
  )
}
