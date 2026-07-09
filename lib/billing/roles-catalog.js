import { ROLES } from './roles'

export const ROLE_DESCRIPTIONS = {
  SUPER_ADMIN: 'Platform super administrator',
  ORG_ADMIN: 'Tenant administrator',
  SALES_MANAGER: 'Sales manager',
  SALES_EXECUTIVE: 'Sales executive',
  FINANCE: 'Finance — invoices and revenue',
  PARTNER: 'Partner — referrals and commissions',
}

/** Canonical roles list for admin UI and API */
export function getRolesCatalog() {
  return Object.entries(ROLES).map(([name, permissions]) => ({
    name,
    description: ROLE_DESCRIPTIONS[name] || name,
    permissions,
  }))
}
