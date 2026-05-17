'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

async function assertVesselAccess(vesselId: string, userId: string, role: string, companyId: string) {
  if (role === 'ADMIN') {
    const v = await prisma.vessel.findFirst({ where: { id: vesselId, companyId } })
    if (!v) throw new Error('Vessel not found')
    return
  }
  const access = await prisma.vesselUserAccess.findUnique({ where: { userId_vesselId: { userId, vesselId } } })
  if (!access) throw new Error('No access to this vessel')
}

// ── Surveys ──────────────────────────────────────────────────────────────────

export async function createSurveyAction(formData: FormData) {
  const session = await requireAuth()
  const vesselId = formData.get('vesselId') as string
  await assertVesselAccess(vesselId, session.id, session.role, session.companyId)

  await prisma.survey.create({
    data: {
      vesselId,
      type: formData.get('type') as never,
      status: (formData.get('status') as string || 'DUE') as never,
      dueDate: formData.get('dueDate') ? new Date(formData.get('dueDate') as string) : null,
      completedDate: formData.get('completedDate') ? new Date(formData.get('completedDate') as string) : null,
      surveyor: (formData.get('surveyor') as string) || null,
      surveySociety: (formData.get('surveySociety') as string) || null,
      place: (formData.get('place') as string) || null,
      remarks: (formData.get('remarks') as string) || null,
    },
  })
  revalidatePath(`/vessels/${vesselId}/certificates`)
}

export async function updateSurveyAction(formData: FormData) {
  const session = await requireAuth()
  const id = formData.get('id') as string
  const vesselId = formData.get('vesselId') as string
  await assertVesselAccess(vesselId, session.id, session.role, session.companyId)

  await prisma.survey.update({
    where: { id },
    data: {
      type: formData.get('type') as never,
      status: formData.get('status') as never,
      dueDate: formData.get('dueDate') ? new Date(formData.get('dueDate') as string) : null,
      completedDate: formData.get('completedDate') ? new Date(formData.get('completedDate') as string) : null,
      surveyor: (formData.get('surveyor') as string) || null,
      surveySociety: (formData.get('surveySociety') as string) || null,
      place: (formData.get('place') as string) || null,
      remarks: (formData.get('remarks') as string) || null,
    },
  })
  revalidatePath(`/vessels/${vesselId}/certificates`)
  return { success: true }
}

export async function deleteSurveyAction(id: string, vesselId: string) {
  await requireAuth()
  await prisma.survey.delete({ where: { id } })
  revalidatePath(`/vessels/${vesselId}/certificates`)
  return { success: true }
}

// ── Inspections ───────────────────────────────────────────────────────────────

export async function createInspectionAction(formData: FormData) {
  const session = await requireAuth()
  const vesselId = formData.get('vesselId') as string
  await assertVesselAccess(vesselId, session.id, session.role, session.companyId)

  const inspection = await prisma.inspection.create({
    data: {
      vesselId,
      inspectionType: formData.get('inspectionType') as never,
      inspectorName: (formData.get('inspectorName') as string) || null,
      inspectorRole: (formData.get('inspectorRole') as string) || null,
      inspectionDate: new Date(formData.get('inspectionDate') as string),
      port: (formData.get('port') as string) || null,
      status: 'OPEN',
      remarks: (formData.get('remarks') as string) || null,
    },
  })
  revalidatePath(`/vessels/${vesselId}/certificates`)
  return { id: inspection.id }
}

export async function updateInspectionAction(formData: FormData) {
  await requireAuth()
  const id = formData.get('id') as string
  const vesselId = formData.get('vesselId') as string

  await prisma.inspection.update({
    where: { id },
    data: {
      inspectionType: formData.get('inspectionType') as never,
      inspectorName: (formData.get('inspectorName') as string) || null,
      inspectorRole: (formData.get('inspectorRole') as string) || null,
      inspectionDate: new Date(formData.get('inspectionDate') as string),
      port: (formData.get('port') as string) || null,
      remarks: (formData.get('remarks') as string) || null,
    },
  })
  revalidatePath(`/vessels/${vesselId}/certificates`)
  return { success: true }
}

export async function closeInspectionAction(id: string, vesselId: string) {
  await requireAuth()
  await prisma.inspection.update({ where: { id }, data: { status: 'CLOSED' } })
  revalidatePath(`/vessels/${vesselId}/certificates`)
  return { success: true }
}

export async function deleteInspectionAction(id: string, vesselId: string) {
  await requireAuth()
  await prisma.inspection.delete({ where: { id } })
  revalidatePath(`/vessels/${vesselId}/certificates`)
  return { success: true }
}

// ── Deficiency Reports ────────────────────────────────────────────────────────

export async function createDeficiencyAction(formData: FormData) {
  await requireAuth()
  const inspectionId = formData.get('inspectionId') as string
  const vesselId = formData.get('vesselId') as string

  // Auto-generate code: DR-001, DR-002...
  const count = await prisma.deficiencyReport.count({ where: { inspectionId } })
  const code = `DR-${String(count + 1).padStart(3, '0')}`

  await prisma.deficiencyReport.create({
    data: {
      inspectionId,
      code,
      system: formData.get('system') as string,
      description: formData.get('description') as string,
      regulatoryRef: (formData.get('regulatoryRef') as string) || null,
      riskLevel: (formData.get('riskLevel') as never) || 'MEDIUM',
      correctiveAction: (formData.get('correctiveAction') as string) || null,
      status: 'OPEN',
    },
  })
  revalidatePath(`/vessels/${vesselId}/certificates`)
  return { success: true }
}

export async function updateDeficiencyStatusAction(id: string, status: string, vesselId: string) {
  await requireAuth()
  await prisma.deficiencyReport.update({
    where: { id },
    data: {
      status: status as never,
      closedAt: status === 'CLOSED' ? new Date() : null,
    },
  })
  revalidatePath(`/vessels/${vesselId}/certificates`)
  return { success: true }
}

export async function deleteDeficiencyAction(id: string, vesselId: string) {
  await requireAuth()
  await prisma.deficiencyReport.delete({ where: { id } })
  revalidatePath(`/vessels/${vesselId}/certificates`)
  return { success: true }
}

// ── Punch List ────────────────────────────────────────────────────────────────

export async function createPunchItemAction(formData: FormData) {
  await requireAuth()
  const inspectionId = formData.get('inspectionId') as string
  const vesselId = formData.get('vesselId') as string

  const count = await prisma.punchListItem.count({ where: { inspectionId } })
  const code = `PL-${String(count + 1).padStart(3, '0')}`

  await prisma.punchListItem.create({
    data: {
      inspectionId,
      code,
      location: (formData.get('location') as string) || null,
      description: formData.get('description') as string,
      department: formData.get('department') as string,
      priority: (formData.get('priority') as never) || 'NORMAL',
      status: 'OPEN',
    },
  })
  revalidatePath(`/vessels/${vesselId}/certificates`)
  return { success: true }
}

export async function updatePunchItemStatusAction(id: string, status: string, vesselId: string) {
  await requireAuth()
  await prisma.punchListItem.update({
    where: { id },
    data: {
      status: status as never,
      closedAt: status === 'CLOSED' ? new Date() : null,
    },
  })
  revalidatePath(`/vessels/${vesselId}/certificates`)
  return { success: true }
}

export async function deletePunchItemAction(id: string, vesselId: string) {
  await requireAuth()
  await prisma.punchListItem.delete({ where: { id } })
  revalidatePath(`/vessels/${vesselId}/certificates`)
  return { success: true }
}
