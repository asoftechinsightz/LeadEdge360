import { getSubscription } from './get-subscription'
import { resolvePlanCode } from './plan-map'
import { shouldEnforceSubscription } from './tenant-policy'
import { getDb } from '@/lib/mongo'

export async function requirePlan(orgId, allowedPlans = []) {
  const db = await getDb()
  const org = await db.collection('orgs').findOne({ id: orgId }, { projection: { _id: 0 } })

  if (!shouldEnforceSubscription(orgId, org)) {
    const subscription = await getSubscription(orgId)
    return subscription
  }

  const subscription = await getSubscription(orgId)

  if (!subscription) {
    throw new Error('ACTIVE_SUBSCRIPTION_REQUIRED')
  }

  const normalizedAllowed = allowedPlans.map(resolvePlanCode)
  const planCode = resolvePlanCode(subscription.planCode)

  if (!normalizedAllowed.includes(planCode)) {
    throw new Error('PLAN_UPGRADE_REQUIRED')
  }

  return subscription
}
