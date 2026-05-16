import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { formatDate, statusColor, formatStatus } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import DefectStatusUpdater from '@/components/defects/DefectStatusUpdater'
import EvidenceUploader from '@/components/EvidenceUploader'

export default async function DefectDetailPage({
  params,
}: {
  params: Promise<{ id: string; defectId: string }>
}) {
  const { id, defectId } = await params
  const session = await getSession()
  if (!session) return null

  const defect = await prisma.defect.findUnique({
    where: { id: defectId },
    include: {
      vessel: { select: { name: true } },
      equipment: { select: { name: true } },
      raisedBy: { select: { name: true, position: true } },
      evidence: { orderBy: { uploadedAt: 'desc' } },
      wcrs: { select: { id: true, reportNumber: true, title: true, status: true } },
    },
  })

  if (!defect) notFound()

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6 space-y-4">
      <div>
        <Link href={`/vessels/${id}/defects`} className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-2">
          <ArrowLeft className="w-4 h-4" /> Defects
        </Link>
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-xl font-bold text-gray-900">{defect.title}</h1>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${statusColor(defect.severity)}`}>
            {formatStatus(defect.severity)}
          </span>
        </div>
        <span className={`mt-1 inline-block text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColor(defect.status)}`}>
          {formatStatus(defect.status)}
        </span>
      </div>

      {session.role !== 'VIEWER' && (
        <DefectStatusUpdater defectId={defectId} vesselId={id} currentStatus={defect.status} currentAction={defect.actionTaken ?? ''} />
      )}

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Equipment', value: defect.equipment?.name ?? 'General' },
          { label: 'Location', value: defect.location ?? '—' },
          { label: 'Raised By', value: defect.raisedBy?.name ?? 'Unknown' },
          { label: 'Raised On', value: formatDate(defect.raisedAt) },
          defect.closedAt ? { label: 'Closed On', value: formatDate(defect.closedAt) } : null,
        ].filter(Boolean).map((f) => f && (
          <div key={f.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
            <p className="text-xs text-gray-400">{f.label}</p>
            <p className="text-sm font-medium text-gray-900 mt-0.5">{f.value}</p>
          </div>
        ))}
      </div>

      {defect.description && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{defect.description}</p>
        </div>
      )}

      {defect.actionTaken && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Action Taken</h3>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{defect.actionTaken}</p>
        </div>
      )}

      {defect.remarks && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Remarks</h3>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{defect.remarks}</p>
        </div>
      )}

      {/* Evidence */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">Evidence & Photos</h3>
          <span className="text-xs text-gray-400">{defect.evidence.length} file{defect.evidence.length !== 1 ? 's' : ''}</span>
        </div>
        {session.role !== 'VIEWER' && (
          <div className="p-4 border-b border-gray-50">
            <EvidenceUploader defectId={defectId} />
          </div>
        )}
        <div className="divide-y divide-gray-50">
          {defect.evidence.map((e) => (
            <a key={e.id} href={e.fileUrl} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-sm">
                {e.fileType?.includes('image') ? '🖼' : '📄'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{e.fileName}</p>
                <p className="text-xs text-gray-400">{formatDate(e.uploadedAt)}</p>
              </div>
            </a>
          ))}
          {defect.evidence.length === 0 && (
            <p className="px-4 py-6 text-sm text-gray-400 text-center">No evidence yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
