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

  await prisma.certificate.update({
    where: { id },
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
  await prisma.certificate.delete({ where: { id } })
  revalidatePath(`/vessels/${vesselId}/certificates`)
  return { success: true }
}
