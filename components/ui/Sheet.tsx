'use client'
import React from 'react'

export default function Sheet({ open, onOpenChange, children }: { open: boolean; onOpenChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <div>
      {open && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => onOpenChange(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-lg p-4 overflow-auto">
            <div className="flex justify-end">
              <button onClick={() => onOpenChange(false)} className="text-gray-500">Close</button>
            </div>
            {children}
          </aside>
        </div>
      )}
    </div>
  )
}
