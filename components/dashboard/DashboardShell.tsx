'use client'
import React, { useState } from 'react'
import TopNav from './TopNav'
import Sidebar from './Sidebar'
import Sheet from '../ui/Sheet'

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />

      <div className="flex">
        <Sidebar />

        <div className="flex-1">
          <div className="lg:hidden p-4">
            <button
              onClick={() => setOpen(true)}
              className="px-3 py-2 rounded-md bg-white border text-sm"
            >
              Menu
            </button>
            <Sheet open={open} onOpenChange={setOpen}>
              <div className="p-4">
                <Sidebar />
              </div>
            </Sheet>
          </div>

          <div>{children}</div>
        </div>
      </div>
    </div>
  )
}
