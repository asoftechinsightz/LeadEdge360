import { PLAN_FEATURES } from './plan-features'
import { getSubscription } from './get-subscription'
import { resolvePlanCode } from './plan-map'
import { shouldEnforceSubscription } from './tenant-policy'
import { getDb } from '@/lib/mongo'

export { resolvePlanCode } from './plan-map'

export function hasFeature(planCode, feature) {
  const normalized = resolvePlanCode(planCode)
  const features = PLAN_FEATURES[normalized] || []
  return features.includes(feature)
}

/** Resolve active org plan and check feature flag. */
export async function hasFeatureForOrg(orgId, feature) {
  const db = await getDb()
  const org = await db.collection('orgs').findOne({ id: orgId }, { projection: { _id: 0 } })
  if (!shouldEnforceSubscription(orgId, org)) return true

  const subscription = await getSubscription(orgId)
  if (!subscription?.planCode) return false
  return hasFeature(subscription.planCode, feature)
}
