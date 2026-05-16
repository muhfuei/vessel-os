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

export async function createTaskAction(formData: FormData) {
  const session = await requireAuth()
  const vesselId = formData.get('vesselId') as string

  await assertVesselAccess(vesselId, session.id, session.role, session.companyId)

  await prisma.maintenanceTask.create({
    data: {
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || null,
      taskCode: (formData.get('taskCode') as string) || null,
      category: (formData.get('category') as string) || null,
      priority: (formData.get('priority') as string || 'NORMAL') as never,
      status: 'PENDING',
      dueDate: formData.get('dueDate') ? new Date(formData.get('dueDate') as string) : null,
      vesselId,
      equipmentId: (formData.get('equipmentId') as string) || null,
      assignedToId: (formData.get('assignedToId') as string) || null,
    },
  })

  revalidatePath(`/vessels/${vesselId}/tasks`)
}

export async function updateTaskStatusAction(taskId: string, status: string, vesselId: string) {
  const session = await requireAuth()
  await assertVesselAccess(vesselId, session.id, session.role, session.companyId)

  const data: Record<string, unknown> = { status }
  if (status === 'COMPLETED') data.completedAt = new Date()

  await prisma.maintenanceTask.update({ where: { id: taskId, vesselId }, data })
  revalidatePath(`/vessels/${vesselId}/tasks`)
  revalidatePath(`/vessels/${vesselId}/tasks/${taskId}`)
}
