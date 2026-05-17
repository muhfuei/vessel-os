'use client'

import { useState, useTransition } from 'react'
import { Cog, Pencil, Trash2, X } from 'lucide-react'
import { formatStatus, statusColor } from '@/lib/utils'
import { updateEquipmentAction, deleteEquipmentAction } from '@/app/actions/equipment'
import { EQUIPMENT_REGISTRY, CATEGORY_KEYS } from '@/lib/equipmentRegistry'

const EQUIPMENT_STATUSES = ['OPERATIONAL', 'UNDER_MAINTENANCE', 'DEFECTIVE', 'DECOMMISSIONED']

type EquipmentItem = {
  id: string
  name: string
  system: string | null
  manufacturer: string | null
  model: string | null
  serialNumber: string | null
  description: string | null
  hoursUsed: number | null
  status: string
  _count: { tasks: number; defects: number }
}

function EditEquipmentModal({
  item,
  vesselId,
  onClose,
}: {
  item: EquipmentItem
  vesselId: string
  onClose: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [trackHours, setTrackHours] = useState(item.hoursUsed !== null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    fd.set('trackHours', trackHours ? 'true' : 'false')
    startTransition(async () => {
      try {
        await updateEquipmentAction(fd)
        onClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="font-semibold text-gray-900">Edit Equipment</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="vesselId" value={vesselId} />

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Equipment Name *</label>
              <input name="name" required defaultValue={item.name} className="input" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <select name="system" defaultValue={item.system ?? ''} className="input">
                <option value="">— Select category —</option>
                {CATEGORY_KEYS.map(key => {
                  const cat = EQUIPMENT_REGISTRY[key]
                  return <option key={key} value={cat.label}>{cat.label}</option>
                })}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Brand / Manufacturer</label>
              <input name="manufacturer" defaultValue={item.manufacturer ?? ''} className="input" placeholder="Cummins" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Model</label>
              <input name="model" defaultValue={item.model ?? ''} className="input" placeholder="KTA50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Serial Number</label>
              <input name="serialNumber" defaultValue={item.serialNumber ?? ''} className="input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select name="status" defaultValue={item.status} className="input">
                {EQUIPMENT_STATUSES.map(s => <option key={s} value={s}>{formatStatus(s)}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <textarea name="description" defaultValue={item.description ?? ''} rows={2} className="input resize-none" placeholder="Brief description of the equipment" />
            </div>
          </div>

          {/* Running Hours */}
          <div className="border border-gray-100 rounded-xl p-3 space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={trackHours}
                onChange={e => setTrackHours(e.target.checked)}
                className="rounded border-gray-300 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">Track Running Hours</span>
              <span className="text-xs text-gray-400">(engines, generators, thrusters)</span>
            </label>
            {trackHours ? (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Current Running Hours</label>
                <input
                  name="hoursUsed"
                  type="number"
                  min="0"
                  step="0.1"
                  defaultValue={item.hoursUsed ?? ''}
                  className="input"
                  placeholder="12500"
                />
              </div>
            ) : (
              <p className="text-xs text-gray-400 pl-6">Running hours: N/A (not applicable)</p>
            )}
          </div>

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

export default function EquipmentListClient({
  equipment,
  vesselId,
  isAdmin,
}: {
  equipment: EquipmentItem[]
  vesselId: string
  isAdmin: boolean
}) {
  const [editing, setEditing] = useState<EquipmentItem | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleDelete(id: string) {
    if (!confirm('Delete this equipment? This cannot be undone.')) return
    setDeleteError(null)
    setDeletingId(id)
    startTransition(async () => {
      const res = await deleteEquipmentAction(id, vesselId)
      setDeletingId(null)
      if (res?.success) {
        // page will revalidate
      }
    })
  }

  const grouped = equipment.reduce<Record<string, EquipmentItem[]>>((acc, e) => {
    const key = e.system ?? 'General'
    if (!acc[key]) acc[key] = []
    acc[key].push(e)
    return acc
  }, {})

  return (
    <>
      {deleteError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{deleteError}</p>
      )}

      {Object.entries(grouped).map(([system, items]) => (
        <div key={system} className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50 rounded-t-xl">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{system}</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {items.map((e) => (
              <div key={e.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Cog className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{e.name}</p>
                  <p className="text-xs text-gray-400">
                    {[e.manufacturer, e.model, e.serialNumber].filter(Boolean).join(' · ')}
                  </p>
                  {e.hoursUsed !== null && (
                    <p className="text-xs text-blue-600 mt-0.5">{e.hoursUsed.toLocaleString()} hrs</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(e.status)}`}>
                    {formatStatus(e.status)}
                  </span>
                  <div className="flex gap-2">
                    {e._count.tasks > 0 && <span className="text-xs text-orange-500">{e._count.tasks} tasks</span>}
                    {e._count.defects > 0 && <span className="text-xs text-red-500">{e._count.defects} defects</span>}
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1 mt-0.5">
                      <button
                        onClick={() => setEditing(e)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 transition-colors"
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(e.id)}
                        disabled={deletingId === e.id || pending}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-red-100 text-xs text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                      >
                        <Trash2 className="w-3 h-3" />
                        {deletingId === e.id ? '…' : 'Delete'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {editing && (
        <EditEquipmentModal item={editing} vesselId={vesselId} onClose={() => setEditing(null)} />
      )}
    </>
  )
}
