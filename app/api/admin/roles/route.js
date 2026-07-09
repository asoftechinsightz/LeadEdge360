export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { requireAuthenticatedTenant } from '@/lib/tenant'
import { getRolesCatalog } from '@/lib/billing/roles-catalog'
import { requireRole } from '@/lib/rbac'

export async function GET(req) {
  try {
    const tenant = await requireAuthenticatedTenant(req)
    requireRole(tenant.user, ['SUPER_ADMIN', 'ORG_ADMIN', 'admin', 'superadmin'])
    return NextResponse.json({ success: true, roles: getRolesCatalog() })
  } catch (error) {
    const status = error.status || (error.message === 'UNAUTHORIZED' ? 401 : 403)
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}
