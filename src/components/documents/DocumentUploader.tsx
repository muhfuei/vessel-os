'use client'

import { useRef, useState } from 'react'
import { Upload, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'

const CATEGORIES = ['MANUAL', 'PROCEDURE', 'CERTIFICATE', 'CALIBRATION', 'SERVICE_REPORT', 'SURVEY_REPORT', 'DRAWING', 'INSURANCE', 'OTHER']

export default function DocumentUploader({ vesselId }: { vesselId: string }) {
  const [expanded, setExpanded] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!file) return
    setUploading(true)
    const formData = new FormData(e.currentTarget)
    formData.set('vesselId', vesselId)
    formData.set('file', file)
    await fetch('/api/documents/upload', { method: 'POST', body: formData })
    setFile(null)
    setDone(true)
    setExpanded(false)
    formRef.current?.reset()
    setUploading(false)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Upload className="w-4 h-4 text-blue-600" />
          Upload Document
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <form ref={formRef} onSubmit={handleSubmit} className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Document Title *</label>
              <input name="title" required className="input text-sm" placeholder="e.g. ISM Certificate" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <select name="category" className="input text-sm">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Revision</label>
              <input name="revision" className="input text-sm" placeholder="e.g. 1.0" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Expiry Date</label>
              <input name="expiryDate" type="date" className="input text-sm" />
            </div>
          </div>

          <div
            className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-blue-300 transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            {file ? (
              <p className="text-sm text-gray-700">{file.name}</p>
            ) : (
              <>
                <Upload className="w-5 h-5 text-gray-300 mx-auto mb-1" />
                <p className="text-sm text-gray-400">Tap to select file</p>
              </>
            )}
            <input ref={inputRef} type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>

          <button
            type="submit"
            disabled={uploading || !file}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
          {done && <p className="text-sm text-green-600 text-center">Uploaded!</p>}
        </form>
      )}
    </div>
  )
}
