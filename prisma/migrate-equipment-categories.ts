import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// Map old system values → new category labels
const CATEGORY_MAP: Record<string, string> = {
  'Engines':        'Propulsion & Main Machinery',
  'Generators':     'Auxiliary Machinery',
  'Deck Machinery': 'Deck Machinery & Cargo Handling',
  'Safety':         'Fire Fighting Appliances (FFA)',
  'Navigation':     'Navigation & Communication',
  'Pumps':          'Auxiliary Machinery',
  'HVAC':           'HVAC & Accommodation',
  'Hull':           'Hull, Structural & Safety Systems',
  'Electrical':     'Electrical & Instrumentation',
  'Other':          'Other',
}

async function main() {
  console.log('Migrating equipment categories…')

  for (const [oldSystem, newSystem] of Object.entries(CATEGORY_MAP)) {
    const result = await prisma.equipment.updateMany({
      where: { system: oldSystem },
      data: { system: newSystem },
    })
    if (result.count > 0) {
      console.log(`  "${oldSystem}" → "${newSystem}" (${result.count} records)`)
    }
  }

  console.log('Done.')
}

main().catch(console.error).finally(() => prisma.$disconnect())
