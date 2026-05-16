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

export async function createEquipmentAction(formData: FormData) {
  const session = await requireAuth()
  const vesselId = formData.get('vesselId') as string

  await assertVesselAccess(vesselId, session.id, session.role, session.companyId)

  await prisma.equipment.create({
    data: {
      name: formData.get('name') as string,
      system: (formData.get('system') as string) || null,
      manufacturer: (formData.get('manufacturer') as string) || null,
      model: (formData.get('model') as string) || null,
      serialNumber: (formData.get('serialNumber') as string) || null,
      partNumber: (formData.get('partNumber') as string) || null,
      description: (formData.get('description') as string) || null,
      status: 'OPERATIONAL',
      vesselId,
    },
  })

  revalidatePath(`/vessels/${vesselId}/equipment`)
}
