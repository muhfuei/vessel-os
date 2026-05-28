import { prisma } from '@/lib/db'
import { Building2, Users, Ship, CheckCircle2, PauseCircle } from 'lucide-react'
import Link from 'next/link'

export default async function SuperAdminDashboard() {
  const [companies, totalUsers, totalVessels] = await Promise.all([
    prisma.company.findMany({
      include: {
        _count: { select: { users: true, vessels: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where: { role: { not: 'SUPER_ADMIN' } } }),
    prisma.vessel.count(),
  ])

  const activeCompanies   = companies.filter((c) => c.status === 'ACTIVE').length
  const suspendedCompanies = companies.filter((c) => c.status === 'SUSPENDED').length

  const stats = [
    { label: 'Total Companies', value: companies.length, icon: Building2, color: 'text-sky-400', bg: 'bg-sky-500/10 ring-sky-500/20' },
    { label: 'Active',          value: activeCompanies,    icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 ring-emerald-500/20' },
    { label: 'Suspended',       value: suspendedCompanies, icon: PauseCircle,  color: 'text-amber-400',   bg: 'bg-amber-500/10 ring-amber-500/20' },
    { label: 'Total Users',     value: totalUsers,         icon: Users,        color: 'text-violet-400',  bg: 'bg-violet-500/10 ring-violet-500/20' },
    { label: 'Total Vessels',   value: totalVessels,       icon: Ship,         color: 'text-cyan-400',    bg: 'bg-cyan-500/10 ring-cyan-500/20' },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Platform Overview</h1>
        <p className="text-slate-400 text-sm mt-0.5">Vessel OS — Multi-company administration</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-slate-900 rounded-xl border border-slate-800 p-4">
            <div className={`w-9 h-9 rounded-lg ring-1 ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-slate-400 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent companies */}
      <div className="bg-slate-900 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-white">Companies</h2>
          <Link
            href="/super-admin/companies"
            className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
          >
            Manage all →
          </Link>
        </div>
        <div className="divide-y divide-slate-800">
          {companies.slice(0, 8).map((c) => (
            <div key={c.id} className="flex items-center justify-between px-5 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{c.name}</p>
                <p className="text-xs text-slate-500">
                  {c._count.users} user{c._count.users !== 1 ? 's' : ''} · {c._count.vessels} vessel{c._count.vessels !== 1 ? 's' : ''}
                </p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-3 ${
                c.status === 'ACTIVE'
                  ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20'
                  : 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/20'
              }`}>
                {c.status === 'ACTIVE' ? 'Active' : 'Suspended'}
              </span>
            </div>
          ))}
          {companies.length === 0 && (
            <p className="px-5 py-8 text-sm text-slate-500 text-center">No companies yet. Create the first one.</p>
          )}
        </div>
      </div>
    </div>
  )
}
