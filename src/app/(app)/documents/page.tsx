import { getSession, getUserVesselIds } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatDate, formatStatus, formatBytes } from '@/lib/utils'
import Link from 'next/link'
import { FolderOpen } from 'lucide-react'

export default async function AllDocumentsPage() {
  const session = await getSession()
  if (!session) return null

  const vesselIds =
    session.role === 'ADMIN'
      ? (await prisma.vessel.findMany({ where: { companyId: session.companyId! }, select: { id: true } })).map((v) => v.id)
      : await getUserVesselIds(session.id)

  const documents = await prisma.document.findMany({
    where: { vesselId: { in: vesselIds } },
    include: { vessel: { select: { id: true, name: true } } },
    orderBy: [{ category: 'asc' }, { uploadedAt: 'desc' }],
    take: 100,
  })

  const now = new Date()
  const grouped = documents.reduce<Record<string, typeof documents>>((acc, d) => {
    const key = formatStatus(d.category)
    if (!acc[key]) acc[key] = []
    acc[key].push(d)
    return acc
  }, {})

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6 space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Documents</h1>

      {Object.entries(grouped).map(([category, docs]) => (
        <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50 rounded-t-xl">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{category}</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {docs.map((d) => {
              const expired = d.expiryDate && new Date(d.expiryDate) < now
              return (
                <a key={d.id} href={d.fileUrl} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-sm flex-shrink-0">
                    {d.fileType?.includes('pdf') ? '📄' : '📁'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{d.title}</p>
                    <p className="text-xs text-gray-400">{d.vessel?.name} · {formatBytes(d.fileSize)}</p>
                  </div>
                  {expired && <span className="text-xs text-red-500 flex-shrink-0">Expired</span>}
                </a>
              )
            })}
          </div>
        </div>
      ))}

      {documents.length === 0 && (
        <div className="text-center py-16">
          <FolderOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No documents yet</p>
        </div>
      )}
    </div>
  )
}
