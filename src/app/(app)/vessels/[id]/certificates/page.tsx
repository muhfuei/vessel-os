import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import CertSurveyInspectionClient from './CertSurveyInspectionClient'

export default async function CertificatesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session) return null

  const vessel = await prisma.vessel.findUnique({ where: { id }, select: { id: true, name: true } })
  if (!vessel) notFound()

  const [certs, surveys, inspections] = await Promise.all([
    prisma.certificate.findMany({
      where: { vesselId: id },
      orderBy: { expiryDate: 'asc' },
    }),
    prisma.survey.findMany({
      where: { vesselId: id },
      orderBy: { dueDate: 'asc' },
    }),
    prisma.inspection.findMany({
      where: { vesselId: id },
      include: {
        deficiencies: { orderBy: { code: 'asc' } },
        punchItems: { orderBy: { code: 'asc' } },
      },
      orderBy: { inspectionDate: 'desc' },
    }),
  ])

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6 space-y-4">
      <div>
        <Link href={`/vessels/${id}`} className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-2">
          <ArrowLeft className="w-4 h-4" /> {vessel.name}
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Certificates, Surveys & Inspections</h1>
      </div>

      <CertSurveyInspectionClient
        vesselId={id}
        certs={certs}
        surveys={surveys}
        inspections={inspections}
        isAdmin={session.role === 'ADMIN'}
        canEdit={session.role !== 'VIEWER'}
      />
    </div>
  )
}
