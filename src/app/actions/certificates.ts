'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

function toDate(val: FormDataEntryValue | null) {
  const s = (val as string)?.trim()
  return s ? new Date(s) : null
}
function toStr(val: FormDataEntryValue | null) {
  const s = (val as string)?.trim()
  return s || null
}

export async function createCertificateAction(formData: FormData) {
  const session = await requireAuth()
  if (session.role !== 'ADMIN') throw new Error('Admin only')
  const vesselId = formData.get('vesselId') as string

  await prisma.certificate.create({
    data: {
      vesselId,
      title: (formData.get('title') as string).trim(),
      abbreviation: toStr(formData.get('abbreviation')),
      type: (toStr(formData.get('type')) ?? 'CLASS') as never,
      status: (toStr(formData.get('status')) ?? 'FULL') as never,
      issuedDate: toDate(formData.get('issuedDate')),
      expiryDate: toDate(formData.get('expiryDate')),
      remarks: toStr(formData.get('remarks')),
    },
  })
  revalidatePath(`/vessels/${vesselId}/certificates`)
  return { success: true }
}

export async function updateCertificateAction(formData: FormData) {
  const session = await requireAuth()
  if (session.role !== 'ADMIN') throw new Error('Admin only')
  const id = formData.get('id') as string
  const vesselId = formData.get('vesselId') as string
  if (!session.companyId) throw new Error('No company access')
  const vessel = await prisma.vessel.findFirst({ where: { id: vesselId, companyId: session.companyId } })
  if (!vessel) throw new Error('Vessel not found')

  await prisma.certificate.updateMany({
    where: { id, vesselId },
    data: {
      title: (formData.get('title') as string).trim(),
      abbreviation: toStr(formData.get('abbreviation')),
      type: (toStr(formData.get('type')) ?? 'CLASS') as never,
      status: (toStr(formData.get('status')) ?? 'FULL') as never,
      issuedDate: toDate(formData.get('issuedDate')),
      expiryDate: toDate(formData.get('expiryDate')),
      remarks: toStr(formData.get('remarks')),
    },
  })
  revalidatePath(`/vessels/${vesselId}/certificates`)
  return { success: true }
}

export async function deleteCertificateAction(id: string, vesselId: string) {
  const session = await requireAuth()
  if (session.role !== 'ADMIN') throw new Error('Admin only')
  if (!session.companyId) throw new Error('No company access')
  const vessel = await prisma.vessel.findFirst({ where: { id: vesselId, companyId: session.companyId } })
  if (!vessel) throw new Error('Vessel not found')
  await prisma.certificate.deleteMany({ where: { id, vesselId } })
  revalidatePath(`/vessels/${vesselId}/certificates`)
  return { success: true }
}
