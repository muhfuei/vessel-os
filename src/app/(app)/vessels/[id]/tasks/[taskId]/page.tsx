import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { formatDate, statusColor, formatStatus } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import TaskStatusUpdater from '@/components/tasks/TaskStatusUpdater'
import EvidenceUploader from '@/components/EvidenceUploader'

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string; taskId: string }>
}) {
  const { id, taskId } = await params
  const session = await getSession()
  if (!session) return null

  const task = await prisma.maintenanceTask.findUnique({
    where: { id: taskId },
    include: {
      vessel: { select: { name: true } },
      equipment: { select: { name: true } },
      assignedTo: { select: { name: true, position: true } },
      evidence: { orderBy: { uploadedAt: 'desc' } },
      wcrs: { select: { id: true, reportNumber: true, title: true, status: true, createdAt: true } },
    },
  })

  if (!task) notFound()

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6 space-y-4">
      <div>
        <Link href={`/vessels/${id}/tasks`} className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-2">
          <ArrowLeft className="w-4 h-4" /> Maintenance
        </Link>
        <div className="flex items-start justify-between gap-2">
          <div>
            {task.taskCode && <span className="text-xs font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{task.taskCode}</span>}
            <h1 className="text-xl font-bold text-gray-900 mt-1">{task.title}</h1>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${statusColor(task.status)}`}>
            {formatStatus(task.status)}
          </span>
        </div>
      </div>

      {/* Status updater */}
      {session.role !== 'VIEWER' && (
        <TaskStatusUpdater taskId={taskId} vesselId={id} currentStatus={task.status} />
      )}

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-3">
        <InfoCard label="Equipment" value={task.equipment?.name ?? 'General'} />
        <InfoCard label="Assigned To" value={task.assignedTo?.name ?? 'Unassigned'} />
        <InfoCard label="Priority" value={formatStatus(task.priority)} />
        <InfoCard label="Due Date" value={formatDate(task.dueDate)} />
        {task.dueHours && <InfoCard label="Due Hours" value={`${task.dueHours} hrs`} />}
        {task.completedAt && <InfoCard label="Completed" value={formatDate(task.completedAt)} />}
      </div>

      {/* Description */}
      {task.description && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{task.description}</p>
        </div>
      )}

      {/* Notes */}
      {task.notes && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Notes</h3>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{task.notes}</p>
        </div>
      )}

      {/* Evidence */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">Evidence & Photos</h3>
          <span className="text-xs text-gray-400">{task.evidence.length} file{task.evidence.length !== 1 ? 's' : ''}</span>
        </div>
        {session.role !== 'VIEWER' && (
          <div className="p-4 border-b border-gray-50">
            <EvidenceUploader taskId={taskId} />
          </div>
        )}
        <div className="divide-y divide-gray-50">
          {task.evidence.map((e) => (
            <a key={e.id} href={e.fileUrl} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-xs font-medium text-blue-600">
                {e.fileType?.includes('image') ? '🖼' : '📄'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{e.fileName}</p>
                <p className="text-xs text-gray-400">{formatDate(e.uploadedAt)}</p>
              </div>
            </a>
          ))}
          {task.evidence.length === 0 && (
            <p className="px-4 py-6 text-sm text-gray-400 text-center">No evidence uploaded yet</p>
          )}
        </div>
      </div>

      {/* WCRs */}
      {task.wcrs.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Work Completion Reports</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {task.wcrs.map((w) => (
              <Link key={w.id} href={`/vessels/${id}/reports/${w.id}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">{w.reportNumber}</p>
                  <p className="text-xs text-gray-400">{w.title}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(w.status)}`}>
                  {formatStatus(w.status)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-900 mt-0.5">{value}</p>
    </div>
  )
}
