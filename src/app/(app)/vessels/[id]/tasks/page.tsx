import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { formatDate, statusColor, formatStatus, urgencyClass, urgencyLabel, daysUntil } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, Wrench, ChevronRight } from 'lucide-react'
import NewTaskModal from '@/components/tasks/NewTaskModal'

const STATUS_TABS = ['ALL', 'PENDING', 'IN_PROGRESS', 'WAITING_MATERIAL', 'COMPLETED', 'OVERDUE']

export default async function VesselTasksPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ status?: string }>
}) {
  const { id } = await params
  const { status = 'ALL' } = await searchParams
  const session = await getSession()
  if (!session) return null

  const vessel = await prisma.vessel.findUnique({ where: { id }, select: { id: true, name: true } })
  if (!vessel) notFound()

  const now = new Date()
  const where: Record<string, unknown> = { vesselId: id }
  if (status === 'OVERDUE') {
    where.dueDate = { lt: now }
    where.status = { notIn: ['COMPLETED', 'VERIFIED', 'CLOSED', 'CANCELLED'] }
  } else if (status !== 'ALL') {
    where.status = status
  }

  const [tasks, equipment, users, currentUser] = await Promise.all([
    prisma.maintenanceTask.findMany({
      where,
      include: { equipment: { select: { name: true } }, assignedTo: { select: { name: true } } },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    }),
    prisma.equipment.findMany({
      where: { vesselId: id },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.user.findMany({
      where: { companyId: session.companyId, status: 'ACTIVE' },
      select: { id: true, name: true, position: true },
      orderBy: { name: 'asc' },
    }),
    prisma.user.findUnique({
      where: { id: session.id },
      select: { position: true },
    }),
  ])

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6 space-y-4">
      <div>
        <Link href={`/vessels/${id}`} className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-2">
          <ArrowLeft className="w-4 h-4" /> {vessel.name}
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Maintenance</h1>
          {session.role !== 'VIEWER' && (
            <NewTaskModal
              vesselId={id}
              equipment={equipment}
              users={users}
              currentUserRole={session.role}
              currentUserPosition={currentUser?.position ?? null}
            />
          )}
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {STATUS_TABS.map((s) => (
          <Link
            key={s}
            href={`/vessels/${id}/tasks?status=${s}`}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              status === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {s === 'ALL' ? 'All' : s === 'WAITING_MATERIAL' ? 'Waiting' : formatStatus(s)}
          </Link>
        ))}
      </div>

      {/* Task list */}
      <div className="space-y-3">
        {tasks.map((t) => {
          const days = daysUntil(t.dueDate)
          return (
            <Link
              key={t.id}
              href={`/vessels/${id}/tasks/${t.id}`}
              className="block bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {t.taskCode && (
                        <span className="text-xs font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{t.taskCode}</span>
                      )}
                      <h3 className="font-semibold text-gray-900 text-sm">{t.title}</h3>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {t.equipment?.name ?? 'General'} · {t.assignedTo?.name ?? 'Unassigned'}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(t.status)}`}>
                      {formatStatus(t.status)}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(t.priority)}`}>
                      {formatStatus(t.priority)}
                    </span>
                  </div>
                  {t.dueDate && (
                    <div className="text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${urgencyClass(days)}`}>
                        {days !== null && days < 0 ? 'Overdue' : urgencyLabel(days)}
                      </span>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(t.dueDate)}</p>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          )
        })}

        {tasks.length === 0 && (
          <div className="text-center py-16">
            <Wrench className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No tasks</p>
          </div>
        )}
      </div>
    </div>
  )
}
