import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function daysUntil(date: Date | string | null | undefined): number | null {
  if (!date) return null
  const diff = new Date(date).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function urgencyClass(days: number | null): string {
  if (days === null) return 'bg-gray-100 text-gray-600'
  if (days < 0) return 'bg-red-100 text-red-700'
  if (days <= 30) return 'bg-orange-100 text-orange-700'
  if (days <= 90) return 'bg-yellow-100 text-yellow-700'
  return 'bg-green-100 text-green-700'
}

export function urgencyLabel(days: number | null): string {
  if (days === null) return 'No date'
  if (days < 0) return 'Overdue'
  if (days === 0) return 'Due today'
  if (days <= 30) return `${days}d`
  return `${days}d`
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'bg-gray-100 text-gray-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    WAITING_MATERIAL: 'bg-yellow-100 text-yellow-800',
    WAITING_SERVICE: 'bg-yellow-100 text-yellow-800',
    WAITING_APPROVAL: 'bg-purple-100 text-purple-700',
    COMPLETED: 'bg-green-100 text-green-700',
    VERIFIED: 'bg-emerald-100 text-emerald-700',
    CLOSED: 'bg-slate-100 text-slate-600',
    CANCELLED: 'bg-red-50 text-red-500',
    OPEN: 'bg-red-100 text-red-700',
    DRAFT: 'bg-gray-100 text-gray-600',
    SUBMITTED: 'bg-blue-100 text-blue-700',
    ACTIVE: 'bg-green-100 text-green-700',
    UNDER_REPAIR: 'bg-orange-100 text-orange-700',
    DOCKING: 'bg-blue-100 text-blue-700',
    OFF_HIRE: 'bg-gray-100 text-gray-600',
    COLD_STACK: 'bg-slate-100 text-slate-600',
    MOBILIZATION: 'bg-purple-100 text-purple-700',
    FULL: 'bg-green-100 text-green-700',
    EXPIRED: 'bg-red-100 text-red-700',
    CRITICAL: 'bg-red-100 text-red-700',
    NON_CRITICAL: 'bg-yellow-100 text-yellow-700',
  }
  return map[status] ?? 'bg-gray-100 text-gray-600'
}

export function formatStatus(status: string): string {
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
