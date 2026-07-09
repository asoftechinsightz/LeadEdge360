export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { requireAuthenticatedTenant } from '@/lib/tenant'
import { getDb } from '@/lib/mongo'
import { PLAN_FEATURES } from '@/lib/billing/plan-features'
import { getSubscription } from '@/lib/billing/get-subscription'

function normalizePlan(code) {
  const aliases = { GROWTH: 'BUSINESS_GROWTH', PRO: 'ENTERPRISE' }
  return aliases[code] || code
}

export async function GET(req) {
  try {
    const tenant = await requireAuthenticatedTenant(req)
    const db = await getDb()
    const subscription = await getSubscription(tenant.orgId)
    const planCode = normalizePlan(subscription?.planCode || 'STARTER')
    const features = PLAN_FEATURES[planCode] || []
    const org = await db.collection('orgs').findOne(
      { id: tenant.orgId },
      { projection: { _id: 0, name: 1, plan: 1 } },
    )

    return NextResponse.json({
      success: true,
      data: {
        orgId: tenant.orgId,
        orgName: org?.name || tenant.orgId,
        planCode,
        features,
        activeProduct: tenant.user?.activeProduct || 'leadedge360',
      },
    })
  } catch (error) {
    const status = error.message === 'UNAUTHORIZED' ? 401 : 500
    return NextResponse.json(
      { success: false, code: error.message, message: error.detail || error.message },
      { status },
    )
  }
}
