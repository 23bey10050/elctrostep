'use client'
import React from 'react'
import Link from 'next/link'

export default function TopNav() {
  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 text-primary-600">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect width="24" height="24" rx="6" fill="#178FFF" />
              <path d="M6 12h12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-semibold">Delhi Load Forecasting AI</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <nav className="hidden sm:flex gap-4 text-sm text-gray-700">
            <Link href="/dashboard" className="hover:text-primary-600">Dashboard</Link>
            <Link href="/scenarios" className="hover:text-primary-600">Scenarios</Link>
            <Link href="/historical" className="hover:text-primary-600">Historical View</Link>
          </nav>

          <div className="flex items-center gap-3">
            <button className="text-sm text-gray-600">Sign in</button>
          </div>
        </div>
      </div>
    </header>
  )
}
