'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Ship, Wrench, AlertTriangle, FileText, FolderOpen, Award, ArrowLeft, Pencil, X } from 'lucide-react'
import { formatDate, statusColor, formatStatus } from '@/lib/utils'
import { updateVesselAction } from '@/app/actions/vessels'

const VESSEL_TYPES = [
  'WORKBOAT', 'LANDING_CRAFT', 'FAST_CREW_BOAT', 'SAFETY_STANDBY',
  'OFFSHORE_SUPPORT', 'TUG_BOAT', 'BARGE', 'CREW_BOAT',
]
const VESSEL_STATUSES = [
  'ACTIVE', 'UNDER_REPAIR', 'DOCKING', 'OFF_HIRE', 'COLD_STACK', 'MOBILIZATION',
]

type Vessel = {
  id: string
  name: string
  imoNumber: string | null
  officialNumber: string | null
  callSign: string | null
  mmsi: string | null
  flag: string | null
  portOfRegistry: string | null
  vesselType: string
  status: string
  classSociety: string | null
  classNumber: string | null
  classStatus: string | null
  lastSurveyDate: Date | null
  nextSurveyDate: Date | null
  yearBuilt: string | null
  builder: string | null
  loa: string | null
  breadth: string | null
  grossTonnage: string | null
  netTonnage: string | null
  deadweight: string | null
  mainEngine: string | null
  generator: string | null
  _count: {
    tasks: number
    defects: number
    equipment: number
    documents: number
    certificates: number
  }
}

function toDateInput(d: Date | null) {
  if (!d) return ''
  return new Date(d).toISOString().split('T')[0]
}

function EditVesselModal({ vessel, onClose }: { vessel: Vessel; onClose: () => void }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await updateVesselAction(fd)
        onClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="font-semibold text-gray-900">Edit Vessel</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <input type="hidden" name="id" value={vessel.id} />

          {/* Basic */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Basic Information</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Vessel Name *</label>
                <input name="name" required defaultValue={vessel.name} className="input" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                <select name="vesselType" defaultValue={vessel.vesselType} className="input">
                  {VESSEL_TYPES.map((t) => <option key={t} value={t}>{formatStatus(t)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select name="status" defaultValue={vessel.status} className="input">
                  {VESSEL_STATUSES.map((s) => <option key={s} value={s}>{formatStatus(s)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">IMO Number</label>
                <input name="imoNumber" defaultValue={vessel.imoNumber ?? ''} className="input" placeholder="9478171" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Official Number</label>
                <input name="officialNumber" defaultValue={vessel.officialNumber ?? ''} className="input" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Call Sign</label>
                <input name="callSign" defaultValue={vessel.callSign ?? ''} className="input" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">MMSI</label>
                <input name="mmsi" defaultValue={vessel.mmsi ?? ''} className="input" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Flag</label>
                <input name="flag" defaultValue={vessel.flag ?? ''} className="input" placeholder="Malaysia" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Port of Registry</label>
                <input name="portOfRegistry" defaultValue={vessel.portOfRegistry ?? ''} className="input" />
              </div>
            </div>
          </div>

          {/* Class */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Classification</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Class Society</label>
                <input name="classSociety" defaultValue={vessel.classSociety ?? ''} className="input" placeholder="RINA" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Class Number</label>
                <input name="classNumber" defaultValue={vessel.classNumber ?? ''} className="input" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Class Status</label>
                <input name="classStatus" defaultValue={vessel.classStatus ?? ''} className="input" placeholder="FULL" />
              </div>
              <div />
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Last Survey Date</label>
                <input name="lastSurveyDate" type="date" defaultValue={toDateInput(vessel.lastSurveyDate)} className="input" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Next Survey Date</label>
                <input name="nextSurveyDate" type="date" defaultValue={toDateInput(vessel.nextSurveyDate)} className="input" />
              </div>
            </div>
          </div>

          {/* Particulars */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Particulars</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Year Built</label>
                <input name="yearBuilt" defaultValue={vessel.yearBuilt ?? ''} className="input" placeholder="2008" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Builder</label>
                <input name="builder" defaultValue={vessel.builder ?? ''} className="input" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Gross Tonnage</label>
                <input name="grossTonnage" defaultValue={vessel.grossTonnage ?? ''} className="input" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Net Tonnage</label>
                <input name="netTonnage" defaultValue={vessel.netTonnage ?? ''} className="input" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Deadweight</label>
                <input name="deadweight" defaultValue={vessel.deadweight ?? ''} className="input" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">LOA (m)</label>
                <input name="loa" defaultValue={vessel.loa ?? ''} className="input" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Breadth (m)</label>
                <input name="breadth" defaultValue={vessel.breadth ?? ''} className="input" />
              </div>
            </div>
          </div>

          {/* Machinery */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Machinery</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Main Engine</label>
                <input name="mainEngine" defaultValue={vessel.mainEngine ?? ''} className="input" placeholder="Cummins KTA50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Generator</label>
                <input name="generator" defaultValue={vessel.generator ?? ''} className="input" />
              </div>
            </div>
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

export default function VesselDetailClient({ vessel, isAdmin }: { vessel: Vessel; isAdmin: boolean }) {
  const [editing, setEditing] = useState(false)
  const id = vessel.id

  const tabs = [
    { href: `/vessels/${id}/tasks`, label: 'Maintenance', icon: Wrench, count: vessel._count.tasks },
    { href: `/vessels/${id}/defects`, label: 'Defects', icon: AlertTriangle, count: vessel._count.defects },
    { href: `/vessels/${id}/equipment`, label: 'Equipment', icon: Ship, count: vessel._count.equipment },
    { href: `/vessels/${id}/documents`, label: 'Documents', icon: FolderOpen, count: vessel._count.documents },
    { href: `/vessels/${id}/certificates`, label: 'Certificates', icon: Award, count: vessel._count.certificates },
    { href: `/vessels/${id}/reports`, label: 'Reports', icon: FileText, count: 0 },
  ]

  const fields = [
    { label: 'IMO Number', value: vessel.imoNumber },
    { label: 'Official Number', value: vessel.officialNumber },
    { label: 'Call Sign', value: vessel.callSign },
    { label: 'MMSI', value: vessel.mmsi },
    { label: 'Flag', value: vessel.flag },
    { label: 'Port of Registry', value: vessel.portOfRegistry },
    { label: 'Year Built', value: vessel.yearBuilt },
    { label: 'Builder', value: vessel.builder },
    { label: 'Gross Tonnage', value: vessel.grossTonnage },
    { label: 'Net Tonnage', value: vessel.netTonnage },
    { label: 'Deadweight', value: vessel.deadweight },
    { label: 'LOA', value: vessel.loa },
    { label: 'Breadth', value: vessel.breadth },
    { label: 'Class Society', value: vessel.classSociety },
    { label: 'Class Number', value: vessel.classNumber },
    { label: 'Class Status', value: vessel.classStatus },
    { label: 'Last Survey', value: formatDate(vessel.lastSurveyDate) },
    { label: 'Next Survey', value: formatDate(vessel.nextSurveyDate) },
    { label: 'Main Engine', value: vessel.mainEngine },
    { label: 'Generator', value: vessel.generator },
  ]

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6 space-y-4">
      <div>
        <Link href="/vessels" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-3">
          <ArrowLeft className="w-4 h-4" /> Vessels
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{vessel.name}</h1>
            <p className="text-sm text-gray-400">{formatStatus(vessel.vesselType)}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor(vessel.status)}`}>
              {formatStatus(vessel.status)}
            </span>
            {isAdmin && (
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
        {tabs.map(({ href, label, icon: Icon, count }) => (
          <Link
            key={href}
            href={href}
            className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center"
          >
            <Icon className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900">{count}</p>
            <p className="text-xs text-gray-400">{label}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-sm">Vessel Information</h2>
        </div>
        <div className="p-4 grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
          {fields.map(({ label, value }) =>
            value ? (
              <div key={label}>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm font-medium text-gray-900">{value}</p>
              </div>
            ) : null
          )}
        </div>
      </div>

      {editing && <EditVesselModal vessel={vessel} onClose={() => setEditing(false)} />}
    </div>
  )
}
