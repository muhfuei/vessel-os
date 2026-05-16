import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { formatDate, statusColor, formatStatus } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import WCRStatusUpdater from '@/components/reports/WCRStatusUpdater'
import EvidenceUploader from '@/components/EvidenceUploader'

export default async function WCRDetailPage({
  params,
}: {
  params: Promise<{ id: string; reportId: string }>
}) {
  const { id, reportId } = await params
  const session = await getSession()
  if (!session) return null

  const report = await prisma.workCompletionReport.findUnique({
    where: { id: reportId },
    include: {
      vessel: { select: { name: true } },
      task: { select: { title: true } },
      defect: { select: { title: true } },
      createdBy: { select: { name: true, position: true } },
      evidence: { orderBy: { uploadedAt: 'desc' } },
    },
  })

  if (!report) notFound()

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6 space-y-4">
      <div>
        <Link href={`/vessels/${id}/reports`} className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-2">
          <ArrowLeft className="w-4 h-4" /> Reports
        </Link>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-mono text-blue-600">{report.reportNumber}</p>
            <h1 className="text-xl font-bold text-gray-900 mt-0.5">{report.title}</h1>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${statusColor(report.status)}`}>
            {formatStatus(report.status)}
          </span>
        </div>
      </div>

      {session.role !== 'VIEWER' && (
        <WCRStatusUpdater wcrId={reportId} vesselId={id} currentStatus={report.status} />
      )}

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Vessel', value: report.vessel.name },
          { label: 'Completed Date', value: formatDate(report.completedDate) },
          { label: 'Prepared By', value: report.createdBy?.name ?? '—' },
          { label: 'Verified Date', value: formatDate(report.verifiedDate) },
        ].map((f) => (
          <div key={f.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
            <p className="text-xs text-gray-400">{f.label}</p>
            <p className="text-sm font-medium text-gray-900 mt-0.5">{f.value}</p>
          </div>
        ))}
      </div>

      {(report.task || report.defect) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-400">{report.task ? 'Linked Task' : 'Linked Defect'}</p>
          <p className="text-sm font-medium text-gray-900 mt-0.5">{report.task?.title ?? report.defect?.title}</p>
        </div>
      )}

      {report.workDone && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Work Done</h3>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{report.workDone}</p>
        </div>
      )}

      {report.remarks && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Remarks</h3>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{report.remarks}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">Evidence & Attachments</h3>
          <span className="text-xs text-gray-400">{report.evidence.length} file{report.evidence.length !== 1 ? 's' : ''}</span>
        </div>
        {session.role !== 'VIEWER' && (
          <div className="p-4 border-b border-gray-50">
            <EvidenceUploader wcrId={reportId} />
          </div>
        )}
        <div className="divide-y divide-gray-50">
          {report.evidence.map((e) => (
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
          {report.evidence.length === 0 && (
            <p className="px-4 py-6 text-sm text-gray-400 text-center">No attachments yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
