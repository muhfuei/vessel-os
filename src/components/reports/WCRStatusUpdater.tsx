'use client'

import { updateWCRStatusAction } from '@/app/actions/reports'
import { useState } from 'react'

const STATUSES = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'VERIFIED', label: 'Verified' },
  { value: 'CLOSED', label: 'Closed' },
]

export default function WCRStatusUpdater({
  wcrId,
  vesselId,
  currentStatus,
}: {
  wcrId: string
  vesselId: string
  currentStatus: string
}) {
  const [selected, setSelected] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  async function handleChange(s: string) {
    if (s === selected) return
    setLoading(true)
    setSelected(s)
    await updateWCRStatusAction(wcrId, s, vesselId)
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Report Status</p>
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => handleChange(value)}
            disabled={loading}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              selected === value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
