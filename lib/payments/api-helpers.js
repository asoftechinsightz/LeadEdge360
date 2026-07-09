import { NextResponse } from 'next/server'
import { requireAuthenticatedTenant } from '@/lib/tenant'
import { requirePlan } from '@/lib/billing/require-plan'

export const PAYMENT_PLANS = ['GROWTH', 'PRO', 'BUSINESS_GROWTH', 'ENTERPRISE']

export async function guardPaymentRequest(req) {
  const tenant = await requireAuthenticatedTenant(req)
  await requirePlan(tenant.orgId, PAYMENT_PLANS)
  return tenant
}

export function paymentError(error) {
  const status = error.message === 'UNAUTHORIZED' ? 401 : (error.message?.includes('PLAN') ? 403 : 500)
  return NextResponse.json({ success: false, error: error.message }, { status })
}
