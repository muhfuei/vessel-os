'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function createVesselAction(formData: FormData) {
  const session = await requireAuth()
  if (session.role !== 'ADMIN') throw new Error('Only administrators can create vessels')

  await prisma.vessel.create({
    data: {
      name: formData.get('name') as string,
      imoNumber: (formData.get('imoNumber') as string) || null,
      officialNumber: (formData.get('officialNumber') as string) || null,
      callSign: (formData.get('callSign') as string) || null,
      mmsi: (formData.get('mmsi') as string) || null,
      flag: (formData.get('flag') as string) || null,
      portOfRegistry: (formData.get('portOfRegistry') as string) || null,
      vesselType: (formData.get('vesselType') as string || 'WORKBOAT') as never,
      status: 'ACTIVE',
      classSociety: (formData.get('classSociety') as string) || null,
      yearBuilt: (formData.get('yearBuilt') as string) || null,
      grossTonnage: (formData.get('grossTonnage') as string) || null,
      mainEngine: (formData.get('mainEngine') as string) || null,
      companyId: session.companyId,
    },
  })

  revalidatePath('/vessels')
}

export async function updateVesselStatusAction(vesselId: string, status: string) {
  const session = await requireAuth()
  if (session.role !== 'ADMIN') throw new Error('Only administrators can update vessel status')

  await prisma.vessel.update({
    where: { id: vesselId, companyId: session.companyId },
    data: { status: status as never },
  })
  revalidatePath('/vessels')
  revalidatePath(`/vessels/${vesselId}`)
}
