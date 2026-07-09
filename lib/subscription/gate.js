import { hasFeatureForOrg } from '@/lib/billing/check-feature'
import { getSubscription } from '@/lib/billing/get-subscription'
import { resolvePlanCode } from '@/lib/billing/plan-map'
import { PLAN_FEATURES } from '@/lib/billing/plan-features'

export const UPGRADE_URL = '/payments'

/**
 * Resolve whether an org can use a plan feature (soft gate — never throws).
 * @param {string} orgId
 * @param {string} feature
 */
export async function resolveFeatureGate(orgId, feature) {
  const allowed = await hasFeatureForOrg(orgId, feature)
  const subscription = await getSubscription(orgId)
  const planCode = resolvePlanCode(subscription?.planCode || 'STARTER')
  const requiredPlan = findLowestPlanWithFeature(feature)

  return {
    allowed,
    locked: !allowed,
    feature,
    planCode,
    requiredPlan,
    message: 'Upgrade to unlock',
    cta: 'Upgrade to unlock',
    upgradeUrl: `${UPGRADE_URL}?feature=${encodeURIComponent(feature)}&plan=${encodeURIComponent(requiredPlan || '')}`,
  }
}

/**
 * @param {string} feature
 */
function findLowestPlanWithFeature(feature) {
  const order = ['STARTER', 'BUSINESS_GROWTH', 'PROFESSIONAL', 'ENTERPRISE', 'LEAD_BUSINESS', 'LEAD_ENTERPRISE', 'SUITE_BUSINESS', 'SUITE_ENTERPRISE']
  for (const plan of order) {
    if ((PLAN_FEATURES[plan] || []).includes(feature)) return plan
  }
  return null
}

/**
 * JSON body for soft-locked API responses (HTTP 200 — UI shows upgrade CTA).
 * @param {object} gate
 */
export function softGatePayload(gate, extra = {}) {
  return {
    success: false,
    locked: true,
    code: 'FEATURE_LOCKED',
    feature: gate.feature,
    message: gate.message || 'Upgrade to unlock',
    cta: gate.cta || 'Upgrade to unlock',
    upgradeUrl: gate.upgradeUrl || UPGRADE_URL,
    requiredPlan: gate.requiredPlan || null,
    ...extra,
  }
}

/**
 * Attach gate to tenant context for API handlers.
 * @param {object} tenant
 * @param {string} feature
 */
export async function guardFeatureSoft(tenant, feature) {
  const gate = await resolveFeatureGate(tenant.orgId, feature)
  return { ...tenant, gate }
}

/**
 * If feature locked, return soft payload; otherwise null (caller proceeds).
 * @param {object} gate
 */
export function blockedBySoftGate(gate) {
  return gate && !gate.allowed
}

/**
 * Express-style helper for route handlers.
 * @param {object} gate
 * @param {import('next/server').NextResponse} NextResponse
 */
export function respondSoftGate(gate, NextResponse, extra = {}) {
  return NextResponse.json(softGatePayload(gate, extra), { status: 200 })
}
