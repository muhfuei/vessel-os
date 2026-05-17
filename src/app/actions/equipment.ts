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

export async function updateEquipmentAction(formData: FormData) {
  const session = await requireAuth()
  if (session.role !== 'ADMIN') throw new Error('Only administrators can edit equipment')

  const id = formData.get('id') as string
  const vesselId = formData.get('vesselId') as string
  const trackHours = formData.get('trackHours') === 'true'
  const hoursRaw = formData.get('hoursUsed') as string

  await prisma.equipment.update({
    where: { id },
    data: {
      name: (formData.get('name') as string).trim(),
      system: (formData.get('system') as string)?.trim() || null,
      manufacturer: (formData.get('manufacturer') as string)?.trim() || null,
      model: (formData.get('model') as string)?.trim() || null,
      serialNumber: (formData.get('serialNumber') as string)?.trim() || null,
      description: (formData.get('description') as string)?.trim() || null,
      status: (formData.get('status') as string || 'OPERATIONAL') as never,
      hoursUsed: trackHours && hoursRaw ? parseFloat(hoursRaw) : null,
    },
  })

  revalidatePath(`/vessels/${vesselId}/equipment`)
  return { success: true }
}

export async function deleteEquipmentAction(id: string, vesselId: string) {
  const session = await requireAuth()
  if (session.role !== 'ADMIN') throw new Error('Only administrators can delete equipment')

  await prisma.equipment.delete({ where: { id } })
  revalidatePath(`/vessels/${vesselId}/equipment`)
  return { success: true }
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
