import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client.ts'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database…')

  // Company
  const company = await prisma.company.upsert({
    where: { id: 'company-ajang' },
    update: {},
    create: {
      id: 'company-ajang',
      name: 'Ajang Shipping Sdn Bhd',
      address: 'Lot 234, Jalan Krokop, Miri, Sarawak 98000, Malaysia',
      email: 'info@ajangshipping.com',
      phone: '+60 85 000000',
    },
  })

  // Admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ajangshipping.com' },
    update: {},
    create: {
      name: 'Ahmad Razif',
      email: 'admin@ajangshipping.com',
      password: adminPassword,
      position: 'Technical Manager',
      department: 'Technical',
      role: 'ADMIN',
      companyId: company.id,
    },
  })

  // Regular user
  const userPassword = await bcrypt.hash('user123', 10)
  const user1 = await prisma.user.upsert({
    where: { email: 'captain@ajangshipping.com' },
    update: {},
    create: {
      name: 'Abdul Rahman',
      email: 'captain@ajangshipping.com',
      password: userPassword,
      position: 'Captain / Master',
      department: 'Deck',
      role: 'USER',
      companyId: company.id,
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'ce@ajangshipping.com' },
    update: {},
    create: {
      name: 'Halmujni A. Ali',
      email: 'ce@ajangshipping.com',
      password: userPassword,
      position: 'Chief Engineer',
      department: 'Engineering',
      role: 'USER',
      companyId: company.id,
    },
  })

  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@ajangshipping.com' },
    update: {},
    create: {
      name: 'Siti Nora',
      email: 'viewer@ajangshipping.com',
      password: userPassword,
      position: 'Technical Superintendent',
      department: 'Technical',
      role: 'VIEWER',
      companyId: company.id,
    },
  })

  // Vessel — Ajang Haidah (from real class survey document)
  const vessel = await prisma.vessel.upsert({
    where: { imoNumber: '9478171' },
    update: {},
    create: {
      name: 'Ajang Haidah',
      imoNumber: '9478171',
      callSign: '9WHM2',
      flag: 'Malaysia',
      portOfRegistry: 'Kuching',
      officialNumber: '332917',
      vesselType: 'OFFSHORE_SUPPORT',
      status: 'ACTIVE',
      classSociety: 'RINA',
      classNumber: '101331',
      classStatus: 'FULL',
      lastSurveyDate: new Date('2026-03-04'),
      nextSurveyDate: new Date('2027-03-04'),
      yearBuilt: '2008',
      grossTonnage: '3364',
      mainEngine: 'Cummins KTA50',
      companyId: company.id,
    },
  })

  // Second vessel
  const vessel2 = await prisma.vessel.upsert({
    where: { imoNumber: '9100001' },
    update: {},
    create: {
      name: 'Ajang Kemaman',
      imoNumber: '9100001',
      flag: 'Malaysia',
      vesselType: 'WORKBOAT',
      status: 'UNDER_REPAIR',
      classSociety: 'BV',
      yearBuilt: '2012',
      mainEngine: 'Caterpillar C18',
      companyId: company.id,
    },
  })

  // Vessel access
  await prisma.vesselUserAccess.upsert({
    where: { userId_vesselId: { userId: user1.id, vesselId: vessel.id } },
    update: {},
    create: { userId: user1.id, vesselId: vessel.id },
  })
  await prisma.vesselUserAccess.upsert({
    where: { userId_vesselId: { userId: user2.id, vesselId: vessel.id } },
    update: {},
    create: { userId: user2.id, vesselId: vessel.id },
  })
  await prisma.vesselUserAccess.upsert({
    where: { userId_vesselId: { userId: viewer.id, vesselId: vessel.id } },
    update: {},
    create: { userId: viewer.id, vesselId: vessel.id },
  })

  // Equipment
  const mainEngine = await prisma.equipment.create({
    data: {
      name: 'Main Engine',
      system: 'Engines',
      manufacturer: 'Cummins',
      model: 'KTA50',
      serialNumber: 'KTA50-2B694691',
      description: 'Main propulsion engine, 1500HP',
      hoursUsed: 12500,
      status: 'OPERATIONAL',
      vesselId: vessel.id,
    },
  })

  const generator = await prisma.equipment.create({
    data: {
      name: 'Generator No. 1',
      system: 'Generators',
      manufacturer: 'Cummins',
      model: 'QSK19',
      description: '250kW ship service generator',
      hoursUsed: 8200,
      status: 'OPERATIONAL',
      vesselId: vessel.id,
    },
  })

  const crane = await prisma.equipment.create({
    data: {
      name: 'Deck Crane',
      system: 'Deck Machinery',
      manufacturer: 'Heila',
      model: 'HLRM 20-4S',
      description: '20T SWL hydraulic crane',
      status: 'OPERATIONAL',
      vesselId: vessel.id,
    },
  })

  const fireAlarm = await prisma.equipment.create({
    data: {
      name: 'Fire Alarm Panel',
      system: 'Safety',
      manufacturer: 'Autronica',
      model: 'BAS-200',
      description: 'Main fire detection and alarm system',
      status: 'OPERATIONAL',
      vesselId: vessel.id,
    },
  })

  // Maintenance Tasks
  const now = new Date()

  await prisma.maintenanceTask.create({
    data: {
      title: '250-Hour Engine Service',
      taskCode: 'PM1',
      category: 'Engine',
      priority: 'HIGH',
      status: 'PENDING',
      dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
      dueHours: 12750,
      description: 'Perform 250-hour scheduled service on main engine. Replace filters, check belt tension, inspect injectors.',
      vesselId: vessel.id,
      equipmentId: mainEngine.id,
      assignedToId: user2.id,
    },
  })

  await prisma.maintenanceTask.create({
    data: {
      title: 'Annual Generator Maintenance',
      taskCode: 'PM2',
      category: 'Generator',
      priority: 'NORMAL',
      status: 'IN_PROGRESS',
      dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      description: 'Annual service of ship service generator. Replace fuel filters, oil change, load test.',
      vesselId: vessel.id,
      equipmentId: generator.id,
      assignedToId: user2.id,
    },
  })

  await prisma.maintenanceTask.create({
    data: {
      title: 'Crane ILO Annual Inspection',
      taskCode: 'OM1',
      category: 'Deck Machinery',
      priority: 'CRITICAL',
      status: 'PENDING',
      dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      description: 'Annual load test and inspection of deck crane as per RINA Class requirement.',
      vesselId: vessel.id,
      equipmentId: crane.id,
    },
  })

  await prisma.maintenanceTask.create({
    data: {
      title: 'Fire Alarm Panel Monthly Check',
      taskCode: 'PM1',
      category: 'Safety',
      priority: 'HIGH',
      status: 'PENDING',
      dueDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days overdue
      description: 'Monthly test of fire alarm system, smoke detectors, and heat detectors.',
      vesselId: vessel.id,
      equipmentId: fireAlarm.id,
      assignedToId: user2.id,
    },
  })

  await prisma.maintenanceTask.create({
    data: {
      title: 'Hull Cleaning & Anti-fouling Inspection',
      taskCode: 'OM2',
      category: 'Hull',
      priority: 'NORMAL',
      status: 'COMPLETED',
      dueDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      completedAt: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000),
      description: 'In-water hull cleaning and inspection of anti-fouling coating.',
      vesselId: vessel.id,
    },
  })

  // Defects
  const defect1 = await prisma.defect.create({
    data: {
      title: 'Main Engine Lube Oil Contaminated by Diesel Fuel',
      description: 'During routine engine room inspection, diesel fuel contamination was detected in the engine lubricating oil system. Abnormal exhaust smoke was observed and oil level at dipstick was abnormally high. No abnormal exhaust during engine operation.',
      location: 'Engine Room',
      severity: 'CRITICAL',
      status: 'VERIFIED',
      actionTaken: 'Contaminated engine oil was fully drained. New lubricating oil was refilled and maintained at recommended operating level. Engine oil level and condition closely monitored. Fuel supply valve closed. Material request raised for injector replacement.',
      remarks: 'Closed. Oil and filter replaced. System flushed and engine tested running normally.',
      vesselId: vessel.id,
      equipmentId: mainEngine.id,
      raisedById: user1.id,
      closedAt: new Date('2025-06-16'),
    },
  })

  const defect2 = await prisma.defect.create({
    data: {
      title: 'Port Navigation Light Defective',
      description: 'Port side navigation light (red) not functioning. Bulb appeared burned out during night check.',
      location: 'Bridge Wings',
      severity: 'NON_CRITICAL',
      status: 'IN_PROGRESS',
      actionTaken: 'Replacement bulb ordered. Temporary arrangement with battery-powered backup light.',
      vesselId: vessel.id,
      raisedById: user1.id,
    },
  })

  const defect3 = await prisma.defect.create({
    data: {
      title: 'Generator No. 1 Fuel Filter Blocked',
      description: 'Generator No. 1 showing high fuel filter differential pressure alarm. Filter requires replacement.',
      location: 'Engine Room',
      severity: 'NON_CRITICAL',
      status: 'WAITING_MATERIAL',
      actionTaken: 'Filter replacement ordered. Generator running on reduced load pending filter arrival.',
      vesselId: vessel.id,
      equipmentId: generator.id,
      raisedById: user2.id,
    },
  })

  // Certificates (from real RINA class survey document)
  const certData = [
    { title: 'Class Certificate', abbreviation: 'CLASS', type: 'CLASS' as const, issued: '2024-07-23', expires: '2028-12-04' },
    { title: 'International Load Line', abbreviation: 'ILL H', type: 'CLASS' as const, issued: '2024-07-23', expires: '2028-12-04' },
    { title: 'Cargo Ship Safety Construction', abbreviation: 'SC H', type: 'STATUTORY' as const, issued: '2024-07-23', expires: '2028-12-04' },
    { title: 'Cargo Ship Safety Equipment', abbreviation: 'SE H', type: 'STATUTORY' as const, issued: '2025-03-27', expires: '2028-12-04' },
    { title: 'Cargo Ship Safety Radio', abbreviation: 'SR H', type: 'STATUTORY' as const, issued: '2024-07-23', expires: '2028-12-04' },
    { title: 'ISM Safety Management Certificate', abbreviation: 'SMC', type: 'STATUTORY' as const, issued: '2024-07-23', expires: '2029-03-24' },
    { title: 'Maritime Labour Convention', abbreviation: 'MLC', type: 'STATUTORY' as const, issued: '2024-01-10', expires: '2028-09-02' },
    { title: 'International Ship Security Certificate', abbreviation: 'ISSC', type: 'STATUTORY' as const, issued: '2024-07-23', expires: '2029-03-24' },
    { title: 'International Oil Pollution Prevention', abbreviation: 'IOPP', type: 'STATUTORY' as const, issued: '2024-07-23', expires: '2028-12-04' },
    { title: 'International Ballast Water Management', abbreviation: 'IBWM', type: 'STATUTORY' as const, issued: '2024-07-23', expires: '2028-12-04' },
    { title: 'Lifting Appliances', abbreviation: 'L.A.', type: 'STATUTORY' as const, issued: '2021-05-05', expires: '2030-03-26' },
  ]

  for (const c of certData) {
    await prisma.certificate.create({
      data: {
        title: c.title,
        abbreviation: c.abbreviation,
        type: c.type,
        status: 'FULL',
        issuedDate: new Date(c.issued),
        expiryDate: new Date(c.expires),
        vesselId: vessel.id,
      },
    })
  }

  // Work Completion Report
  const wcr = await prisma.workCompletionReport.create({
    data: {
      reportNumber: 'WCR-V003-001',
      title: 'Main Engine Lube Oil Contamination — Close Out',
      description: 'Work completion report for critical defect TCD/1 & TCD/3 — Main engine lubricating oil diesel fuel contamination.',
      workDone: 'Contaminated engine oil fully drained and disposed. New lubricating oil refilled to recommended level. Oil and filter replacement carried out. Fuel injection system inspected. Engine operated and tested — running normally. Oil level and condition monitoring continued for 48 hours post-repair.',
      remarks: 'Closed. Oil and Filter replaced, system flushed and engine tested running normally.',
      completedDate: new Date('2025-06-16'),
      verifiedDate: new Date('2025-06-16'),
      status: 'CLOSED',
      vesselId: vessel.id,
      defectId: defect1.id,
      createdById: user1.id,
    },
  })

  console.log('✅ Seed complete!')
  console.log('')
  console.log('Login credentials:')
  console.log('  Admin:   admin@ajangshipping.com / admin123')
  console.log('  User:    captain@ajangshipping.com / user123')
  console.log('  Engineer: ce@ajangshipping.com / user123')
  console.log('  Viewer:  viewer@ajangshipping.com / user123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
