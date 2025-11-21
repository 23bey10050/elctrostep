'use client'
import React from 'react'
import { cn } from '../../lib/utils'

type Props = React.InputHTMLAttributes<HTMLInputElement>

export default function Input({ className = '', ...props }: Props) {
  return (
    <input
      {...props}
      className={cn('block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm', className)}
    />
  )
}
