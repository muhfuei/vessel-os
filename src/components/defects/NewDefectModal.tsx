'use client'

import { useState, useRef } from 'react'
import { createDefectAction } from '@/app/actions/defects'
import { Plus, X } from 'lucide-react'

type Props = {
  vesselId: string
  equipment: { id: string; name: string }[]
}

export default function NewDefectModal({ vesselId, equipment }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.set('vesselId', vesselId)
    await createDefectAction(formData)
    setOpen(false)
    formRef.current?.reset()
    setLoading(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Raise Defect
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-full lg:max-w-lg bg-white rounded-t-2xl lg:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="font-semibold text-gray-900">Raise Defect</h2>
              <button onClick={() => setOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Defect Title *</label>
                <input name="title" required className="input" placeholder="Brief description of defect" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity *</label>
                  <select name="severity" className="input" required>
                    <option value="NON_CRITICAL">Non-Critical</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input name="location" className="input" placeholder="e.g. Engine Room" />
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" className="input resize-none" rows={4}
                  placeholder="Describe the defect in detail — symptoms, conditions observed…" />
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg font-medium text-sm">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-red-700 disabled:opacity-50">
                  {loading ? 'Submitting…' : 'Raise Defect'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
