import { hasRoleAccess } from '@/lib/billing/check-role'

const ROLE_ALIASES = {
  admin: 'ORG_ADMIN',
  manager: 'SALES_MANAGER',
  user: 'SALES_EXECUTIVE',
  agent: 'SALES_EXECUTIVE',
  superadmin: 'SUPER_ADMIN',
  finance: 'FINANCE',
  partner: 'PARTNER',
}

export function normalizeRole(role) {
  const key = String(role || '').toLowerCase()
  return ROLE_ALIASES[key] || String(role || '').toUpperCase()
}

export function requireRole(user, allowedRoles = null, permission = null) {
  if (!user) {
    const err = new Error('UNAUTHORIZED')
    err.status = 401
    throw err
  }

  const role = normalizeRole(user.role)

  if (allowedRoles?.length) {
    const normalized = allowedRoles.map((r) => normalizeRole(r))
    if (!normalized.includes(role) && role !== 'SUPER_ADMIN') {
      const err = new Error('FORBIDDEN')
      err.status = 403
      throw err
    }
    return true
  }

  if (permission && !hasRoleAccess(role, permission)) {
    const err = new Error('FORBIDDEN')
    err.status = 403
    throw err
  }

  return true
}
