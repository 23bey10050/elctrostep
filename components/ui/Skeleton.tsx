'use client'
import React from 'react'
import { cn } from '../../lib/utils'

export default function Skeleton({ className = '', variant = 'rectangular' }: { 
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' 
}) {
  return (
    <div className={cn(
      'skeleton bg-gray-100',
      variant === 'text' && 'h-4 rounded',
      variant === 'circular' && 'rounded-full',
      variant === 'rectangular' && 'rounded-md',
      className
    )} />
  )
}
