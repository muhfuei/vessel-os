import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import UsersClient from './UsersClient'

export default async function UsersPage() {
  const session = await getSession()
  if (!session) return null
  if (session.role !== 'ADMIN') redirect('/dashboard')

  const [users, vessels] = await Promise.all([
    prisma.user.findMany({
      where: { companyId: session.companyId },
      include: { vesselAccess: { include: { vessel: { select: { id: true, name: true } } } } },
      orderBy: { name: 'asc' },
    }),
    prisma.vessel.findMany({
      where: { companyId: session.companyId },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ])

  return <UsersClient users={users} vessels={vessels} currentUserId={session.id} />
}
