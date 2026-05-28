'use server'

import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { createSession, deleteSession } from '@/lib/auth'

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { error: 'Invalid email or password' }
  }

  if (user.status === 'INACTIVE') {
    return { error: 'Your account is inactive. Contact your administrator.' }
  }

  await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    companyId: user.companyId ?? null,
  })

  // Route by role: Super Admin goes to their own portal
  if (user.role === 'SUPER_ADMIN') {
    redirect('/super-admin')
  }

  redirect('/dashboard')
}

export async function logoutAction() {
  await deleteSession()
  redirect('/login')
}

export async function changePasswordAction(formData: FormData) {
  const { getSession } = await import('@/lib/auth')
  const session = await getSession()
  if (!session) return { error: 'Not authenticated.' }

  const currentPassword = formData.get('currentPassword') as string
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: 'All fields are required.' }
  }
  if (newPassword.length < 6) {
    return { error: 'New password must be at least 6 characters.' }
  }
  if (newPassword !== confirmPassword) {
    return { error: 'New passwords do not match.' }
  }

  const user = await prisma.user.findUnique({ where: { id: session.id } })
  if (!user) return { error: 'User not found.' }

  const valid = await bcrypt.compare(currentPassword, user.password)
  if (!valid) return { error: 'Current password is incorrect.' }

  const hashed = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({ where: { id: session.id }, data: { password: hashed } })

  return { success: true }
}
