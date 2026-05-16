import { getSession, getUserVesselIds } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatDate, statusColor, formatStatus } from '@/lib/utils'
import Link from 'next/link'
import { Ship, Plus, ChevronRight } from 'lucide-react'
import NewVesselModal from '@/components/vessels/NewVesselModal'

export default async function VesselsPage() {
  const session = await getSession()
  if (!session) return null

  const vesselIds =
    session.role === 'ADMIN'
      ? undefined
      : await getUserVesselIds(session.id)

  const vessels = await prisma.vessel.findMany({
    where: {
      companyId: session.companyId,
      ...(vesselIds ? { id: { in: vesselIds } } : {}),
    },
    include: {
      _count: {
        select: {
          tasks: { where: { status: { notIn: ['COMPLETED', 'VERIFIED', 'CLOSED', 'CANCELLED'] } } },
          defects: { where: { status: { notIn: ['VERIFIED', 'CLOSED'] } } },
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Vessels</h1>
          <p className="text-sm text-gray-500">{vessels.length} vessel{vessels.length !== 1 ? 's' : ''}</p>
        </div>
        {session.role !== 'VIEWER' && <NewVesselModal />}
      </div>

      <div className="space-y-3">
        {vessels.map((v) => (
          <Link
            key={v.id}
            href={`/vessels/${v.id}`}
            className="block bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Ship className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{v.name}</h3>
                    <p className="text-xs text-gray-400">{formatStatus(v.vesselType)} · {v.flag ?? 'No flag'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(v.status)}`}>
                    {formatStatus(v.status)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>

              <div className="mt-3 flex gap-4">
                {v.imoNumber && (
                  <div className="text-xs text-gray-400">IMO: <span className="text-gray-700 font-medium">{v.imoNumber}</span></div>
                )}
                {v.classSociety && (
                  <div className="text-xs text-gray-400">Class: <span className="text-gray-700 font-medium">{v.classSociety}</span></div>
                )}
              </div>

              <div className="mt-3 flex gap-3">
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                  <span className="text-gray-500">{v._count.tasks} open tasks</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <div className={`w-2 h-2 rounded-full ${v._count.defects > 0 ? 'bg-red-400' : 'bg-gray-200'}`}></div>
                  <span className="text-gray-500">{v._count.defects} defects</span>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {vessels.length === 0 && (
          <div className="text-center py-16">
            <Ship className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No vessels yet</p>
            <p className="text-gray-300 text-sm">Add your first vessel to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}
