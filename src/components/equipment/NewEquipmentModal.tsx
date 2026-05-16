'use client'

import { useState, useRef } from 'react'
import { createEquipmentAction } from '@/app/actions/equipment'
import { Plus, X } from 'lucide-react'

const SYSTEMS = ['Engines', 'Generators', 'Deck Machinery', 'Navigation', 'Safety', 'Electrical', 'Pumps', 'HVAC', 'Hull', 'Other']

export default function NewEquipmentModal({ vesselId }: { vesselId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.set('vesselId', vesselId)
    await createEquipmentAction(formData)
    setOpen(false)
    formRef.current?.reset()
    setLoading(false)
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
        <Plus className="w-4 h-4" />Add Equipment
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-full lg:max-w-lg bg-white rounded-t-2xl lg:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="font-semibold text-gray-900">Add Equipment</h2>
              <button onClick={() => setOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Name *</label>
                <input name="name" required className="input" placeholder="e.g. Main Engine" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">System</label>
                  <select name="system" className="input">
                    <option value="">— Select system —</option>
                    {SYSTEMS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                  <input name="manufacturer" className="input" placeholder="e.g. Cummins" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <input name="model" className="input" placeholder="e.g. KTA50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                  <input name="serialNumber" className="input" placeholder="Serial no." />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Part Number</label>
                <input name="partNumber" className="input" placeholder="Part no." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" className="input resize-none" rows={2} placeholder="Optional description" />
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg font-medium text-sm">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50">
                  {loading ? 'Adding…' : 'Add Equipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
