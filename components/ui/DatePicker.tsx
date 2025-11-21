'use client'
import React from 'react'
import { cn } from '../../lib/utils'

export default function DatePicker({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input type="date" {...props} className={cn('rounded-md border border-gray-200 px-3 py-2 text-sm', className)} />
}
