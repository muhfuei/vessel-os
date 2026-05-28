import { prisma } from '@/lib/db'
import CompaniesClient from './CompaniesClient'

export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({
    include: {
      _count: { select: { users: true, vessels: true } },
      users: {
        where: { role: 'ADMIN' },
        select: { name: true, email: true },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Companies</h1>
        <p className="text-slate-400 text-sm mt-0.5">Manage all registered companies on the platform</p>
      </div>
      <CompaniesClient companies={companies} />
    </div>
  )
}
