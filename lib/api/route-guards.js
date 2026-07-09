import { guardCrmRequest, crmError } from '@/lib/crm/api-helpers'
import { guardRevenueRequest, revenueError } from '@/lib/revenue/api-helpers'
import { requirePlan } from '@/lib/billing/require-plan'

export const PROPOSAL_PLANS = ['GROWTH', 'PRO', 'BUSINESS_GROWTH', 'ENTERPRISE']

export async function guardProposalRequest(req, options = {}) {
  const tenant = await guardCrmRequest(req, options)
  await requirePlan(tenant.orgId, PROPOSAL_PLANS)
  return tenant
}

export { guardCrmRequest, crmError, guardRevenueRequest, revenueError }
