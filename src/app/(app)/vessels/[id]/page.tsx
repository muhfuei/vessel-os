import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { notFound } from 'next/navigation'
import VesselDetailClient from './VesselDetailClient'

export default async function VesselDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session) return null

  const vessel = await prisma.vessel.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          tasks: { where: { status: { notIn: ['COMPLETED', 'VERIFIED', 'CLOSED', 'CANCELLED'] } } },
          defects: { where: { status: { notIn: ['VERIFIED', 'CLOSED'] } } },
          equipment: true,
          documents: true,
          certificates: true,
        },
      },
    },
  })

  if (!vessel) notFound()

  return <VesselDetailClient vessel={vessel} isAdmin={session.role === 'ADMIN'} />
}
