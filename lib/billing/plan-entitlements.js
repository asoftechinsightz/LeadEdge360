// Plan → org entitlements map (Sprint 19A MVP).
// E-004: runtime enforcement via checkEntitlement().

/** Matches `lib/tenant.js` DEMO_ORG_ID (not imported — avoids mongo init in Node tests). */
const DEMO_ORG_ID = 'demo-org'

const PLAN_ENTITLEMENTS = {
  starter: {
    leadEnabled: true,
    retailEnabled: false,
    limits: { leadsPerMonth: 500, maxUsers: 1 },
  },
  growth: {
    leadEnabled: true,
    retailEnabled: true,
    limits: { leadsPerMonth: 10000, maxUsers: 5 },
  },
  scale: {
    leadEnabled: true,
    retailEnabled: true,
    limits: { leadsPerMonth: null, maxUsers: null },
  },
}

const DEFAULT_PLAN = 'starter'
const UPGRADE_URL = '/pricing'

export function getEntitlementsForPlan(planId) {
  const ent = PLAN_ENTITLEMENTS[planId]
  if (!ent) throw new Error(`Unknown plan: ${planId}`)
  return ent
}

export function resolvePlanId(planId) {
  if (planId && PLAN_ENTITLEMENTS[planId]) return planId
  return DEFAULT_PLAN
}

export function getOrgBillingPatch(planId) {
  const ent = getEntitlementsForPlan(planId)
  const now = new Date().toISOString()
  return {
    plan: planId,
    upgradedAt: now,
    lastPaymentAt: now,
    billingStatus: 'active',
    leadEnabled: ent.leadEnabled,
    retailEnabled: ent.retailEnabled,
  }
}

/** Feature flag: enforcement off unless ENFORCE_PLAN_LIMITS=true */
export function isPlanEnforcementEnabled() {
  return process.env.ENFORCE_PLAN_LIMITS === 'true'
}

/** Grandfather list from GRANDFATHER_ORG_IDS (comma-separated org ids). */
export function isGrandfatheredOrg(orgId) {
  const raw = process.env.GRANDFATHER_ORG_IDS || ''
  if (!raw.trim()) return false
  const ids = raw.split(',').map((s) => s.trim()).filter(Boolean)
  return ids.includes(orgId)
}

/** Demo workspace exempt from limits (PO-D10). */
export function isEnforcementExemptOrg(orgId) {
  return orgId === DEMO_ORG_ID
}

/** Calendar month bounds in Asia/Kolkata for lead counting. */
export function getLeadsMonthBoundsIso() {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const year = Number(parts.find((p) => p.type === 'year').value)
  const month = Number(parts.find((p) => p.type === 'month').value)
  const pad = (n) => String(n).padStart(2, '0')
  const start = new Date(`${year}-${pad(month)}-01T00:00:00+05:30`)
  const endMonth = month === 12 ? 1 : month + 1
  const endYear = month === 12 ? year + 1 : year
  const end = new Date(`${endYear}-${pad(endMonth)}-01T00:00:00+05:30`)
  return { start: start.toISOString(), end: end.toISOString() }
}

/**
 * Check plan entitlement for a create action.
 * @returns {{ allowed: true }} | {{ allowed: false, status: number, body: object }}
 */
export async function checkEntitlement(db, orgId, action) {
  if (!isPlanEnforcementEnabled()) {
    return { allowed: true }
  }
  if (isEnforcementExemptOrg(orgId) || isGrandfatheredOrg(orgId)) {
    return { allowed: true }
  }

  const org = await db.collection('orgs').findOne({ id: orgId })
  if (!org) {
    return {
      allowed: false,
      status: 402,
      body: {
        error: 'Organization not found',
        code: 'PLAN_ORG_NOT_FOUND',
        plan: DEFAULT_PLAN,
        upgradeUrl: UPGRADE_URL,
      },
    }
  }

  const planId = resolvePlanId(org.plan)
  const ent = PLAN_ENTITLEMENTS[planId]

  if (action === 'lead.create') {
    const leadOk = org.leadEnabled ?? ent.leadEnabled
    if (!leadOk) {
      return {
        allowed: false,
        status: 403,
        body: {
          error: 'Lead capture is not enabled on your plan. Upgrade to add more leads.',
          code: 'PLAN_LEAD_DISABLED',
          plan: planId,
          upgradeUrl: UPGRADE_URL,
        },
      }
    }
    const limit = ent.limits.leadsPerMonth
    if (limit != null) {
      const { start, end } = getLeadsMonthBoundsIso()
      const current = await db.collection('leads').countDocuments({
        orgId,
        createdAt: { $gte: start, $lt: end },
      })
      if (current >= limit) {
        return {
          allowed: false,
          status: 402,
          body: {
            error: `Monthly lead limit reached (${limit}). Upgrade your plan to capture more leads.`,
            code: 'PLAN_LIMIT_LEADS',
            limit,
            current,
            plan: planId,
            upgradeUrl: UPGRADE_URL,
          },
        }
      }
    }
    return { allowed: true }
  }

  if (action === 'retail.create') {
    const retailOk = org.retailEnabled ?? ent.retailEnabled
    if (!retailOk) {
      return {
        allowed: false,
        status: 403,
        body: {
          error: 'RetailEdge360 is not enabled on your plan. Upgrade to add inventory SKUs.',
          code: 'PLAN_RETAIL_DISABLED',
          plan: planId,
          upgradeUrl: UPGRADE_URL,
        },
      }
    }
    return { allowed: true }
  }

  if (action === 'user.create') {
    const limit = ent.limits.maxUsers
    if (limit != null) {
      const current = await db.collection('users').countDocuments({
        orgId,
        status: { $ne: 'deleted' },
      })
      if (current >= limit) {
        return {
          allowed: false,
          status: 402,
          body: {
            error: `Team user limit reached (${limit}). Upgrade your plan to add more users.`,
            code: 'PLAN_LIMIT_USERS',
            limit,
            current,
            plan: planId,
            upgradeUrl: UPGRADE_URL,
          },
        }
      }
    }
    return { allowed: true }
  }

  return { allowed: true }
}

export { PLAN_ENTITLEMENTS }
