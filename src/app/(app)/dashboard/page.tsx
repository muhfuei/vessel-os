import { getSession, getUserVesselIds } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatDate, statusColor, formatStatus } from '@/lib/utils'
import Link from 'next/link'
import { Ship, Wrench, AlertTriangle, FileText, Clock, CheckCircle } from 'lucide-react'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) return null

  const vesselIds =
    session.role === 'ADMIN'
      ? (await prisma.vessel.findMany({ where: { companyId: session.companyId }, select: { id: true } })).map((v) => v.id)
      : await getUserVesselIds(session.id)

  const now = new Date()
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const in90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

  const [vessels, overdueTasks, upcomingTasks, openDefects, criticalDefects, expiringCerts] =
    await Promise.all([
      prisma.vessel.findMany({
        where: { id: { in: vesselIds } },
        select: { id: true, name: true, status: true, vesselType: true },
      }),
      prisma.maintenanceTask.count({
        where: { vesselId: { in: vesselIds }, dueDate: { lt: now }, status: { notIn: ['COMPLETED', 'VERIFIED', 'CLOSED', 'CANCELLED'] } },
      }),
      prisma.maintenanceTask.findMany({
        where: { vesselId: { in: vesselIds }, dueDate: { gte: now, lte: in30 }, status: { notIn: ['COMPLETED', 'VERIFIED', 'CLOSED', 'CANCELLED'] } },
        include: { vessel: { select: { name: true } }, equipment: { select: { name: true } } },
        orderBy: { dueDate: 'asc' },
        take: 5,
      }),
      prisma.defect.count({
        where: { vesselId: { in: vesselIds }, status: { notIn: ['VERIFIED', 'CLOSED'] } },
      }),
      prisma.defect.count({
        where: { vesselId: { in: vesselIds }, severity: 'CRITICAL', status: { notIn: ['VERIFIED', 'CLOSED'] } },
      }),
      prisma.certificate.findMany({
        where: { vesselId: { in: vesselIds }, expiryDate: { gte: now, lte: in90 } },
        include: { vessel: { select: { name: true } } },
        orderBy: { expiryDate: 'asc' },
        take: 5,
      }),
    ])

  const statCards = [
    { label: 'Vessels', value: vessels.length, icon: Ship, color: 'blue', href: '/vessels' },
    { label: 'Overdue Tasks', value: overdueTasks, icon: Clock, color: 'red', href: '/tasks' },
    { label: 'Open Defects', value: openDefects, icon: AlertTriangle, color: 'orange', href: '/defects' },
    { label: 'Critical Defects', value: criticalDefects, icon: AlertTriangle, color: 'red', href: '/defects' },
  ]

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Fleet Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Welcome back, {session.name}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map(({ label, value, icon: Icon, color, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg mb-3 ${
              color === 'blue' ? 'bg-blue-100' : color === 'red' ? 'bg-red-100' : 'bg-orange-100'
            }`}>
              <Icon className={`w-5 h-5 ${
                color === 'blue' ? 'text-blue-600' : color === 'red' ? 'text-red-600' : 'text-orange-600'
              }`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Vessels */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 text-sm">Vessels</h2>
            <Link href="/vessels" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {vessels.slice(0, 5).map((v) => (
              <Link key={v.id} href={`/vessels/${v.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Ship className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{v.name}</p>
                    <p className="text-xs text-gray-400">{formatStatus(v.vesselType)}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(v.status)}`}>
                  {formatStatus(v.status)}
                </span>
              </Link>
            ))}
            {vessels.length === 0 && (
              <p className="px-4 py-6 text-sm text-gray-400 text-center">No vessels yet</p>
            )}
          </div>
        </div>

        {/* Upcoming tasks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 text-sm">Due in 30 Days</h2>
            <Link href="/tasks" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {upcomingTasks.map((t) => {
              const days = t.dueDate ? Math.ceil((new Date(t.dueDate).getTime() - Date.now()) / 86400000) : null
              return (
                <Link key={t.id} href={`/vessels/${t.vesselId}/tasks/${t.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="text-sm font-medium text-gray-900 truncate">{t.title}</p>
                    <p className="text-xs text-gray-400 truncate">{t.vessel.name} · {t.equipment?.name ?? 'General'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      days !== null && days <= 7 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {days !== null ? `${days}d` : '—'}
                    </span>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(t.dueDate)}</p>
                  </div>
                </Link>
              )
            })}
            {upcomingTasks.length === 0 && (
              <p className="px-4 py-6 text-sm text-gray-400 text-center">No tasks due in 30 days</p>
            )}
          </div>
        </div>

        {/* Expiring certificates */}
        {expiringCerts.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 text-sm">Expiring Certificates (90 days)</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {expiringCerts.map((c) => {
                const days = c.expiryDate ? Math.ceil((new Date(c.expiryDate).getTime() - Date.now()) / 86400000) : null
                return (
                  <div key={c.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{c.title}</p>
                      <p className="text-xs text-gray-400">{c.vessel.name} · {c.abbreviation}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        days !== null && days <= 30 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {days !== null ? `${days}d` : '—'}
                      </span>
                      <p className="text-xs text-gray-400 mt-0.5">Exp: {formatDate(c.expiryDate)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
