'use client'

import { useState, useTransition } from 'react'
import { Plus, X, Building2, Users, Ship, CheckCircle2, PauseCircle, Pencil } from 'lucide-react'
import { createCompanyAction, toggleCompanyStatusAction } from '@/app/actions/superAdmin'

type Company = {
  id: string
  name: string
  email: string | null
  address: string | null
  phone: string | null
  status: string
  createdAt: Date
  _count: { users: number; vessels: number }
  users: { name: string; email: string }[]
}

// ── Create Company Modal ──────────────────────────────────────────────────────
function CreateCompanyModal({ onClose }: { onClose: () => void }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await createCompanyAction(fd)
      if (res?.error) { setError(res.error); return }
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 sticky top-0 bg-slate-900 z-10">
          <h2 className="font-semibold text-white">Create New Company</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Company Details */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Company Details</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Company Name *</label>
                <input
                  name="companyName"
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="e.g. Ajang Shipping Sdn Bhd"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Company Email</label>
                <input
                  name="companyEmail"
                  type="email"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="info@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Address</label>
                <input
                  name="companyAddress"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Street, City, State, Country"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Phone</label>
                <input
                  name="companyPhone"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="+60 12 345 6789"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-700" />

          {/* First Admin Account */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">First Company Admin Account</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Admin Full Name *</label>
                <input
                  name="adminName"
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Ahmad Razif"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Admin Email *</label>
                <input
                  name="adminEmail"
                  type="email"
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="admin@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Temporary Password * (min. 6 chars)</label>
                <input
                  name="adminPassword"
                  type="password"
                  required
                  minLength={6}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <p className="text-xs text-slate-500 mt-1">Admin should change this on first login.</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-slate-600 text-slate-300 text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 py-2.5 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 disabled:opacity-50 transition-colors"
            >
              {pending ? 'Creating…' : 'Create Company'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CompaniesClient({ companies }: { companies: Company[] }) {
  const [showCreate, setShowCreate] = useState(false)
  const [toggling, startTransition] = useTransition()

  function handleToggle(companyId: string, currentStatus: string) {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
    const action = newStatus === 'SUSPENDED' ? 'Suspend' : 'Activate'
    if (!confirm(`${action} this company? Their users will ${newStatus === 'SUSPENDED' ? 'lose' : 'regain'} access.`)) return
    startTransition(async () => {
      await toggleCompanyStatusAction(companyId, newStatus as 'ACTIVE' | 'SUSPENDED')
    })
  }

  return (
    <>
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">{companies.length} compan{companies.length !== 1 ? 'ies' : 'y'} registered</p>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Company
        </button>
      </div>

      {/* Company cards */}
      <div className="space-y-3">
        {companies.map((c) => {
          const admin = c.users[0]
          return (
            <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 ring-1 ring-slate-700 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white">{c.name}</p>
                    {c.email && <p className="text-sm text-slate-400 truncate">{c.email}</p>}
                    {admin && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        Admin: {admin.name} ({admin.email})
                      </p>
                    )}
                  </div>
                </div>

                <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ring-1 ${
                  c.status === 'ACTIVE'
                    ? 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/20'
                    : 'bg-amber-500/15 text-amber-400 ring-amber-500/20'
                }`}>
                  {c.status === 'ACTIVE' ? 'Active' : 'Suspended'}
                </span>
              </div>

              {/* Counts */}
              <div className="mt-4 flex gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  {c._count.users} user{c._count.users !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1.5">
                  <Ship className="w-3.5 h-3.5" />
                  {c._count.vessels} vessel{c._count.vessels !== 1 ? 's' : ''}
                </span>
                <span className="text-slate-600">
                  Created {new Date(c.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-4 border-t border-slate-800 flex gap-2">
                <button
                  onClick={() => handleToggle(c.id, c.status)}
                  disabled={toggling}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 ${
                    c.status === 'ACTIVE'
                      ? 'border border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                      : 'border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                  }`}
                >
                  {c.status === 'ACTIVE' ? (
                    <><PauseCircle className="w-3.5 h-3.5" /> Suspend</>
                  ) : (
                    <><CheckCircle2 className="w-3.5 h-3.5" /> Activate</>
                  )}
                </button>
              </div>
            </div>
          )
        })}

        {companies.length === 0 && (
          <div className="text-center py-20">
            <Building2 className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No companies yet</p>
            <p className="text-slate-600 text-sm mt-1">Create the first company to get started.</p>
          </div>
        )}
      </div>

      {showCreate && <CreateCompanyModal onClose={() => setShowCreate(false)} />}
    </>
  )
}
