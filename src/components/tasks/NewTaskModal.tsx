'use client'

import { useState, useRef } from 'react'
import { createTaskAction } from '@/app/actions/tasks'
import { Plus, X } from 'lucide-react'
import { canHandleMaintenance, groupByDepartment } from '@/lib/operationalDomains'

type UserOption = {
  id: string
  name: string
  position: string | null
  department: string | null
  operationalDomain: string | null
}

type Props = {
  vesselId: string
  equipment: { id: string; name: string }[]
  users: UserOption[]
}

export default function NewTaskModal({ vesselId, equipment, users }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  // Filter to users whose domain can handle maintenance tasks, group by department
  const eligible = users.filter((u) => canHandleMaintenance(u.operationalDomain))
  const grouped = groupByDepartment(eligible)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.set('vesselId', vesselId)
    await createTaskAction(formData)
    setOpen(false)
    formRef.current?.reset()
    setLoading(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        <Plus className="w-4 h-4" />
        New Task
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-full lg:max-w-lg bg-white rounded-t-2xl lg:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-semibold text-gray-900">New Maintenance Task</h2>
              <button onClick={() => setOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
                <input name="title" required className="input" placeholder="e.g. 250-hour engine service" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task Code</label>
                  <input name="taskCode" className="input" placeholder="e.g. PM1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input name="category" className="input" placeholder="e.g. Engine, Safety" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Equipment</label>
                <select name="equipmentId" className="input">
                  <option value="">— General / No equipment —</option>
                  {equipment.map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select name="priority" className="input">
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input name="dueDate" type="date" className="input" />
                </div>
              </div>

              {/* Assign To — domain-filtered, grouped by department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                <select name="assignedToId" className="input">
                  <option value="">— Unassigned —</option>
                  {grouped.map(({ dept, members }) => (
                    <optgroup key={dept} label={dept}>
                      {members.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}{u.position ? ` — ${u.position}` : ''}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  Only Technical, Marine Operations, Management and Shipyard staff shown.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" className="input resize-none" rows={3} placeholder="Task details…" />
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg font-medium text-sm">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50">
                  {loading ? 'Creating…' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
