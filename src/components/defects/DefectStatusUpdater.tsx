'use client'

import { updateDefectStatusAction } from '@/app/actions/defects'
import { useState } from 'react'

const STATUSES = ['OPEN', 'IN_PROGRESS', 'WAITING_MATERIAL', 'WAITING_SERVICE', 'COMPLETED', 'VERIFIED', 'CLOSED']
const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  WAITING_MATERIAL: 'Waiting Material',
  WAITING_SERVICE: 'Waiting Service',
  COMPLETED: 'Completed',
  VERIFIED: 'Verified',
  CLOSED: 'Closed',
}

export default function DefectStatusUpdater({
  defectId,
  vesselId,
  currentStatus,
  currentAction,
}: {
  defectId: string
  vesselId: string
  currentStatus: string
  currentAction: string
}) {
  const [selected, setSelected] = useState(currentStatus)
  const [action, setAction] = useState(currentAction)
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    setLoading(true)
    await updateDefectStatusAction(defectId, selected, action, vesselId)
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Update Status</p>
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setSelected(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              selected === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Action Taken</label>
        <textarea
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={2}
          placeholder="Describe what action was taken…"
        />
      </div>
      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Saving…' : 'Save Update'}
      </button>
    </div>
  )
}
