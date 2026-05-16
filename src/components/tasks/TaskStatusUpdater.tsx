'use client'

import { updateTaskStatusAction } from '@/app/actions/tasks'
import { useState } from 'react'

const STATUSES = ['PENDING', 'IN_PROGRESS', 'WAITING_MATERIAL', 'WAITING_SERVICE', 'WAITING_APPROVAL', 'COMPLETED', 'VERIFIED', 'CLOSED', 'CANCELLED']

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  WAITING_MATERIAL: 'Waiting Material',
  WAITING_SERVICE: 'Waiting Service',
  WAITING_APPROVAL: 'Waiting Approval',
  COMPLETED: 'Completed',
  VERIFIED: 'Verified',
  CLOSED: 'Closed',
  CANCELLED: 'Cancelled',
}

export default function TaskStatusUpdater({
  taskId,
  vesselId,
  currentStatus,
}: {
  taskId: string
  vesselId: string
  currentStatus: string
}) {
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(currentStatus)

  async function handleChange(newStatus: string) {
    if (newStatus === selected) return
    setLoading(true)
    setSelected(newStatus)
    await updateTaskStatusAction(taskId, newStatus, vesselId)
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Update Status</p>
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => handleChange(s)}
            disabled={loading}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              selected === s
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>
    </div>
  )
}
