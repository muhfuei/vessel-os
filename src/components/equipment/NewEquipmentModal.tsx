'use client'

import { useState, useRef } from 'react'
import { createEquipmentAction } from '@/app/actions/equipment'
import { Plus, X } from 'lucide-react'
import { EQUIPMENT_REGISTRY, CATEGORY_KEYS } from '@/lib/equipmentRegistry'

export default function NewEquipmentModal({ vesselId }: { vesselId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [categoryKey, setCategoryKey] = useState('')
  const [typeName, setTypeName] = useState('')
  const [trackHours, setTrackHours] = useState(false)
  const [customName, setCustomName] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const category = categoryKey ? EQUIPMENT_REGISTRY[categoryKey] : null
  const typeObj = category?.types.find(t => t.name === typeName)

  function handleCategoryChange(key: string) {
    setCategoryKey(key)
    setTypeName('')
    setTrackHours(false)
    setCustomName(false)
  }

  function handleTypeChange(name: string) {
    if (name === '__custom__') {
      setCustomName(true)
      setTypeName('')
      setTrackHours(false)
      return
    }
    setCustomName(false)
    setTypeName(name)
    const t = EQUIPMENT_REGISTRY[categoryKey]?.types.find(t => t.name === name)
    setTrackHours(t?.trackHours ?? false)
  }

  function handleClose() {
    setOpen(false)
    setCategoryKey('')
    setTypeName('')
    setTrackHours(false)
    setCustomName(false)
    formRef.current?.reset()
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    fd.set('vesselId', vesselId)
    fd.set('system', category?.label ?? fd.get('system') as string)
    fd.set('trackHours', trackHours ? 'true' : 'false')
    await createEquipmentAction(fd)
    handleClose()
    setLoading(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
      >
        <Plus className="w-4 h-4" /> Add Equipment
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
          <div className="relative w-full lg:max-w-xl bg-white rounded-t-2xl lg:rounded-2xl shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-semibold text-gray-900">Add Equipment</h2>
              <button onClick={handleClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="p-5 space-y-4">

              {/* Step 1 — Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Step 1 — Select Category
                </label>
                <select
                  value={categoryKey}
                  onChange={e => handleCategoryChange(e.target.value)}
                  className="input"
                  required
                >
                  <option value="">— Select category —</option>
                  {CATEGORY_KEYS.map(key => {
                    const cat = EQUIPMENT_REGISTRY[key]
                    return (
                      <option key={key} value={key}>
                        {cat.label}
                      </option>
                    )
                  })}
                </select>
              </div>

              {/* Step 2 — Equipment Type */}
              {category && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Step 2 — Select Equipment Type
                  </label>
                  <select
                    value={customName ? '__custom__' : typeName}
                    onChange={e => handleTypeChange(e.target.value)}
                    className="input"
                    required
                  >
                    <option value="">— Select type —</option>
                    {category.types.map(t => (
                      <option key={t.name} value={t.name}>{t.name}</option>
                    ))}
                    <option value="__custom__">Other (enter manually)</option>
                  </select>
                </div>
              )}

              {/* Equipment name — auto-filled or manual */}
              {(typeName || customName) && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Equipment Name *{!customName && <span className="text-gray-400 font-normal"> (auto-filled — edit if needed)</span>}
                    </label>
                    <input
                      name="name"
                      required
                      defaultValue={typeName}
                      key={typeName}
                      className="input"
                      placeholder="e.g. Main Engine No. 1"
                    />
                  </div>

                  {/* Hidden system field */}
                  <input type="hidden" name="system" value={category?.label ?? ''} />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Brand / Manufacturer</label>
                      <input name="manufacturer" className="input" placeholder="e.g. Cummins" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Model</label>
                      <input name="model" className="input" placeholder="e.g. KTA50" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Serial Number</label>
                      <input name="serialNumber" className="input" placeholder="Serial no." />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Part Number</label>
                      <input name="partNumber" className="input" placeholder="Part no." />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                    <textarea name="description" className="input resize-none" rows={2} placeholder="Optional description" />
                  </div>

                  {/* Running Hours */}
                  <div className="border border-gray-100 rounded-xl p-3 space-y-3 bg-gray-50">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={trackHours}
                        onChange={e => setTrackHours(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600"
                      />
                      <span className="text-sm font-medium text-gray-700">Track Running Hours</span>
                      {typeObj?.trackHours && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">Recommended</span>
                      )}
                    </label>
                    {trackHours ? (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Current Running Hours</label>
                        <input
                          name="hoursUsed"
                          type="number"
                          min="0"
                          step="0.1"
                          className="input"
                          placeholder="e.g. 12500"
                        />
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 pl-6">Running hours: N/A (not applicable)</p>
                    )}
                  </div>
                </>
              )}

              <div className="pt-1 flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || (!typeName && !customName)}
                  className="flex-1 bg-blue-700 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-blue-800 disabled:opacity-50 transition-colors"
                >
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
