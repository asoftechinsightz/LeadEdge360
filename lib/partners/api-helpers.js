import { NextResponse } from 'next/server'
import { requireAuthenticatedTenant } from '@/lib/tenant'
import { requirePlan } from '@/lib/billing/require-plan'
import { requireRole, normalizeRole } from '@/lib/rbac'
import { PARTNER_PLANS } from '@/lib/partners/service'

export async function guardPartnerRequest(req, { partnerOnly = false } = {}) {
  const tenant = await requireAuthenticatedTenant(req)
  await requirePlan(tenant.orgId, [...PARTNER_PLANS, 'BUSINESS_GROWTH', 'GROWTH'])
  if (partnerOnly) {
    const role = normalizeRole(tenant.user?.role)
    if (role !== 'SUPER_ADMIN' && role !== 'ORG_ADMIN') {
      requireRole(tenant.user, null, 'partner_dashboard')
    }
  }
  return tenant
}

export function partnerError(error) {
  const status = error.message === 'UNAUTHORIZED' ? 401
    : (error.message?.includes('PLAN') ? 403 : (error.message?.includes('not found') ? 404 : 500))
  return NextResponse.json({ success: false, error: error.message }, { status })
}
