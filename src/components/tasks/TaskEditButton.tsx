'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, X } from 'lucide-react'
import { updateTaskAction, deleteTaskAction } from '@/app/actions/tasks'
import { canHandleMaintenance, groupByDepartment } from '@/lib/operationalDomains'

type UserOption = {
  id: string
  name: string
  position: string | null
  department: string | null
  operationalDomain: string | null
}

type TaskData = {
  id: string
  title: string
  taskCode: string | null
  category: string | null
  priority: string
  dueDate: string | null
  equipmentId: string | null
  assignedToId: string | null
  description: string | null
  notes: string | null
}

type Props = {
  task: TaskData
  vesselId: string
  isAdmin: boolean
  equipment: { id: string; name: string }[]
  users: UserOption[]
}

export default function TaskEditButton({ task, vesselId, isAdmin, equipment, users }: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Filter to users whose domain can handle maintenance/technical tasks
  const eligible = users.filter((u) => canHandleMaintenance(u.operationalDomain))
  const grouped = groupByDepartment(eligible)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('id', task.id)
    formData.set('vesselId', vesselId)
    startTransition(async () => {
      await updateTaskAction(formData)
      setOpen(false)
    })
  }

  function handleDelete() {
    if (!confirm('Delete this task? This cannot be undone.')) return
    startTransition(async () => {
      await deleteTaskAction(task.id, vesselId)
      router.push(`/vessels/${vesselId}/tasks`)
    })
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setOpen(true)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          title="Edit task"
        >
          <Pencil className="w-4 h-4" />
        </button>
        {isAdmin && (
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
            title="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-full lg:max-w-lg bg-white rounded-t-2xl lg:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-semibold text-gray-900">Edit Task</h2>
              <button onClick={() => setOpen(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
                <input name="title" required defaultValue={task.title} className="input" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task Code</label>
                  <input name="taskCode" defaultValue={task.taskCode ?? ''} className="input" placeholder="e.g. PM1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input name="category" defaultValue={task.category ?? ''} className="input" placeholder="e.g. Engine" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Equipment</label>
                <select name="equipmentId" defaultValue={task.equipmentId ?? ''} className="input">
                  <option value="">— General / No equipment —</option>
                  {equipment.map((eq) => (
                    <option key={eq.id} value={eq.id}>{eq.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select name="priority" defaultValue={task.priority} className="input">
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    name="dueDate"
                    type="date"
                    defaultValue={task.dueDate ? task.dueDate.slice(0, 10) : ''}
                    className="input"
                  />
                </div>
              </div>

              {/* Assign To — domain-filtered, grouped by department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                <select name="assignedToId" defaultValue={task.assignedToId ?? ''} className="input">
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
                <textarea
                  name="description"
                  defaultValue={task.description ?? ''}
                  className="input resize-none"
                  rows={3}
                  placeholder="Task details…"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  defaultValue={task.notes ?? ''}
                  className="input resize-none"
                  rows={2}
                  placeholder="Additional notes…"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg font-medium text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={isPending} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50">
                  {isPending ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
