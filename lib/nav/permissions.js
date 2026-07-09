import { hasRoleAccess } from '@/lib/billing/check-role'
import { normalizeRole } from '@/lib/rbac'
import { PARTNER_NAV_GROUPS } from '@/components/suite/nav-config'

/** Route prefix → required permission (coarse RBAC from roles.js) */
export const ROUTE_PERMISSIONS = {
  '/leads': 'crm',
  '/opportunities': 'crm',
  '/proposals': 'proposals',
  '/invoices': 'invoices',
  '/revenue': 'revenue',
  '/campaigns': 'crm',
  '/growth': 'crm',
  '/partners/dashboard': 'partner_dashboard',
}

export function permissionForHref(href) {
  const entry = Object.entries(ROUTE_PERMISSIONS).find(
    ([path]) => href === path || href.startsWith(`${path}/`),
  )
  return entry?.[1] || null
}

export function canAccessRoute(role, href) {
  const permission = permissionForHref(href)
  if (!permission) return true
  return hasRoleAccess(normalizeRole(role), permission)
}

export function isPartnerRole(role) {
  return normalizeRole(role) === 'PARTNER'
}

export function filterNavGroupsByRole(groups, role) {
  if (!role) return groups
  if (isPartnerRole(role)) {
    return PARTNER_NAV_GROUPS
  }
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canAccessRoute(role, item.href)),
    }))
    .filter((group) => group.items.length > 0)
}
