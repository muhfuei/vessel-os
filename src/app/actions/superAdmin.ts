'use server'

import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { requireSuperAdmin } from '@/lib/auth'

// ── Company Management ────────────────────────────────────────────────────────

export async function createCompanyAction(formData: FormData) {
  await requireSuperAdmin()

  const companyName    = (formData.get('companyName') as string).trim()
  const companyEmail   = (formData.get('companyEmail') as string)?.trim() || null
  const companyAddress = (formData.get('companyAddress') as string)?.trim() || null
  const companyPhone   = (formData.get('companyPhone') as string)?.trim() || null

  const adminName     = (formData.get('adminName') as string).trim()
  const adminEmail    = (formData.get('adminEmail') as string).trim().toLowerCase()
  const adminPassword = formData.get('adminPassword') as string

  if (!companyName || !adminName || !adminEmail || !adminPassword) {
    return { error: 'Company name, admin name, admin email and password are required.' }
  }
  if (adminPassword.length < 6) {
    return { error: 'Admin password must be at least 6 characters.' }
  }

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (existing) return { error: 'That admin email is already registered.' }

  const hashed = await bcrypt.hash(adminPassword, 10)

  const company = await prisma.company.create({
    data: {
      name: companyName,
      email: companyEmail,
      address: companyAddress,
      phone: companyPhone,
      status: 'ACTIVE',
    },
  })

  await prisma.user.create({
    data: {
      name: adminName,
      email: adminEmail,
      password: hashed,
      role: 'ADMIN',
      companyId: company.id,
    },
  })

  revalidatePath('/super-admin/companies')
  return { success: true }
}

export async function toggleCompanyStatusAction(companyId: string, newStatus: 'ACTIVE' | 'SUSPENDED') {
  await requireSuperAdmin()

  await prisma.company.update({
    where: { id: companyId },
    data: { status: newStatus },
  })

  revalidatePath('/super-admin/companies')
  return { success: true }
}

export async function deleteCompanyAction(companyId: string) {
  await requireSuperAdmin()

  // Safety: prevent deleting if company has vessels/users
  const [userCount, vesselCount] = await Promise.all([
    prisma.user.count({ where: { companyId } }),
    prisma.vessel.count({ where: { companyId } }),
  ])

  if (userCount > 0 || vesselCount > 0) {
    return { error: `Cannot delete: company has ${userCount} user(s) and ${vesselCount} vessel(s). Suspend it instead.` }
  }

  await prisma.company.delete({ where: { id: companyId } })
  revalidatePath('/super-admin/companies')
  return { success: true }
}
