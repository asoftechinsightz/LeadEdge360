/**
 * Tenant classification and subscription enforcement policy.
 *
 * Internal production (AsoftechInsightz) operates the business — subscription
 * expiry must not block workflows. Customer tenants use standard enforcement.
 */

export const INTERNAL_PRODUCTION_ORG_ID =
  process.env.INTERNAL_PRODUCTION_ORG_ID || 'asoftechinsightz'

export const DEMO_TENANT_ORG_IDS = new Set([
  'client-demo',
  process.env.DEMO_ORG_ID || 'client-demo',
])

export const ORG_TYPES = {
  INTERNAL_PRODUCTION: 'internal_production',
  CUSTOMER: 'customer',
  DEMO: 'demo',
  DEVELOPMENT: 'development',
}

/** Org document fields that mark internal production (any one is sufficient). */
export function isInternalProductionOrg(orgId, org = null) {
  if (!orgId) return false
  if (orgId === INTERNAL_PRODUCTION_ORG_ID) return true
  if (!org) return false
  return org.orgType === ORG_TYPES.INTERNAL_PRODUCTION
    || org.internalProduction === true
    || org.subscriptionEnforcement === 'none'
}

export function isDemoTenantOrg(orgId, org = null) {
  if (!orgId) return false
  if (org?.orgType === ORG_TYPES.DEMO || org?.demo === true) return true
  return DEMO_TENANT_ORG_IDS.has(orgId)
}

export function isCustomerTenantOrg(orgId, org = null) {
  if (!orgId) return false
  if (isInternalProductionOrg(orgId, org)) return false
  if (isDemoTenantOrg(orgId, org)) return false
  return true
}

/**
 * Whether platform subscription gates (requirePlan, hasFeatureForOrg) apply.
 * Internal production: false. All other orgs: true.
 */
export function shouldEnforceSubscription(orgId, org = null) {
  return !isInternalProductionOrg(orgId, org)
}

/** Synthetic active subscription returned for internal production bypass. */
export function internalProductionSubscription(orgId, recorded = null) {
  return {
    id: recorded?.id || `sub-internal-${orgId}`,
    orgId,
    planCode: recorded?.planCode || 'ENTERPRISE',
    status: 'ACTIVE',
    billingCycle: recorded?.billingCycle || 'monthly',
    amount: recorded?.amount ?? 0,
    internalProduction: true,
    enforcementBypass: true,
    recordedStatus: recorded?.status || null,
    activatedAt: recorded?.activatedAt || new Date(),
    updatedAt: new Date().toISOString(),
  }
}
