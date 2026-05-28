import { getSession, getUserVesselIds } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatDate, statusColor, formatStatus } from '@/lib/utils'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default async function AllDefectsPage({ searchParams }: { searchParams: Promise<{ severity?: string }> }) {
  const { severity = 'ALL' } = await searchParams
  const session = await getSession()
  if (!session) return null

  const vesselIds =
    session.role === 'ADMIN'
      ? (await prisma.vessel.findMany({ where: { companyId: session.companyId! }, select: { id: true } })).map((v) => v.id)
      : await getUserVesselIds(session.id)

  const where: Record<string, unknown> = {
    vesselId: { in: vesselIds },
    status: { notIn: ['CLOSED'] },
  }
  if (severity !== 'ALL') where.severity = severity

  const defects = await prisma.defect.findMany({
    where,
    include: {
      vessel: { select: { id: true, name: true } },
      equipment: { select: { name: true } },
    },
    orderBy: [{ severity: 'desc' }, { raisedAt: 'desc' }],
    take: 100,
  })

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6 space-y-4">
      <h1 className="text-xl font-bold text-gray-900">All Defects</h1>

      <div className="flex gap-2">
        {['ALL', 'CRITICAL', 'NON_CRITICAL'].map((s) => (
          <Link key={s} href={`/defects?severity=${s}`}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  severity === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 border border-gray-200'
                }`}>
            {s === 'ALL' ? 'All' : s === 'NON_CRITICAL' ? 'Non-Critical' : 'Critical'}
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        {defects.map((d) => (
          <Link key={d.id} href={`/vessels/${d.vessel.id}/defects/${d.id}`}
                className="block bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-4">
            <div className="flex items-start gap-3">
              <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${d.severity === 'CRITICAL' ? 'bg-red-500' : 'bg-yellow-400'}`} />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">{d.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{d.vessel.name} · {d.equipment?.name ?? 'General'}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(d.status)}`}>
                    {formatStatus(d.status)}
                  </span>
                  <p className="text-xs text-gray-400">{formatDate(d.raisedAt)}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
        {defects.length === 0 && (
          <div className="text-center py-16">
            <AlertTriangle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No open defects</p>
          </div>
        )}
      </div>
    </div>
  )
}
