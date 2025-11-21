'use client'
import React from 'react'
import { cn } from '../../lib/utils'

export default function Card({ 
  children, 
  className = '', 
  style,
  hover = false 
}: { 
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  hover?: boolean
}) {
  return (
    <div 
      className={cn(
        'bg-white rounded-lg border border-gray-200 shadow-sm',
        hover && 'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
        className
      )} 
      style={style}
    >
      {children}
    </div>
  )
}
