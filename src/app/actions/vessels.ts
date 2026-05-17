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

export async function updateVesselAction(formData: FormData) {
  const session = await requireAuth()
  if (session.role !== 'ADMIN') throw new Error('Only administrators can update vessels')

  const id = formData.get('id') as string

  const toStr = (key: string) => (formData.get(key) as string)?.trim() || null
  const toDate = (key: string) => {
    const v = (formData.get(key) as string)?.trim()
    return v ? new Date(v) : null
  }

  await prisma.vessel.update({
    where: { id, companyId: session.companyId },
    data: {
      name: (formData.get('name') as string).trim(),
      imoNumber: toStr('imoNumber'),
      officialNumber: toStr('officialNumber'),
      callSign: toStr('callSign'),
      mmsi: toStr('mmsi'),
      flag: toStr('flag'),
      portOfRegistry: toStr('portOfRegistry'),
      vesselType: (toStr('vesselType') ?? 'WORKBOAT') as never,
      status: (toStr('status') ?? 'ACTIVE') as never,
      classSociety: toStr('classSociety'),
      classNumber: toStr('classNumber'),
      classStatus: toStr('classStatus'),
      lastSurveyDate: toDate('lastSurveyDate'),
      nextSurveyDate: toDate('nextSurveyDate'),
      yearBuilt: toStr('yearBuilt'),
      builder: toStr('builder'),
      loa: toStr('loa'),
      breadth: toStr('breadth'),
      grossTonnage: toStr('grossTonnage'),
      netTonnage: toStr('netTonnage'),
      deadweight: toStr('deadweight'),
      mainEngine: toStr('mainEngine'),
      generator: toStr('generator'),
    },
  })

  revalidatePath('/vessels')
  revalidatePath(`/vessels/${id}`)
  return { success: true }
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
