import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Cog } from 'lucide-react'
import NewEquipmentModal from '@/components/equipment/NewEquipmentModal'
import EquipmentListClient from './EquipmentListClient'

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

      {equipment.length === 0 ? (
        <div className="text-center py-16">
          <Cog className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No equipment added</p>
        </div>
      ) : (
        <EquipmentListClient equipment={equipment} vesselId={id} isAdmin={session.role === 'ADMIN'} />
      )}
    </div>
  )
}
