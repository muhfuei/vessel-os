import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { formatDate, statusColor, formatStatus } from '@/lib/utils'
import Link from 'next/link'
import { Ship, Wrench, AlertTriangle, FileText, FolderOpen, Award, ChevronRight, ArrowLeft } from 'lucide-react'

export default async function VesselDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session) return null

  const vessel = await prisma.vessel.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          tasks: { where: { status: { notIn: ['COMPLETED', 'VERIFIED', 'CLOSED', 'CANCELLED'] } } },
          defects: { where: { status: { notIn: ['VERIFIED', 'CLOSED'] } } },
          equipment: true,
          documents: true,
          certificates: true,
        },
      },
    },
  })

  if (!vessel) notFound()

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
    { label: 'Class Society', value: vessel.classSociety },
    { label: 'Class Number', value: vessel.classNumber },
    { label: 'Last Survey', value: formatDate(vessel.lastSurveyDate) },
    { label: 'Next Survey', value: formatDate(vessel.nextSurveyDate) },
    { label: 'Main Engine', value: vessel.mainEngine },
    { label: 'Generator', value: vessel.generator },
  ]

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6 space-y-4">
      {/* Back + header */}
      <div>
        <Link href="/vessels" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-3">
          <ArrowLeft className="w-4 h-4" /> Vessels
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{vessel.name}</h1>
            <p className="text-sm text-gray-400">{formatStatus(vessel.vesselType)}</p>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor(vessel.status)}`}>
            {formatStatus(vessel.status)}
          </span>
        </div>
      </div>

      {/* Module tabs */}
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

      {/* Vessel details */}
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
    </div>
  )
}
