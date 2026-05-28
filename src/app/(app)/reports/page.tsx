import { getSession, getUserVesselIds } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatDate, statusColor, formatStatus } from '@/lib/utils'
import Link from 'next/link'
import { FileText } from 'lucide-react'

export default async function AllReportsPage() {
  const session = await getSession()
  if (!session) return null

  const vesselIds =
    session.role === 'ADMIN'
      ? (await prisma.vessel.findMany({ where: { companyId: session.companyId! }, select: { id: true } })).map((v) => v.id)
      : await getUserVesselIds(session.id)

  const reports = await prisma.workCompletionReport.findMany({
    where: { vesselId: { in: vesselIds } },
    include: {
      vessel: { select: { id: true, name: true } },
      createdBy: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6 space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Work Completion Reports</h1>

      <div className="space-y-3">
        {reports.map((r) => (
          <Link key={r.id} href={`/vessels/${r.vessel.id}/reports/${r.id}`}
                className="block bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-mono text-blue-600">{r.reportNumber}</p>
                <h3 className="font-semibold text-gray-900 text-sm mt-0.5">{r.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{r.vessel.name}</p>
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
