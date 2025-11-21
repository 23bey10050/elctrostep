import clsx, { ClassValue } from 'clsx'

export function cn(...classes: ClassValue[]) {
  return clsx(...classes)
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
