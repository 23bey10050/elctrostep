import './globals.css'
import type { ReactNode } from 'react'
import DashboardShell from '../components/dashboard/DashboardShell'

export const metadata = {
  title: 'Delhi Load Forecasting AI',
  description: 'Enterprise dashboard for load forecasting',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <DashboardShell>{children}</DashboardShell>
      </body>
    </html>
  )
}
