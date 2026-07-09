import { NextResponse } from 'next/server'
import { requireAuthenticatedTenant } from '@/lib/tenant'
import { requirePlan } from '@/lib/billing/require-plan'
import { guardFeatureSoft, blockedBySoftGate, softGatePayload } from '@/lib/subscription/gate'
import { requireRole } from '@/lib/rbac'

const WHATSAPP_PLANS = ['STARTER', 'GROWTH', 'BUSINESS_GROWTH', 'PROFESSIONAL', 'PRO', 'ENTERPRISE']

export async function guardWhatsAppRequest(req, { feature = 'whatsapp_pro', permission = 'crm', soft = true } = {}) {
  const tenant = await requireAuthenticatedTenant(req)
  await requirePlan(tenant.orgId, WHATSAPP_PLANS)

  let gate = null
  if (feature) {
    const ctx = await guardFeatureSoft(tenant, feature)
    gate = ctx.gate
    if (!soft && blockedBySoftGate(gate)) {
      const err = new Error('PLAN_UPGRADE_REQUIRED')
      err.status = 403
      err.gate = gate
      throw err
    }
  }

  if (permission) {
    requireRole(tenant.user, null, permission)
  }

  return { ...tenant, gate }
}

export function whatsAppError(error) {
  if (error.gate) {
    return NextResponse.json(softGatePayload(error.gate), { status: 200 })
  }
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
