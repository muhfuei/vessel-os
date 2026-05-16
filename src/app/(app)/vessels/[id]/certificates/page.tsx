import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { formatDate, statusColor, formatStatus } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, Award } from 'lucide-react'

export default async function CertificatesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session) return null

  const vessel = await prisma.vessel.findUnique({ where: { id }, select: { id: true, name: true } })
  if (!vessel) notFound()

  const certs = await prisma.certificate.findMany({
    where: { vesselId: id },
    orderBy: [{ expiryDate: 'asc' }],
  })

  const now = new Date()

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6 space-y-4">
      <div>
        <Link href={`/vessels/${id}`} className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-2">
          <ArrowLeft className="w-4 h-4" /> {vessel.name}
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Certificates & Surveys</h1>
      </div>

      <div className="space-y-3">
        {certs.map((c) => {
          const expired = c.expiryDate && new Date(c.expiryDate) < now
          const days = c.expiryDate ? Math.ceil((new Date(c.expiryDate).getTime() - now.getTime()) / 86400000) : null
          return (
            <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{c.title}</p>
                  {c.abbreviation && <p className="text-xs text-gray-400">{c.abbreviation}</p>}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusColor(c.status)}`}>
                  {formatStatus(c.status)}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-gray-400">Issued</p>
                  <p className="text-xs font-medium text-gray-700">{formatDate(c.issuedDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Expires</p>
                  <p className={`text-xs font-medium ${expired ? 'text-red-600' : 'text-gray-700'}`}>
                    {formatDate(c.expiryDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Days Left</p>
                  <p className={`text-xs font-bold ${
                    expired ? 'text-red-600' : days !== null && days <= 30 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {days === null ? '—' : expired ? 'EXPIRED' : `${days}d`}
                  </p>
                </div>
              </div>
              {c.nextSurvey && (
                <div className="mt-2 pt-2 border-t border-gray-50">
                  <p className="text-xs text-gray-400">Next Survey: <span className="text-gray-700">{formatDate(c.nextSurvey)}</span></p>
                </div>
              )}
            </div>
          )
        })}

        {certs.length === 0 && (
          <div className="text-center py-16">
            <Award className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No certificates added</p>
          </div>
        )}
      </div>
    </div>
  )
}
