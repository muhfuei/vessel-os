import { getSession, getUserVesselIds } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatDate, statusColor, formatStatus, urgencyClass, urgencyLabel, daysUntil } from '@/lib/utils'
import Link from 'next/link'
import { Wrench } from 'lucide-react'

export default async function AllTasksPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = 'ALL' } = await searchParams
  const session = await getSession()
  if (!session) return null

  const vesselIds =
    session.role === 'ADMIN'
      ? (await prisma.vessel.findMany({ where: { companyId: session.companyId! }, select: { id: true } })).map((v) => v.id)
      : await getUserVesselIds(session.id)

  const now = new Date()
  const where: Record<string, unknown> = { vesselId: { in: vesselIds } }
  if (status === 'OVERDUE') {
    where.dueDate = { lt: now }
    where.status = { notIn: ['COMPLETED', 'VERIFIED', 'CLOSED', 'CANCELLED'] }
  } else if (status !== 'ALL') {
    where.status = status
  }

  const tasks = await prisma.maintenanceTask.findMany({
    where,
    include: {
      vessel: { select: { id: true, name: true } },
      equipment: { select: { name: true } },
      assignedTo: { select: { name: true } },
    },
    orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    take: 100,
  })

  const STATUS_TABS = ['ALL', 'PENDING', 'IN_PROGRESS', 'WAITING_MATERIAL', 'COMPLETED', 'OVERDUE']

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6 space-y-4">
      <h1 className="text-xl font-bold text-gray-900">All Maintenance Tasks</h1>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {STATUS_TABS.map((s) => (
          <Link key={s} href={`/tasks?status=${s}`}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  status === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 border border-gray-200'
                }`}>
            {s === 'ALL' ? 'All' : s === 'WAITING_MATERIAL' ? 'Waiting' : formatStatus(s)}
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        {tasks.map((t) => {
          const days = daysUntil(t.dueDate)
          return (
            <Link key={t.id} href={`/vessels/${t.vessel.id}/tasks/${t.id}`}
                  className="block bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm">{t.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{t.vessel.name} · {t.equipment?.name ?? 'General'}</p>
                </div>
                {t.dueDate && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${urgencyClass(days)}`}>
                    {days !== null && days < 0 ? 'Overdue' : urgencyLabel(days)}
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(t.status)}`}>
                  {formatStatus(t.status)}
                </span>
                <p className="text-xs text-gray-400">{formatDate(t.dueDate)}</p>
              </div>
            </Link>
          )
        })}
        {tasks.length === 0 && (
          <div className="text-center py-16">
            <Wrench className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No tasks found</p>
          </div>
        )}
      </div>
    </div>
  )
}
