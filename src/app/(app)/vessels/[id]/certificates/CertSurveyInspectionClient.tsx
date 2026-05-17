'use client'

import { useState, useTransition } from 'react'
import { Award, ClipboardList, Search, Plus, X, ChevronDown, ChevronUp, Trash2, CheckCircle, Pencil } from 'lucide-react'
import { formatDate, statusColor, formatStatus } from '@/lib/utils'
import {
  createSurveyAction, updateSurveyAction, deleteSurveyAction,
  createInspectionAction, updateInspectionAction, closeInspectionAction, deleteInspectionAction,
  createDeficiencyAction, updateDeficiencyStatusAction, deleteDeficiencyAction,
  createPunchItemAction, updatePunchItemStatusAction, deletePunchItemAction,
} from '@/app/actions/inspections'
import {
  createCertificateAction, updateCertificateAction, deleteCertificateAction,
} from '@/app/actions/certificates'

// ── Types ─────────────────────────────────────────────────────────────────────

type Cert = {
  id: string; title: string; abbreviation: string | null; type: string; status: string
  issuedDate: Date | null; expiryDate: Date | null; nextSurvey: Date | null; remarks: string | null
}
type Survey = {
  id: string; type: string; status: string; dueDate: Date | null
  completedDate: Date | null; surveyor: string | null; surveySociety: string | null
  place: string | null; remarks: string | null
}
type Deficiency = {
  id: string; code: string; system: string; description: string
  regulatoryRef: string | null; riskLevel: string; correctiveAction: string | null; status: string
}
type PunchItem = {
  id: string; code: string; location: string | null; description: string
  department: string; priority: string; status: string
}
type Inspection = {
  id: string; inspectionType: string; inspectorName: string | null
  inspectorRole: string | null; inspectionDate: Date; port: string | null
  status: string; remarks: string | null
  deficiencies: Deficiency[]; punchItems: PunchItem[]
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CERT_TYPES = ['CLASS', 'STATUTORY', 'TRADING', 'CALIBRATION', 'OTHER']
const CERT_STATUSES = ['FULL', 'CONDITIONAL', 'EXPIRED', 'SUSPENDED', 'WITHDRAWN']
const SURVEY_TYPES = ['ANNUAL', 'INTERMEDIATE', 'SPECIAL', 'DOCKING', 'CONTINUOUS', 'RENEWAL']
const SURVEY_STATUSES = ['DUE', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE']
const INSPECTION_TYPES = ['CLIENT_VETTING', 'INTERNAL_SUPERINTENDENT', 'PRE_PSC', 'PORT_STATE_CONTROL', 'FLAG_STATE', 'ISM_AUDIT', 'CLASS_SURVEY']
const SYSTEMS = ['LSA', 'FFA', 'MARPOL', 'Navigation', 'Propulsion', 'Auxiliary Machinery', 'Deck Machinery', 'Hull', 'Electrical', 'HVAC', 'Other']
const DEPARTMENTS = ['Deck', 'Engine', 'Catering', 'General']

const RISK_COLORS: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-700 ring-1 ring-red-300',
  MEDIUM: 'bg-orange-100 text-orange-700',
  LOW: 'bg-yellow-100 text-yellow-700',
}
const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-700', HIGH: 'bg-orange-100 text-orange-700',
  NORMAL: 'bg-blue-100 text-blue-700', LOW: 'bg-gray-100 text-gray-600',
}

function toDateInput(d: Date | null | undefined) {
  if (!d) return ''
  return new Date(d).toISOString().split('T')[0]
}

// ── Tab Bar ───────────────────────────────────────────────────────────────────

function TabBar({ active, onChange, counts }: {
  active: string; onChange: (t: string) => void
  counts: { certs: number; surveys: number; inspections: number }
}) {
  const tabs = [
    { key: 'certs', label: 'Certificates', icon: Award, count: counts.certs },
    { key: 'surveys', label: 'Surveys', icon: ClipboardList, count: counts.surveys },
    { key: 'inspections', label: 'Inspections', icon: Search, count: counts.inspections },
  ]
  return (
    <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
      {tabs.map(({ key, label, icon: Icon, count }) => (
        <button key={key} onClick={() => onChange(key)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all ${active === key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline">{label}</span>
          {count > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${active === key ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'}`}>{count}</span>}
        </button>
      ))}
    </div>
  )
}

// ── Shared Modal Shell ────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

function ModalActions({ onClose, pending, submitLabel, submitColor = 'blue' }: {
  onClose: () => void; pending: boolean; submitLabel: string; submitColor?: string
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-700 hover:bg-blue-800', red: 'bg-red-600 hover:bg-red-700', orange: 'bg-orange-600 hover:bg-orange-700',
  }
  return (
    <div className="flex gap-2 pt-1">
      <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
      <button type="submit" disabled={pending} className={`flex-1 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 transition-colors ${colors[submitColor]}`}>
        {pending ? 'Saving…' : submitLabel}
      </button>
    </div>
  )
}

// ── Certificate Modals ────────────────────────────────────────────────────────

function CertModal({ vesselId, cert, onClose }: { vesselId: string; cert?: Cert; onClose: () => void }) {
  const [pending, startTransition] = useTransition()
  const isEdit = !!cert

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('vesselId', vesselId)
    startTransition(async () => {
      if (isEdit) await updateCertificateAction(fd)
      else await createCertificateAction(fd)
      onClose()
    })
  }

  return (
    <Modal title={isEdit ? 'Edit Certificate' : 'Add Certificate'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-5 space-y-3">
        {isEdit && <input type="hidden" name="id" value={cert.id} />}
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Certificate Title *</label>
            <input name="title" required defaultValue={cert?.title ?? ''} className="input" placeholder="e.g. Class Certificate" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Abbreviation</label>
            <input name="abbreviation" defaultValue={cert?.abbreviation ?? ''} className="input" placeholder="e.g. CLASS" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
            <select name="type" defaultValue={cert?.type ?? 'STATUTORY'} className="input">
              {CERT_TYPES.map(t => <option key={t} value={t}>{formatStatus(t)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select name="status" defaultValue={cert?.status ?? 'FULL'} className="input">
              {CERT_STATUSES.map(s => <option key={s} value={s}>{formatStatus(s)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Issued Date</label>
            <input name="issuedDate" type="date" defaultValue={toDateInput(cert?.issuedDate)} className="input" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Expiry Date</label>
            <input name="expiryDate" type="date" defaultValue={toDateInput(cert?.expiryDate)} className="input" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Remarks</label>
            <textarea name="remarks" rows={2} defaultValue={cert?.remarks ?? ''} className="input resize-none" />
          </div>
        </div>
        <ModalActions onClose={onClose} pending={pending} submitLabel={isEdit ? 'Save Changes' : 'Add Certificate'} />
      </form>
    </Modal>
  )
}

// ── Survey Modals ─────────────────────────────────────────────────────────────

function SurveyModal({ vesselId, survey, onClose }: { vesselId: string; survey?: Survey; onClose: () => void }) {
  const [pending, startTransition] = useTransition()
  const isEdit = !!survey

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('vesselId', vesselId)
    startTransition(async () => {
      if (isEdit) await updateSurveyAction(fd)
      else await createSurveyAction(fd)
      onClose()
    })
  }

  return (
    <Modal title={isEdit ? 'Edit Survey' : 'Add Survey'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-5 space-y-3">
        {isEdit && <input type="hidden" name="id" value={survey.id} />}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Survey Type *</label>
            <select name="type" required defaultValue={survey?.type ?? 'ANNUAL'} className="input">
              {SURVEY_TYPES.map(t => <option key={t} value={t}>{formatStatus(t)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select name="status" defaultValue={survey?.status ?? 'DUE'} className="input">
              {SURVEY_STATUSES.map(s => <option key={s} value={s}>{formatStatus(s)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Due Date</label>
            <input name="dueDate" type="date" defaultValue={toDateInput(survey?.dueDate)} className="input" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Completed Date</label>
            <input name="completedDate" type="date" defaultValue={toDateInput(survey?.completedDate)} className="input" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Survey Society</label>
            <input name="surveySociety" defaultValue={survey?.surveySociety ?? ''} className="input" placeholder="RINA, BV, LR…" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Surveyor</label>
            <input name="surveyor" defaultValue={survey?.surveyor ?? ''} className="input" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Place</label>
            <input name="place" defaultValue={survey?.place ?? ''} className="input" placeholder="Port / Yard" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Remarks</label>
            <textarea name="remarks" rows={2} defaultValue={survey?.remarks ?? ''} className="input resize-none" />
          </div>
        </div>
        <ModalActions onClose={onClose} pending={pending} submitLabel={isEdit ? 'Save Changes' : 'Add Survey'} />
      </form>
    </Modal>
  )
}

// ── Inspection Modals ─────────────────────────────────────────────────────────

function InspectionModal({ vesselId, inspection, onClose }: { vesselId: string; inspection?: Inspection; onClose: () => void }) {
  const [pending, startTransition] = useTransition()
  const isEdit = !!inspection

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('vesselId', vesselId)
    startTransition(async () => {
      if (isEdit) await updateInspectionAction(fd)
      else await createInspectionAction(fd)
      onClose()
    })
  }

  return (
    <Modal title={isEdit ? 'Edit Inspection' : 'New Inspection Report'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-5 space-y-3">
        {isEdit && <input type="hidden" name="id" value={inspection.id} />}
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Inspection Type *</label>
            <select name="inspectionType" required defaultValue={inspection?.inspectionType ?? ''} className="input">
              <option value="">— Select —</option>
              {INSPECTION_TYPES.map(t => <option key={t} value={t}>{formatStatus(t)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Inspection Date *</label>
            <input name="inspectionDate" type="date" required defaultValue={toDateInput(inspection?.inspectionDate) || new Date().toISOString().split('T')[0]} className="input" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Port / Location</label>
            <input name="port" defaultValue={inspection?.port ?? ''} className="input" placeholder="e.g. Port Klang" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Inspector Name</label>
            <input name="inspectorName" defaultValue={inspection?.inspectorName ?? ''} className="input" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Inspector Role</label>
            <input name="inspectorRole" defaultValue={inspection?.inspectorRole ?? ''} className="input" placeholder="e.g. PSC Officer" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Remarks</label>
            <textarea name="remarks" rows={2} defaultValue={inspection?.remarks ?? ''} className="input resize-none" />
          </div>
        </div>
        <ModalActions onClose={onClose} pending={pending} submitLabel={isEdit ? 'Save Changes' : 'Create Report'} />
      </form>
    </Modal>
  )
}

// ── Add Deficiency Modal ──────────────────────────────────────────────────────

function AddDeficiencyModal({ inspectionId, vesselId, onClose }: { inspectionId: string; vesselId: string; onClose: () => void }) {
  const [pending, startTransition] = useTransition()
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('inspectionId', inspectionId); fd.set('vesselId', vesselId)
    startTransition(async () => { await createDeficiencyAction(fd); onClose() })
  }
  return (
    <Modal title="Add Deficiency Report" onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-5 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">System *</label>
            <select name="system" required className="input">
              <option value="">— Select —</option>
              {SYSTEMS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Risk Level</label>
            <select name="riskLevel" defaultValue="MEDIUM" className="input">
              <option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Description *</label>
            <textarea name="description" required rows={3} className="input resize-none" placeholder="Exact detail of the non-conformity…" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Regulatory Reference</label>
            <input name="regulatoryRef" className="input" placeholder="e.g. SOLAS Ch II-2 Reg 10, MARPOL Annex I" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Corrective Action Required</label>
            <textarea name="correctiveAction" rows={2} className="input resize-none" />
          </div>
        </div>
        <ModalActions onClose={onClose} pending={pending} submitLabel="Add Deficiency" submitColor="red" />
      </form>
    </Modal>
  )
}

// ── Add Punch List Modal ──────────────────────────────────────────────────────

function AddPunchModal({ inspectionId, vesselId, onClose }: { inspectionId: string; vesselId: string; onClose: () => void }) {
  const [pending, startTransition] = useTransition()
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('inspectionId', inspectionId); fd.set('vesselId', vesselId)
    startTransition(async () => { await createPunchItemAction(fd); onClose() })
  }
  return (
    <Modal title="Add Punch List Item" onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-5 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Location / Area</label>
            <input name="location" className="input" placeholder="e.g. Main Deck, Engine Room" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Department *</label>
            <select name="department" required className="input">
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Description *</label>
            <textarea name="description" required rows={3} className="input resize-none" placeholder="Detail of the maintenance/cosmetic issue…" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
            <select name="priority" defaultValue="NORMAL" className="input">
              <option value="HIGH">High</option><option value="NORMAL">Normal</option><option value="LOW">Low</option>
            </select>
          </div>
        </div>
        <ModalActions onClose={onClose} pending={pending} submitLabel="Add Item" submitColor="orange" />
      </form>
    </Modal>
  )
}

// ── Inspection Card ───────────────────────────────────────────────────────────

function InspectionCard({ inspection, vesselId, isAdmin, canEdit }: {
  inspection: Inspection; vesselId: string; isAdmin: boolean; canEdit: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const [addDR, setAddDR] = useState(false)
  const [addPL, setAddPL] = useState(false)
  const [editing, setEditing] = useState(false)
  const [, startTransition] = useTransition()

  const openDR = inspection.deficiencies.filter(d => d.status !== 'CLOSED').length
  const openPL = inspection.punchItems.filter(p => p.status !== 'CLOSED').length

  const act = (fn: () => Promise<unknown>) => startTransition(async () => { await fn() })

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-gray-900">{formatStatus(inspection.inspectionType)}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${inspection.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {inspection.status}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {formatDate(inspection.inspectionDate)}{inspection.port ? ` · ${inspection.port}` : ''}
              {inspection.inspectorName ? ` · ${inspection.inspectorName}` : ''}
              {inspection.inspectorRole ? ` (${inspection.inspectorRole})` : ''}
            </p>
            <div className="flex gap-3 mt-1.5">
              {inspection.deficiencies.length > 0 && <span className="text-xs text-red-600 font-medium">{openDR} DR open / {inspection.deficiencies.length} total</span>}
              {inspection.punchItems.length > 0 && <span className="text-xs text-orange-600 font-medium">{openPL} PL open / {inspection.punchItems.length} total</span>}
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {isAdmin && (
              <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          {canEdit && (
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setAddDR(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Deficiency Report
              </button>
              <button onClick={() => setAddPL(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 border border-orange-200 text-xs font-medium text-orange-700 hover:bg-orange-100 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Punch List Item
              </button>
              {inspection.status === 'OPEN' && (
                <button onClick={() => act(() => closeInspectionAction(inspection.id, vesselId))} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors">
                  <CheckCircle className="w-3.5 h-3.5" /> Close Inspection
                </button>
              )}
              {isAdmin && (
                <button onClick={() => { if (confirm('Delete this inspection report and all items?')) act(() => deleteInspectionAction(inspection.id, vesselId)) }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs font-medium text-gray-500 hover:bg-gray-100 transition-colors ml-auto">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              )}
            </div>
          )}

          {/* Deficiency Reports */}
          {inspection.deficiencies.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Deficiency Reports</p>
              <div className="space-y-2">
                {inspection.deficiencies.map(dr => (
                  <div key={dr.id} className={`rounded-lg border p-3 ${dr.status === 'CLOSED' ? 'opacity-60 border-gray-100 bg-gray-50' : 'border-red-100 bg-red-50/30'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-red-700">{dr.code}</span>
                        <span className="text-xs text-gray-500">{dr.system}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${RISK_COLORS[dr.riskLevel]}`}>{dr.riskLevel}</span>
                        {dr.status === 'CLOSED' && <span className="text-xs text-green-600 font-medium">✓ Closed</span>}
                      </div>
                      {canEdit && (
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => act(() => updateDeficiencyStatusAction(dr.id, dr.status === 'CLOSED' ? 'OPEN' : 'CLOSED', vesselId))}
                            className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-500 hover:bg-gray-100">
                            {dr.status === 'CLOSED' ? 'Reopen' : 'Close'}
                          </button>
                          {isAdmin && (
                            <button onClick={() => act(() => deleteDeficiencyAction(dr.id, vesselId))}
                              className="text-xs px-2 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-700 mt-1">{dr.description}</p>
                    {dr.regulatoryRef && <p className="text-xs text-blue-600 mt-0.5">Ref: {dr.regulatoryRef}</p>}
                    {dr.correctiveAction && <p className="text-xs text-gray-500 mt-0.5 italic">Action: {dr.correctiveAction}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Punch List */}
          {inspection.punchItems.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Punch List / Snag List</p>
              <div className="space-y-2">
                {inspection.punchItems.map(pl => (
                  <div key={pl.id} className={`rounded-lg border p-3 ${pl.status === 'CLOSED' ? 'opacity-60 border-gray-100 bg-gray-50' : 'border-orange-100 bg-orange-50/30'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-orange-700">{pl.code}</span>
                        {pl.location && <span className="text-xs text-gray-500">{pl.location}</span>}
                        <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{pl.department}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${PRIORITY_COLORS[pl.priority]}`}>{pl.priority}</span>
                        {pl.status === 'CLOSED' && <span className="text-xs text-green-600 font-medium">✓ Closed</span>}
                      </div>
                      {canEdit && (
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => act(() => updatePunchItemStatusAction(pl.id, pl.status === 'CLOSED' ? 'OPEN' : 'CLOSED', vesselId))}
                            className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-500 hover:bg-gray-100">
                            {pl.status === 'CLOSED' ? 'Reopen' : 'Close'}
                          </button>
                          {isAdmin && (
                            <button onClick={() => act(() => deletePunchItemAction(pl.id, vesselId))}
                              className="text-xs px-2 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-700 mt-1">{pl.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {inspection.deficiencies.length === 0 && inspection.punchItems.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No items yet. Add Deficiency Reports or Punch List items above.</p>
          )}
        </div>
      )}

      {editing && <InspectionModal vesselId={vesselId} inspection={inspection} onClose={() => setEditing(false)} />}
      {addDR && <AddDeficiencyModal inspectionId={inspection.id} vesselId={vesselId} onClose={() => setAddDR(false)} />}
      {addPL && <AddPunchModal inspectionId={inspection.id} vesselId={vesselId} onClose={() => setAddPL(false)} />}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function CertSurveyInspectionClient({
  vesselId, certs, surveys, inspections, isAdmin, canEdit,
}: {
  vesselId: string; certs: Cert[]; surveys: Survey[]; inspections: Inspection[]
  isAdmin: boolean; canEdit: boolean
}) {
  const [tab, setTab] = useState('certs')
  const [addCert, setAddCert] = useState(false)
  const [editCert, setEditCert] = useState<Cert | null>(null)
  const [addSurvey, setAddSurvey] = useState(false)
  const [editSurvey, setEditSurvey] = useState<Survey | null>(null)
  const [addInspection, setAddInspection] = useState(false)
  const [, startTransition] = useTransition()
  const now = new Date()

  const act = (fn: () => Promise<unknown>) => startTransition(async () => { await fn() })

  return (
    <>
      <TabBar active={tab} onChange={setTab} counts={{ certs: certs.length, surveys: surveys.length, inspections: inspections.length }} />

      {/* ── Certificates ── */}
      {tab === 'certs' && (
        <div className="space-y-3">
          {isAdmin && (
            <div className="flex justify-end">
              <button onClick={() => setAddCert(true)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-700 text-white text-sm font-medium hover:bg-blue-800 transition-colors">
                <Plus className="w-4 h-4" /> Add Certificate
              </button>
            </div>
          )}
          {certs.map(c => {
            const expired = c.expiryDate && new Date(c.expiryDate) < now
            const days = c.expiryDate ? Math.ceil((new Date(c.expiryDate).getTime() - now.getTime()) / 86400000) : null
            return (
              <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{c.title}</p>
                    {c.abbreviation && <p className="text-xs text-gray-400">{c.abbreviation}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(c.status)}`}>{formatStatus(c.status)}</span>
                    {isAdmin && (
                      <>
                        <button onClick={() => setEditCert(c)} className="p-1 rounded hover:bg-gray-100 text-gray-400"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => { if (confirm('Delete this certificate?')) act(() => deleteCertificateAction(c.id, vesselId)) }}
                          className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      </>
                    )}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <div><p className="text-xs text-gray-400">Issued</p><p className="text-xs font-medium text-gray-700">{formatDate(c.issuedDate)}</p></div>
                  <div><p className="text-xs text-gray-400">Expires</p><p className={`text-xs font-medium ${expired ? 'text-red-600' : 'text-gray-700'}`}>{formatDate(c.expiryDate)}</p></div>
                  <div>
                    <p className="text-xs text-gray-400">Days Left</p>
                    <p className={`text-xs font-bold ${expired ? 'text-red-600' : days !== null && days <= 90 ? 'text-orange-600' : 'text-green-600'}`}>
                      {days === null ? '—' : expired ? 'EXPIRED' : `${days}d`}
                    </p>
                  </div>
                </div>
                {c.remarks && <p className="text-xs text-gray-400 mt-2 italic">{c.remarks}</p>}
              </div>
            )
          })}
          {certs.length === 0 && <div className="text-center py-16"><Award className="w-12 h-12 text-gray-200 mx-auto mb-3" /><p className="text-gray-400">No certificates added</p></div>}
        </div>
      )}

      {/* ── Surveys ── */}
      {tab === 'surveys' && (
        <div className="space-y-3">
          {canEdit && (
            <div className="flex justify-end">
              <button onClick={() => setAddSurvey(true)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-700 text-white text-sm font-medium hover:bg-blue-800 transition-colors">
                <Plus className="w-4 h-4" /> Add Survey
              </button>
            </div>
          )}
          {surveys.map(s => {
            const overdue = s.dueDate && new Date(s.dueDate) < now && s.status !== 'COMPLETED'
            const days = s.dueDate ? Math.ceil((new Date(s.dueDate).getTime() - now.getTime()) / 86400000) : null
            return (
              <div key={s.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{formatStatus(s.type)} Survey</p>
                    <p className="text-xs text-gray-400">{[s.surveySociety, s.surveyor, s.place].filter(Boolean).join(' · ')}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(s.status)}`}>{formatStatus(s.status)}</span>
                    {isAdmin && (
                      <>
                        <button onClick={() => setEditSurvey(s)} className="p-1 rounded hover:bg-gray-100 text-gray-400"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => { if (confirm('Delete this survey record?')) act(() => deleteSurveyAction(s.id, vesselId)) }}
                          className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      </>
                    )}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <div><p className="text-xs text-gray-400">Due Date</p><p className={`text-xs font-medium ${overdue ? 'text-red-600' : 'text-gray-700'}`}>{formatDate(s.dueDate)}</p></div>
                  <div><p className="text-xs text-gray-400">Completed</p><p className="text-xs font-medium text-gray-700">{formatDate(s.completedDate) || '—'}</p></div>
                  <div>
                    <p className="text-xs text-gray-400">Days Left</p>
                    <p className={`text-xs font-bold ${overdue ? 'text-red-600' : days !== null && days <= 30 ? 'text-orange-600' : 'text-green-600'}`}>
                      {s.status === 'COMPLETED' ? '✓ Done' : days === null ? '—' : overdue ? 'OVERDUE' : `${days}d`}
                    </p>
                  </div>
                </div>
                {s.remarks && <p className="text-xs text-gray-400 mt-2 italic">{s.remarks}</p>}
              </div>
            )
          })}
          {surveys.length === 0 && <div className="text-center py-16"><ClipboardList className="w-12 h-12 text-gray-200 mx-auto mb-3" /><p className="text-gray-400">No surveys recorded</p></div>}
        </div>
      )}

      {/* ── Inspections ── */}
      {tab === 'inspections' && (
        <div className="space-y-3">
          {canEdit && (
            <div className="flex justify-end">
              <button onClick={() => setAddInspection(true)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-700 text-white text-sm font-medium hover:bg-blue-800 transition-colors">
                <Plus className="w-4 h-4" /> New Inspection Report
              </button>
            </div>
          )}
          {inspections.map(i => (
            <InspectionCard key={i.id} inspection={i} vesselId={vesselId} isAdmin={isAdmin} canEdit={canEdit} />
          ))}
          {inspections.length === 0 && <div className="text-center py-16"><Search className="w-12 h-12 text-gray-200 mx-auto mb-3" /><p className="text-gray-400">No inspections recorded</p></div>}
        </div>
      )}

      {addCert && <CertModal vesselId={vesselId} onClose={() => setAddCert(false)} />}
      {editCert && <CertModal vesselId={vesselId} cert={editCert} onClose={() => setEditCert(null)} />}
      {addSurvey && <SurveyModal vesselId={vesselId} onClose={() => setAddSurvey(false)} />}
      {editSurvey && <SurveyModal vesselId={vesselId} survey={editSurvey} onClose={() => setEditSurvey(null)} />}
      {addInspection && <InspectionModal vesselId={vesselId} onClose={() => setAddInspection(false)} />}
    </>
  )
}
