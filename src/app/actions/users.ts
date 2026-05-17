'use server'

import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

async function requireAdmin() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') throw new Error('Unauthorized')
  return session
}

export async function createUserAction(formData: FormData) {
  const session = await requireAdmin()

  const name = (formData.get('name') as string).trim()
  const email = (formData.get('email') as string).trim().toLowerCase()
  const password = (formData.get('password') as string)
  const role = formData.get('role') as string
  const position = (formData.get('position') as string | null)?.trim() || null
  const department = (formData.get('department') as string | null)?.trim() || null

  if (!name || !email || !password || !role) return { error: 'All required fields must be filled.' }
  if (password.length < 6) return { error: 'Password must be at least 6 characters.' }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return { error: 'A user with that email already exists.' }

  const hashed = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: role as 'ADMIN' | 'USER' | 'VIEWER',
      position: position || undefined,
      department: department || undefined,
      companyId: session.companyId,
    },
  })

  revalidatePath('/users')
  return { success: true }
}

export async function updateUserAction(formData: FormData) {
  const session = await requireAdmin()

  const id = formData.get('id') as string
  const name = (formData.get('name') as string).trim()
  const email = (formData.get('email') as string).trim().toLowerCase()
  const role = formData.get('role') as string
  const status = formData.get('status') as string
  const position = (formData.get('position') as string | null)?.trim() || null
  const department = (formData.get('department') as string | null)?.trim() || null
  const vesselIds = formData.getAll('vesselIds') as string[]

  if (!name || !email) return { error: 'Name and email are required.' }

  const user = await prisma.user.findFirst({ where: { id, companyId: session.companyId } })
  if (!user) return { error: 'User not found.' }

  // Check email uniqueness if changed
  if (email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return { error: 'That email is already in use.' }
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        role: role as 'ADMIN' | 'USER' | 'VIEWER',
        status: status as 'ACTIVE' | 'INACTIVE',
        position: position || undefined,
        department: department || undefined,
      },
    }),
    prisma.vesselUserAccess.deleteMany({ where: { userId: id } }),
    ...(vesselIds.length > 0
      ? [prisma.vesselUserAccess.createMany({
          data: vesselIds.map((vesselId) => ({ userId: id, vesselId })),
          skipDuplicates: true,
        })]
      : []),
  ])

  revalidatePath('/users')
  return { success: true }
}

export async function deleteUserAction(id: string) {
  const session = await requireAdmin()

  if (id === session.id) return { error: 'You cannot delete your own account.' }

  const user = await prisma.user.findFirst({ where: { id, companyId: session.companyId } })
  if (!user) return { error: 'User not found.' }

  await prisma.user.delete({ where: { id } })

  revalidatePath('/users')
  return { success: true }
}
