'use client'
import React from 'react'

export default function Separator({ className = '' }: { className?: string }) {
  return <hr className={`border-t border-gray-100 ${className}`} />
}
