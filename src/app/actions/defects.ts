'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

async function assertVesselAccess(vesselId: string, userId: string, role: string, companyId: string) {
  if (role === 'ADMIN') {
    const vessel = await prisma.vessel.findFirst({ where: { id: vesselId, companyId } })
    if (!vessel) throw new Error('Vessel not found')
    return
  }
  const access = await prisma.vesselUserAccess.findUnique({
    where: { userId_vesselId: { userId, vesselId } },
  })
  if (!access) throw new Error('You do not have access to this vessel')
}

export async function createDefectAction(formData: FormData) {
  const session = await requireAuth()
  const vesselId = formData.get('vesselId') as string

  await assertVesselAccess(vesselId, session.id, session.role, session.companyId)

  await prisma.defect.create({
    data: {
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || null,
      location: (formData.get('location') as string) || null,
      severity: (formData.get('severity') as string || 'NON_CRITICAL') as never,
      status: 'OPEN',
      vesselId,
      equipmentId: (formData.get('equipmentId') as string) || null,
      raisedById: session.id,
    },
  })

  revalidatePath(`/vessels/${vesselId}/defects`)
}

export async function updateDefectStatusAction(defectId: string, status: string, actionTaken: string, vesselId: string) {
  const session = await requireAuth()
  await assertVesselAccess(vesselId, session.id, session.role, session.companyId)

  const data: Record<string, unknown> = { status, actionTaken }
  if (status === 'CLOSED') data.closedAt = new Date()

  await prisma.defect.update({ where: { id: defectId, vesselId }, data })
  revalidatePath(`/vessels/${vesselId}/defects`)
  revalidatePath(`/vessels/${vesselId}/defects/${defectId}`)
}
