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
    // Task / defect workflow
    PENDING:          'bg-slate-100 text-slate-600',
    IN_PROGRESS:      'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    WAITING_MATERIAL: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    WAITING_SERVICE:  'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    WAITING_APPROVAL: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
    COMPLETED:        'bg-green-50 text-green-700 ring-1 ring-green-200',
    VERIFIED:         'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    CLOSED:           'bg-slate-100 text-slate-500',
    CANCELLED:        'bg-slate-50 text-slate-400',
    OPEN:             'bg-red-50 text-red-700 ring-1 ring-red-200',
    DRAFT:            'bg-slate-100 text-slate-500',
    SUBMITTED:        'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    // Vessel status
    ACTIVE:           'bg-green-50 text-green-700 ring-1 ring-green-200',
    UNDER_REPAIR:     'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
    DOCKING:          'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    OFF_HIRE:         'bg-slate-100 text-slate-500',
    COLD_STACK:       'bg-slate-100 text-slate-500',
    MOBILIZATION:     'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
    // Certificates
    FULL:             'bg-green-50 text-green-700 ring-1 ring-green-200',
    EXPIRED:          'bg-red-100 text-red-700 ring-1 ring-red-300',
    // Severity — CRITICAL is intentionally stronger than other reds
    CRITICAL:         'bg-red-100 text-red-800 ring-1 ring-red-400 font-semibold',
    NON_CRITICAL:     'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    // Roles
    ADMIN:            'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
    USER:             'bg-blue-50 text-blue-700',
    VIEWER:           'bg-slate-100 text-slate-500',
  }
  return map[status] ?? 'bg-slate-100 text-slate-500'
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
