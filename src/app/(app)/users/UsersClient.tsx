'use client'

import { useState, useTransition } from 'react'
import { Users, Plus, X, Pencil, Trash2, ShieldCheck, Eye, User } from 'lucide-react'
import { createUserAction, updateUserAction, deleteUserAction } from '@/app/actions/users'

type Vessel = { id: string; name: string }
type UserRow = {
  id: string
  name: string
  email: string
  position: string | null
  department: string | null
  role: string
  status: string
  vesselAccess: { vessel: Vessel; vesselId: string }[]
}

const ROLES = ['ADMIN', 'USER', 'VIEWER'] as const
const ROLE_LABELS: Record<string, string> = { ADMIN: 'Admin', USER: 'User', VIEWER: 'Viewer' }
const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-700',
  USER: 'bg-blue-100 text-blue-700',
  VIEWER: 'bg-gray-100 text-gray-600',
}
const ROLE_ICONS: Record<string, React.ReactNode> = {
  ADMIN: <ShieldCheck className="w-3 h-3" />,
  USER: <User className="w-3 h-3" />,
  VIEWER: <Eye className="w-3 h-3" />,
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[role] ?? 'bg-gray-100 text-gray-600'}`}>
      {ROLE_ICONS[role]}
      {ROLE_LABELS[role] ?? role}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
      {status === 'ACTIVE' ? 'Active' : 'Inactive'}
    </span>
  )
}

// ── Add User Modal ────────────────────────────────────────────────────────────
function AddUserModal({ onClose }: { onClose: () => void }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await createUserAction(fd)
      if (res?.error) { setError(res.error); return }
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Add User</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
              <input name="name" required className="input" placeholder="Ahmad Razif" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
              <input name="email" type="email" required className="input" placeholder="ahmad@company.com" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Password * (min. 6 chars)</label>
              <input name="password" type="password" required minLength={6} className="input" placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Role *</label>
              <select name="role" required className="input">
                {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Position</label>
              <input name="position" className="input" placeholder="Captain / Master" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
              <input name="department" className="input" placeholder="Deck" />
            </div>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={pending} className="flex-1 py-2 rounded-lg bg-blue-700 text-sm font-medium text-white hover:bg-blue-800 transition-colors disabled:opacity-50">
              {pending ? 'Adding…' : 'Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Edit User Modal ───────────────────────────────────────────────────────────
function EditUserModal({ user, vessels, onClose }: { user: UserRow; vessels: Vessel[]; onClose: () => void }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const currentVesselIds = user.vesselAccess.map((va) => va.vesselId)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await updateUserAction(fd)
      if (res?.error) { setError(res.error); return }
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <div>
            <h2 className="font-semibold text-gray-900">Edit User</h2>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <input type="hidden" name="id" value={user.id} />

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
              <input name="name" required defaultValue={user.name} className="input" placeholder="Ahmad Razif" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
              <input name="email" type="email" required defaultValue={user.email} className="input" placeholder="ahmad@company.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
              <select name="role" defaultValue={user.role} className="input">
                {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select name="status" defaultValue={user.status} className="input">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Position</label>
              <input name="position" defaultValue={user.position ?? ''} className="input" placeholder="Captain / Master" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
              <input name="department" defaultValue={user.department ?? ''} className="input" placeholder="Deck" />
            </div>
          </div>

          {vessels.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Vessel Access</label>
              <div className="space-y-1.5">
                {vessels.map((v) => (
                  <label key={v.id} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      name="vesselIds"
                      value={v.id}
                      defaultChecked={currentVesselIds.includes(v.id)}
                      className="rounded border-gray-300 text-blue-600"
                    />
                    {v.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={pending} className="flex-1 py-2 rounded-lg bg-blue-700 text-sm font-medium text-white hover:bg-blue-800 transition-colors disabled:opacity-50">
              {pending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function UsersClient({
  users,
  vessels,
  currentUserId,
}: {
  users: UserRow[]
  vessels: Vessel[]
  currentUserId: string
}) {
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<UserRow | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [deleteError, setDeleteError] = useState<string | null>(null)

  function handleDelete(id: string) {
    setDeleteError(null)
    setDeletingId(id)
    startTransition(async () => {
      const res = await deleteUserAction(id)
      setDeletingId(null)
      if (res?.error) setDeleteError(res.error)
    })
  }

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Users</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-700 text-white text-sm font-medium hover:bg-blue-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {deleteError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{deleteError}</p>
      )}

      <div className="space-y-3">
        {users.map((u) => (
          <div key={u.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900 text-sm truncate">{u.name}</p>
                <p className="text-xs text-gray-400 truncate">{u.email}</p>
                {u.position && <p className="text-xs text-gray-400">{u.position}{u.department ? ` · ${u.department}` : ''}</p>}
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <RoleBadge role={u.role} />
                <StatusBadge status={u.status} />
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

            <div className="mt-3 flex gap-2 border-t border-gray-50 pt-3">
              <button
                onClick={() => setEditing(u)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>
              {u.id !== currentUserId && (
                <button
                  onClick={() => handleDelete(u.id)}
                  disabled={deletingId === u.id || pending}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-100 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {deletingId === u.id ? 'Removing…' : 'Remove'}
                </button>
              )}
            </div>
          </div>
        ))}

        {users.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No users yet</p>
          </div>
        )}
      </div>

      {showAdd && <AddUserModal onClose={() => setShowAdd(false)} />}
      {editing && <EditUserModal user={editing} vessels={vessels} onClose={() => setEditing(null)} />}
    </div>
  )
}
