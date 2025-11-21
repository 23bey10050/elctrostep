'use client'
import React from 'react'
import Link from 'next/link'

type MenuItem = {
  title: string
  href: string
}

const MENU: MenuItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Scenarios', href: '/scenarios' },
  { title: 'Historical View', href: '/historical' },
  { title: 'Settings', href: '/settings' },
]

export default function Sidebar({ className = '' }: { className?: string }) {
  return (
    <aside className={`hidden lg:block w-sidebar p-6 bg-white border-r border-gray-100 ${className}`}>
      <div className="flex flex-col h-full">
        <nav className="space-y-1">
          {MENU.map((item) => (
            <Link key={item.href} href={item.href} className="block px-3 py-2 rounded-md text-sm text-gray-800 hover:bg-gray-50">
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="mt-auto text-xs text-gray-500">
          © {new Date().getFullYear()} Delhi Load Forecasting AI
        </div>
      </div>
    </aside>
  )
}
