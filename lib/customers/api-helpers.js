import { NextResponse } from 'next/server'
import { requireAuthenticatedTenant } from '@/lib/tenant'
import { requirePlan } from '@/lib/billing/require-plan'

export const CUSTOMER_PLANS = ['GROWTH', 'PRO', 'BUSINESS_GROWTH', 'ENTERPRISE']

export async function guardCustomerRequest(req) {
  const tenant = await requireAuthenticatedTenant(req)
  await requirePlan(tenant.orgId, CUSTOMER_PLANS)
  return tenant
}

export function customerError(error) {
  const status = error.message === 'UNAUTHORIZED'
    ? 401
    : (error.message === 'Customer not found' ? 404
      : (error.message?.includes('PLAN') || error.message?.includes('SUBSCRIPTION') ? 403 : 500))
  return NextResponse.json({ success: false, error: error.message }, { status })
}
