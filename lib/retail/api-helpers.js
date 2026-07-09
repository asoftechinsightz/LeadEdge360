import { NextResponse } from 'next/server'
import { requireAuthenticatedTenant } from '@/lib/tenant'
import { requirePlan } from '@/lib/billing/require-plan'
import { hasFeatureForOrg } from '@/lib/billing/check-feature'
import { requireRole } from '@/lib/rbac'

/** Plans that may access RetailEdge360 APIs (raw + canonical codes). */
export const RETAIL_PLANS = [
  // Legacy lead-tier names (still used on some orgs)
  'BUSINESS_GROWTH', 'GROWTH', 'PROFESSIONAL', 'PRO', 'ENTERPRISE',
  // V5 retail / suite checkout IDs
  'retail-business', 'retail-enterprise', 'business-suite', 'enterprise-business-suite',
  // Canonical plan codes
  'RETAIL_BUSINESS', 'RETAIL_ENTERPRISE', 'SUITE_BUSINESS', 'SUITE_ENTERPRISE',
  'LEAD_BUSINESS', 'LEAD_ENTERPRISE',
]

export async function guardRetailRequest(req, { feature = 'retail_inventory', permission = 'crm' } = {}) {
  const tenant = await requireAuthenticatedTenant(req)
  await requirePlan(tenant.orgId, RETAIL_PLANS)

  if (feature) {
    const allowed = await hasFeatureForOrg(tenant.orgId, feature)
    if (!allowed) {
      const err = new Error('PLAN_UPGRADE_REQUIRED')
      err.status = 403
      throw err
    }
  }

  if (permission) {
    requireRole(tenant.user, null, permission)
  }

  return tenant
}

export function retailError(error) {
  const status = error.status
    || (error.message === 'UNAUTHORIZED' ? 401
      : (error.message === 'FORBIDDEN' ? 403
        : (error.message?.includes('PLAN') ? 403
          : (error.message === 'NOT_FOUND' ? 404
            : (error.message === 'VALIDATION_FAILED' ? 400 : 500)))))
  return NextResponse.json(
    { success: false, code: error.message, message: error.detail || error.message },
    { status },
  )
}
