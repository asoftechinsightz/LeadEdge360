import { NextResponse } from 'next/server'
import { requireAuthenticatedTenant } from '@/lib/tenant'
import { requirePlan } from '@/lib/billing/require-plan'
import { requireRole } from '@/lib/rbac'
import { REVENUE_PLANS } from '@/lib/revenue/service'

export async function guardRevenueRequest(req, { permission = 'revenue' } = {}) {
  const tenant = await requireAuthenticatedTenant(req)
  await requirePlan(tenant.orgId, REVENUE_PLANS)
  requireRole(tenant.user, null, permission)
  return tenant
}

export function revenueError(error) {
  const status = error.message === 'UNAUTHORIZED'
    ? 401
    : (error.message === 'FORBIDDEN'
      ? 403
      : (error.message?.includes('PLAN') || error.message?.includes('SUBSCRIPTION') ? 403 : 500))
  return NextResponse.json({ success: false, error: error.message }, { status })
}
