import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { formatDate, statusColor, formatStatus } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, FileText, Plus } from 'lucide-react'
import NewWCRModal from '@/components/reports/NewWCRModal'

export default async function VesselReportsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session) return null

  const vessel = await prisma.vessel.findUnique({ where: { id }, select: { id: true, name: true } })
  if (!vessel) notFound()

  const reports = await prisma.workCompletionReport.findMany({
    where: { vesselId: id },
    include: {
      task: { select: { title: true } },
      defect: { select: { title: true } },
      createdBy: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6 space-y-4">
      <div>
        <Link href={`/vessels/${id}`} className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-2">
          <ArrowLeft className="w-4 h-4" /> {vessel.name}
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Work Completion Reports</h1>
          {session.role !== 'VIEWER' && <NewWCRModal vesselId={id} />}
        </div>
      </div>

      <div className="space-y-3">
        {reports.map((r) => (
          <Link key={r.id} href={`/vessels/${id}/reports/${r.id}`}
                className="block bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-mono text-blue-600">{r.reportNumber}</p>
                <h3 className="font-semibold text-gray-900 text-sm mt-0.5">{r.title}</h3>
                {(r.task || r.defect) && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {r.task?.title ?? r.defect?.title}
                  </p>
                )}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusColor(r.status)}`}>
                {formatStatus(r.status)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-gray-400">By {r.createdBy?.name ?? 'Unknown'}</p>
              <p className="text-xs text-gray-400">{formatDate(r.createdAt)}</p>
            </div>
          </Link>
        ))}

        {reports.length === 0 && (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No reports yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
