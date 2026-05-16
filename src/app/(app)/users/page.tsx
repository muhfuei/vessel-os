import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { formatStatus, statusColor } from '@/lib/utils'
import { Users } from 'lucide-react'

export default async function UsersPage() {
  const session = await getSession()
  if (!session) return null
  if (session.role !== 'ADMIN') redirect('/dashboard')

  const users = await prisma.user.findMany({
    where: { companyId: session.companyId },
    include: { vesselAccess: { include: { vessel: { select: { name: true } } } } },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6 space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Users</h1>

      <div className="space-y-3">
        {users.map((u) => (
          <div key={u.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-gray-900 text-sm">{u.name}</p>
                <p className="text-xs text-gray-400">{u.email}</p>
                {u.position && <p className="text-xs text-gray-400">{u.position}</p>}
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(u.role)}`}>
                  {u.role}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(u.status)}`}>
                  {formatStatus(u.status)}
                </span>
              </div>
            </div>
            {u.vesselAccess.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {u.vesselAccess.map((va) => (
                  <span key={va.vesselId} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                    {va.vessel.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {users.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No users yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
