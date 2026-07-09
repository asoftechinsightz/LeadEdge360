import { NextResponse } from 'next/server'
import { requireAuthenticatedTenant } from '@/lib/tenant'
import { requirePlan } from '@/lib/billing/require-plan'

export const SUBSCRIPTION_PLANS = ['GROWTH', 'PRO', 'BUSINESS_GROWTH', 'ENTERPRISE']

export async function guardSubscriptionRequest(req) {
  const tenant = await requireAuthenticatedTenant(req)
  await requirePlan(tenant.orgId, SUBSCRIPTION_PLANS)
  return tenant
}

export function subscriptionError(error) {
  const status = error.message === 'UNAUTHORIZED'
    ? 401
    : (error.message === 'Subscription not found' ? 404
      : (error.message?.includes('PLAN') || error.message?.includes('SUBSCRIPTION') ? 403 : 500))
  return NextResponse.json({ success: false, error: error.message }, { status })
}
