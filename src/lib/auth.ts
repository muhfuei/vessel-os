import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { prisma } from './db'

function getSecret(): Uint8Array {
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) throw new Error('JWT_SECRET environment variable is not set')
  return new TextEncoder().encode(jwtSecret)
}

const COOKIE_NAME = 'vessel_os_session'

export type SessionUser = {
  id: string
  name: string
  email: string
  role: string
  companyId: string | null  // null for SUPER_ADMIN (platform-level, no company)
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(getSecret())

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null
    const { payload } = await jwtVerify(token, getSecret())
    return payload as unknown as SessionUser
  } catch {
    return null
  }
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  return session
}

/** Company-level admin (ADMIN role). SUPER_ADMIN cannot call company actions. */
export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireAuth()
  if (session.role !== 'ADMIN') throw new Error('Forbidden')
  return session
}

/** Platform-level Super Admin only. */
export async function requireSuperAdmin(): Promise<SessionUser> {
  const session = await requireAuth()
  if (session.role !== 'SUPER_ADMIN') throw new Error('Forbidden: Super Admin only')
  return session
}

export async function getUserVesselIds(userId: string): Promise<string[]> {
  const accesses = await prisma.vesselUserAccess.findMany({
    where: { userId },
    select: { vesselId: true },
  })
  return accesses.map((a) => a.vesselId)
}
