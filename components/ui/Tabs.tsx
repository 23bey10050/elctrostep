'use client'
import React from 'react'
import { cn } from '../../lib/utils'

export function Tabs({ children }: { children: React.ReactNode }) {
  return <div className="border-b border-gray-100">{children}</div>
}

export function TabList({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-2">{children}</div>
}

export function Tab({ children, active = false }: { children: React.ReactNode; active?: boolean }) {
  return (
    <button className={cn('px-3 py-2 text-sm rounded-md', active ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-50')}>
      {children}
    </button>
  )
}
