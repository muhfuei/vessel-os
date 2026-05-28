/**
 * Vessel OS — Operational Domain & Permission Architecture
 *
 * Vessel operations do NOT follow simple org-chart hierarchy.
 * Assignment and workflow access is controlled by:
 *   Department + Operational Domain + Workflow Permission
 *
 * A Purchasing Manager must NOT be assignable to an engine repair task.
 * A Master should NOT verify a purchasing workflow.
 * HR should NOT close a machinery defect.
 */

// ── Operational Domains ───────────────────────────────────────────────────────

export type OperationalDomain =
  | 'MANAGEMENT'
  | 'TECHNICAL'
  | 'MARINE_OPERATIONS'
  | 'PURCHASING'
  | 'HR'
  | 'SHIPYARD'
  | 'ADMIN'

export const DOMAIN_LABELS: Record<OperationalDomain, string> = {
  MANAGEMENT:        'Management',
  TECHNICAL:         'Technical',
  MARINE_OPERATIONS: 'Marine Operations',
  PURCHASING:        'Purchasing',
  HR:                'HR & Crewing',
  SHIPYARD:          'Shipyard',
  ADMIN:             'Admin',
}

export const ALL_DOMAINS: OperationalDomain[] = [
  'MANAGEMENT',
  'TECHNICAL',
  'MARINE_OPERATIONS',
  'PURCHASING',
  'HR',
  'SHIPYARD',
  'ADMIN',
]

// ── Departments ───────────────────────────────────────────────────────────────

export const DEPARTMENTS = [
  'Management',
  'Technical',
  'Marine Operations',
  'Purchasing',
  'HR & Crewing',
  'Shipyard',
  'Admin',
] as const

export type Department = (typeof DEPARTMENTS)[number]

// ── Positions ─────────────────────────────────────────────────────────────────

export type PositionEntry = {
  label: string
  department: Department
  defaultDomain: OperationalDomain
}

export const POSITIONS: PositionEntry[] = [
  // Management
  { label: 'Managing Director',        department: 'Management',        defaultDomain: 'MANAGEMENT' },
  { label: 'General Manager',          department: 'Management',        defaultDomain: 'MANAGEMENT' },
  { label: 'DPA',                      department: 'Management',        defaultDomain: 'MANAGEMENT' },

  // Technical — shore
  { label: 'Technical Director',       department: 'Technical',         defaultDomain: 'TECHNICAL' },
  { label: 'Technical Manager',        department: 'Technical',         defaultDomain: 'TECHNICAL' },
  { label: 'Technical Superintendent', department: 'Technical',         defaultDomain: 'TECHNICAL' },
  { label: 'Technical Supervisor',     department: 'Technical',         defaultDomain: 'TECHNICAL' },
  { label: 'Technical Assistant',      department: 'Technical',         defaultDomain: 'TECHNICAL' },

  // Marine Operations — shore
  { label: 'Operations Manager',       department: 'Marine Operations', defaultDomain: 'MARINE_OPERATIONS' },
  { label: 'Marine Superintendent',    department: 'Marine Operations', defaultDomain: 'MARINE_OPERATIONS' },

  // Vessel — Deck
  { label: 'Master',                   department: 'Marine Operations', defaultDomain: 'MARINE_OPERATIONS' },
  { label: 'Chief Officer',            department: 'Marine Operations', defaultDomain: 'MARINE_OPERATIONS' },
  { label: 'Second Officer',           department: 'Marine Operations', defaultDomain: 'MARINE_OPERATIONS' },
  { label: 'Third Officer',            department: 'Marine Operations', defaultDomain: 'MARINE_OPERATIONS' },
  { label: 'Bosun',                    department: 'Marine Operations', defaultDomain: 'MARINE_OPERATIONS' },
  { label: 'Able Seaman',              department: 'Marine Operations', defaultDomain: 'MARINE_OPERATIONS' },
  { label: 'Ordinary Seaman',          department: 'Marine Operations', defaultDomain: 'MARINE_OPERATIONS' },
  { label: 'Deck Cadet',               department: 'Marine Operations', defaultDomain: 'MARINE_OPERATIONS' },
  { label: 'Cook',                     department: 'Marine Operations', defaultDomain: 'MARINE_OPERATIONS' },
  { label: 'Steward',                  department: 'Marine Operations', defaultDomain: 'MARINE_OPERATIONS' },

  // Vessel — Engine
  { label: 'Chief Engineer',           department: 'Technical',         defaultDomain: 'TECHNICAL' },
  { label: 'Second Engineer',          department: 'Technical',         defaultDomain: 'TECHNICAL' },
  { label: 'Third Engineer',           department: 'Technical',         defaultDomain: 'TECHNICAL' },
  { label: 'Fourth Engineer',          department: 'Technical',         defaultDomain: 'TECHNICAL' },
  { label: 'Electrician',              department: 'Technical',         defaultDomain: 'TECHNICAL' },
  { label: 'Motorman',                 department: 'Technical',         defaultDomain: 'TECHNICAL' },
  { label: 'Oiler',                    department: 'Technical',         defaultDomain: 'TECHNICAL' },
  { label: 'Engine Cadet',             department: 'Technical',         defaultDomain: 'TECHNICAL' },

  // Purchasing
  { label: 'Purchasing Manager',       department: 'Purchasing',        defaultDomain: 'PURCHASING' },
  { label: 'Procurement Officer',      department: 'Purchasing',        defaultDomain: 'PURCHASING' },

  // HR & Crewing
  { label: 'HR Manager',               department: 'HR & Crewing',      defaultDomain: 'HR' },
  { label: 'HR Officer',               department: 'HR & Crewing',      defaultDomain: 'HR' },
  { label: 'Crewing Staff',            department: 'HR & Crewing',      defaultDomain: 'HR' },

  // Shipyard
  { label: 'Shipyard Manager',         department: 'Shipyard',          defaultDomain: 'SHIPYARD' },
  { label: 'Shipyard Supervisor',      department: 'Shipyard',          defaultDomain: 'SHIPYARD' },

  // Admin
  { label: 'Admin',                    department: 'Admin',             defaultDomain: 'ADMIN' },
  { label: 'Admin Officer',            department: 'Admin',             defaultDomain: 'ADMIN' },
]

export function getPositionEntry(position: string | null | undefined): PositionEntry | undefined {
  if (!position) return undefined
  return POSITIONS.find((p) => p.label === position)
}

/** Suggest the operational domain based on a selected position */
export function getDefaultDomain(position: string | null | undefined): OperationalDomain | null {
  return getPositionEntry(position)?.defaultDomain ?? null
}

// ── Task-type Domain Access Rules ─────────────────────────────────────────────

/**
 * Domains whose members can be assigned MAINTENANCE / TECHNICAL tasks.
 * HR, Purchasing, and Admin must NOT appear in maintenance task assignment.
 */
export const MAINTENANCE_TASK_DOMAINS = new Set<OperationalDomain>([
  'MANAGEMENT',
  'TECHNICAL',
  'MARINE_OPERATIONS', // Master / C/O handle deck maintenance
  'SHIPYARD',          // Shipyard teams execute repairs
])

/**
 * Domains whose members can be assigned PURCHASING / PROCUREMENT tasks.
 */
export const PURCHASING_TASK_DOMAINS = new Set<OperationalDomain>([
  'MANAGEMENT',
  'PURCHASING',
  'TECHNICAL', // Technical team initiates/approves purchases
])

/**
 * Domains whose members can be assigned MARINE OPERATIONS tasks
 * (navigation, deck ops, bridge equipment, voyage matters).
 */
export const MARINE_OPS_TASK_DOMAINS = new Set<OperationalDomain>([
  'MANAGEMENT',
  'MARINE_OPERATIONS',
])

// ── Filter Helpers ────────────────────────────────────────────────────────────

/**
 * Can a user with this domain be assigned a maintenance / technical task?
 * null domain = unknown (show in list for backward compatibility).
 */
export function canHandleMaintenance(domain: string | null | undefined): boolean {
  if (!domain) return true
  return MAINTENANCE_TASK_DOMAINS.has(domain as OperationalDomain)
}

export function canHandlePurchasing(domain: string | null | undefined): boolean {
  if (!domain) return true
  return PURCHASING_TASK_DOMAINS.has(domain as OperationalDomain)
}

export function canHandleMarineOps(domain: string | null | undefined): boolean {
  if (!domain) return true
  return MARINE_OPS_TASK_DOMAINS.has(domain as OperationalDomain)
}

/** Group a user list by department, preserving DEPARTMENTS order */
export function groupByDepartment<T extends { department: string | null }>(
  users: T[],
): { dept: string; members: T[] }[] {
  const result: { dept: string; members: T[] }[] = []

  // Known departments in display order
  for (const dept of DEPARTMENTS) {
    const members = users.filter((u) => u.department === dept)
    if (members.length > 0) result.push({ dept, members })
  }

  // Users with unrecognised/empty department
  const known = new Set<string>(DEPARTMENTS)
  const other = users.filter((u) => !u.department || !known.has(u.department))
  if (other.length > 0) result.push({ dept: 'Other', members: other })

  return result
}
