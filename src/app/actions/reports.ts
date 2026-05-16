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

export async function createWCRAction(formData: FormData) {
  const session = await requireAuth()
  const vesselId = formData.get('vesselId') as string

  await assertVesselAccess(vesselId, session.id, session.role, session.companyId)

  const count = await prisma.workCompletionReport.count({ where: { vesselId } })
  const reportNumber = `WCR-${vesselId.slice(-4).toUpperCase()}-${String(count + 1).padStart(3, '0')}`

  await prisma.workCompletionReport.create({
    data: {
      reportNumber,
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || null,
      workDone: (formData.get('workDone') as string) || null,
      remarks: (formData.get('remarks') as string) || null,
      completedDate: formData.get('completedDate') ? new Date(formData.get('completedDate') as string) : null,
      status: 'DRAFT',
      vesselId,
      taskId: (formData.get('taskId') as string) || null,
      defectId: (formData.get('defectId') as string) || null,
      createdById: session.id,
    },
  })

  revalidatePath(`/vessels/${vesselId}/reports`)
}

export async function updateWCRStatusAction(wcrId: string, status: string, vesselId: string) {
  const session = await requireAuth()
  await assertVesselAccess(vesselId, session.id, session.role, session.companyId)

  const data: Record<string, unknown> = { status }
  if (status === 'VERIFIED') data.verifiedDate = new Date()

  await prisma.workCompletionReport.update({ where: { id: wcrId, vesselId }, data })
  revalidatePath(`/vessels/${vesselId}/reports`)
  revalidatePath(`/vessels/${vesselId}/reports/${wcrId}`)
}
