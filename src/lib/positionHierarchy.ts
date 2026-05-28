// Maritime Organizational Position Hierarchy
// Higher rank = more authority / seniority

export type PositionGroup =
  | 'Shore Management'
  | 'Vessel Command'
  | 'Deck Department'
  | 'Engine Department'
  | 'General Crew'

export type PositionEntry = {
  label: string
  rank: number
  group: PositionGroup
}

export const POSITIONS: PositionEntry[] = [
  // ── Shore Management ─────────────────────────────────────────────
  { label: 'Managing Director',        rank: 100, group: 'Shore Management' },
  { label: 'Technical Director',       rank: 95,  group: 'Shore Management' },
  { label: 'Operations Director',      rank: 95,  group: 'Shore Management' },
  { label: 'Technical Manager',        rank: 90,  group: 'Shore Management' },
  { label: 'Operations Manager',       rank: 90,  group: 'Shore Management' },
  { label: 'Technical Superintendent', rank: 85,  group: 'Shore Management' },
  { label: 'Technical Officer',        rank: 80,  group: 'Shore Management' },

  // ── Vessel Command ────────────────────────────────────────────────
  { label: 'Master',                   rank: 75,  group: 'Vessel Command' },

  // ── Deck Department ───────────────────────────────────────────────
  { label: 'Chief Officer',            rank: 65,  group: 'Deck Department' },
  { label: 'Second Officer',           rank: 55,  group: 'Deck Department' },
  { label: 'Third Officer',            rank: 45,  group: 'Deck Department' },
  { label: 'Bosun',                    rank: 30,  group: 'Deck Department' },
  { label: 'Able Seaman',              rank: 20,  group: 'Deck Department' },
  { label: 'Ordinary Seaman',          rank: 15,  group: 'Deck Department' },
  { label: 'Deck Cadet',               rank: 10,  group: 'Deck Department' },

  // ── Engine Department ─────────────────────────────────────────────
  { label: 'Chief Engineer',           rank: 65,  group: 'Engine Department' },
  { label: 'Second Engineer',          rank: 55,  group: 'Engine Department' },
  { label: 'Third Engineer',           rank: 45,  group: 'Engine Department' },
  { label: 'Fourth Engineer',          rank: 35,  group: 'Engine Department' },
  { label: 'Electrician',              rank: 40,  group: 'Engine Department' },
  { label: 'Motorman',                 rank: 28,  group: 'Engine Department' },
  { label: 'Oiler',                    rank: 20,  group: 'Engine Department' },
  { label: 'Engine Cadet',             rank: 10,  group: 'Engine Department' },

  // ── General Crew ─────────────────────────────────────────────────
  { label: 'Cook',                     rank: 18,  group: 'General Crew' },
  { label: 'Steward',                  rank: 15,  group: 'General Crew' },
]

export const POSITION_GROUPS: PositionGroup[] = [
  'Shore Management',
  'Vessel Command',
  'Deck Department',
  'Engine Department',
  'General Crew',
]

const SHORE_GROUPS = new Set<PositionGroup>(['Shore Management'])

export function getPositionEntry(position: string | null | undefined): PositionEntry | undefined {
  if (!position) return undefined
  return POSITIONS.find((p) => p.label === position)
}

export function getPositionRank(position: string | null | undefined): number {
  return getPositionEntry(position)?.rank ?? 50
}

export function isShorePosition(position: string | null | undefined): boolean {
  const entry = getPositionEntry(position)
  return entry ? SHORE_GROUPS.has(entry.group) : false
}

/**
 * Can this assigner assign a task to this target user?
 *
 * Rules:
 *  - ADMIN role          → always yes (system access overrides hierarchy)
 *  - Shore position      → yes to everyone (Technical Manager, Superintendent, etc.)
 *  - No position set     → yes to everyone (backward compatibility)
 *  - Master              → yes to all vessel crew (rank < 75); no to shore
 *  - Other vessel ranks  → yes only to equal or lower vessel rank; no to shore
 */
export function canAssignTo(
  assignerRole: string,
  assignerPosition: string | null | undefined,
  targetPosition: string | null | undefined,
): boolean {
  if (assignerRole === 'ADMIN') return true
  if (!assignerPosition) return true
  if (isShorePosition(assignerPosition)) return true
  // Vessel assigner cannot assign to shore staff
  if (isShorePosition(targetPosition)) return false
  // Unknown/no target position: show (don't block)
  if (!targetPosition) return true
  // Vessel-to-vessel: must have equal or higher rank
  return getPositionRank(assignerPosition) >= getPositionRank(targetPosition)
}

/** Sort a list of users by position rank descending (highest first) */
export function sortByRank<T extends { position: string | null }>(users: T[]): T[] {
  return [...users].sort(
    (a, b) => getPositionRank(b.position) - getPositionRank(a.position),
  )
}
