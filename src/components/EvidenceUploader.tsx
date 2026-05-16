'use client'

import { useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Props = {
  taskId?: string
  defectId?: string
  wcrId?: string
}

export default function EvidenceUploader({ taskId, defectId, wcrId }: Props) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return
    setFiles((prev) => [...prev, ...Array.from(fileList)])
    setDone(false)
  }

  function removeFile(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function handleUpload() {
    if (files.length === 0) return
    setUploading(true)

    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)
      if (taskId) formData.append('taskId', taskId)
      if (defectId) formData.append('defectId', defectId)
      if (wcrId) formData.append('wcrId', wcrId)
      await fetch('/api/evidence/upload', { method: 'POST', body: formData })
    }

    setFiles([])
    setDone(true)
    setUploading(false)
    router.refresh()
  }

  return (
    <div className="space-y-3">
      <div
        className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
      >
        <Upload className="w-6 h-6 text-gray-300 mx-auto mb-1" />
        <p className="text-sm text-gray-400">Tap to upload photos or files</p>
        <p className="text-xs text-gray-300 mt-0.5">JPG, PNG, PDF, DOC up to 20MB</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-sm text-gray-700 flex-1 truncate">{f.name}</span>
              <button onClick={() => removeFile(i)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
          ))}
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {uploading ? 'Uploading…' : `Upload ${files.length} file${files.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      )}

      {done && <p className="text-sm text-green-600 font-medium text-center">Uploaded successfully!</p>}
    </div>
  )
}
