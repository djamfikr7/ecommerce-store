import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import type { Session } from 'next-auth'
import type { UserRole } from '@/types/auth'
import { UnauthorizedError } from '@/lib/errors/auth'

export interface AuthGuardResult {
  authenticated: boolean
  userId?: string
  userRole?: UserRole
  email?: string
  session?: Session
}

export async function checkAuth(): Promise<AuthGuardResult> {
  const session = await auth()

  if (!session?.user) {
    return { authenticated: false }
  }

  return {
    authenticated: true,
    userId: session.user.id,
    userRole: session.user.role,
    email: session.user.email,
    session,
  }
}

export async function requireAuth(): Promise<{
  userId: string
  userRole: UserRole
  email: string
  session: Session
}> {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  return {
    userId: session.user.id,
    userRole: session.user.role,
    email: session.user.email,
    session,
  }
}

export async function requireAuthOrRedirect(callbackUrl?: string): Promise<{
  userId: string
  userRole: UserRole
  email: string
}> {
  const result = await checkAuth()

  if (!result.authenticated) {
    const loginUrl = callbackUrl
      ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : '/login'
    redirect(loginUrl)
  }

  return {
    userId: result.userId!,
    userRole: result.userRole!,
    email: result.email!,
  }
}

export async function requireRole(role: UserRole): Promise<{
  userId: string
  userRole: UserRole
  email: string
  session: Session
}> {
  const { userId, userRole, email, session } = await requireAuth()

  if (userRole !== role) {
    throw new UnauthorizedError(`access this resource (requires ${role})`)
  }

  return { userId, userRole, email, session }
}

export async function requireRoleOrRedirect(
  roles: UserRole[],
  callbackUrl?: string,
): Promise<{
  userId: string
  userRole: UserRole
  email: string
}> {
  const result = await requireAuthOrRedirect(callbackUrl)

  if (!roles.includes(result.userRole)) {
    redirect('/')
  }

  return result
}

export async function requireAdmin(): Promise<{
  userId: string
  userRole: UserRole
  email: string
  session: Session
}> {
  const { userId, userRole, email, session } = await requireAuth()

  if (userRole !== 'ADMIN' && userRole !== 'SUPERADMIN') {
    throw new UnauthorizedError('access admin resources')
  }

  return { userId, userRole, email, session }
}

export async function requireAdminOrRedirect(): Promise<{
  userId: string
  userRole: UserRole
  email: string
}> {
  return requireRoleOrRedirect(['ADMIN', 'SUPERADMIN'])
}

export function isAuthorizedRole(
  userRole: UserRole | undefined,
  allowedRoles: UserRole[],
): boolean {
  if (!userRole) return false
  return allowedRoles.includes(userRole)
}

export function isAdminRole(role: UserRole | undefined): boolean {
  return isAuthorizedRole(role, ['ADMIN', 'SUPERADMIN'])
}
