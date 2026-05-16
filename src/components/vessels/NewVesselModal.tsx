'use client'

import { useState, useRef } from 'react'
import { createVesselAction } from '@/app/actions/vessels'
import { Plus, X } from 'lucide-react'

const VESSEL_TYPES = [
  { value: 'WORKBOAT', label: 'Workboat' },
  { value: 'LANDING_CRAFT', label: 'Landing Craft' },
  { value: 'FAST_CREW_BOAT', label: 'Fast Crew Boat' },
  { value: 'SAFETY_STANDBY', label: 'Safety Standby Vessel' },
  { value: 'OFFSHORE_SUPPORT', label: 'Offshore Support Vessel' },
  { value: 'TUG_BOAT', label: 'Tug Boat' },
  { value: 'BARGE', label: 'Barge' },
  { value: 'CREW_BOAT', label: 'Crew Boat' },
]

export default function NewVesselModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    await createVesselAction(formData)
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
        Add Vessel
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-full lg:max-w-lg bg-white rounded-t-2xl lg:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="font-semibold text-gray-900">New Vessel</h2>
              <button onClick={() => setOpen(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vessel Name *</label>
                <input name="name" required className="input" placeholder="e.g. Ajang Haidah" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vessel Type</label>
                  <select name="vesselType" className="input">
                    {VESSEL_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Flag</label>
                  <input name="flag" className="input" placeholder="e.g. Malaysia" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IMO Number</label>
                  <input name="imoNumber" className="input" placeholder="e.g. 9478171" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Call Sign</label>
                  <input name="callSign" className="input" placeholder="e.g. 9WHM2" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class Society</label>
                  <input name="classSociety" className="input" placeholder="e.g. RINA, DNV" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year Built</label>
                  <input name="yearBuilt" className="input" placeholder="e.g. 2008" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Main Engine</label>
                <input name="mainEngine" className="input" placeholder="e.g. Cummins KTA50" />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Creating…' : 'Create Vessel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
