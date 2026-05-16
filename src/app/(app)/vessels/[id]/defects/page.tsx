import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { formatDate, statusColor, formatStatus } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, ChevronRight } from 'lucide-react'
import NewDefectModal from '@/components/defects/NewDefectModal'

export default async function VesselDefectsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getSession()
  if (!session) return null

  const vessel = await prisma.vessel.findUnique({ where: { id }, select: { id: true, name: true } })
  if (!vessel) notFound()

  const defects = await prisma.defect.findMany({
    where: { vesselId: id },
    include: {
      equipment: { select: { name: true } },
      raisedBy: { select: { name: true } },
    },
    orderBy: [{ severity: 'desc' }, { raisedAt: 'desc' }],
  })

  const equipment = await prisma.equipment.findMany({ where: { vesselId: id }, select: { id: true, name: true } })

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6 space-y-4">
      <div>
        <Link href={`/vessels/${id}`} className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-2">
          <ArrowLeft className="w-4 h-4" /> {vessel.name}
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Defects</h1>
          {session.role !== 'VIEWER' && <NewDefectModal vesselId={id} equipment={equipment} />}
        </div>
      </div>

      <div className="space-y-3">
        {defects.map((d) => (
          <Link
            key={d.id}
            href={`/vessels/${id}/defects/${d.id}`}
            className="block bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                    d.severity === 'CRITICAL' ? 'bg-red-500' : 'bg-yellow-400'
                  }`} />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm">{d.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {d.equipment?.name ?? 'General'} · Raised by {d.raisedBy?.name ?? 'Unknown'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(d.status)}`}>
                    {formatStatus(d.status)}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(d.severity)}`}>
                    {formatStatus(d.severity)}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{formatDate(d.raisedAt)}</p>
              </div>
            </div>
          </Link>
        ))}

        {defects.length === 0 && (
          <div className="text-center py-16">
            <AlertTriangle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No defects reported</p>
          </div>
        )}
      </div>
    </div>
  )
}
