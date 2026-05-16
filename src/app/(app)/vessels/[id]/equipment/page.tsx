import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { formatStatus, statusColor } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, Cog, ChevronRight } from 'lucide-react'
import NewEquipmentModal from '@/components/equipment/NewEquipmentModal'

export default async function VesselEquipmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session) return null

  const vessel = await prisma.vessel.findUnique({ where: { id }, select: { id: true, name: true } })
  if (!vessel) notFound()

  const equipment = await prisma.equipment.findMany({
    where: { vesselId: id },
    include: {
      _count: {
        select: {
          tasks: { where: { status: { notIn: ['COMPLETED', 'VERIFIED', 'CLOSED', 'CANCELLED'] } } },
          defects: { where: { status: { notIn: ['VERIFIED', 'CLOSED'] } } },
        },
      },
    },
    orderBy: [{ system: 'asc' }, { name: 'asc' }],
  })

  const grouped = equipment.reduce<Record<string, typeof equipment>>((acc, e) => {
    const key = e.system ?? 'General'
    if (!acc[key]) acc[key] = []
    acc[key].push(e)
    return acc
  }, {})

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6 space-y-4">
      <div>
        <Link href={`/vessels/${id}`} className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-2">
          <ArrowLeft className="w-4 h-4" /> {vessel.name}
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Equipment</h1>
          {session.role !== 'VIEWER' && <NewEquipmentModal vesselId={id} />}
        </div>
      </div>

      {Object.entries(grouped).map(([system, items]) => (
        <div key={system} className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50 rounded-t-xl">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{system}</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {items.map((e) => (
              <div key={e.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Cog className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{e.name}</p>
                  <p className="text-xs text-gray-400">
                    {[e.manufacturer, e.model, e.serialNumber].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(e.status)}`}>
                    {formatStatus(e.status)}
                  </span>
                  <div className="flex gap-2 mt-1 justify-end">
                    {e._count.tasks > 0 && <span className="text-xs text-orange-500">{e._count.tasks} tasks</span>}
                    {e._count.defects > 0 && <span className="text-xs text-red-500">{e._count.defects} defects</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {equipment.length === 0 && (
        <div className="text-center py-16">
          <Cog className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No equipment added</p>
        </div>
      )}
    </div>
  )
}
