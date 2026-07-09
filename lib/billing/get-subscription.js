import { getDb } from '@/lib/mongo'
import {
  shouldEnforceSubscription,
  internalProductionSubscription,
} from './tenant-policy'

export async function getSubscription(orgId) {
  const db = await getDb()
  const org = await db.collection('orgs').findOne({ id: orgId }, { projection: { _id: 0 } })

  const subscription = await db.collection('subscriptions')
    .find({ orgId })
    .sort({ activatedAt: -1, updatedAt: -1, createdAt: -1 })
    .limit(1)
    .toArray()

  const recorded = subscription[0] || null

  if (!shouldEnforceSubscription(orgId, org)) {
    return internalProductionSubscription(orgId, recorded)
  }

  if (!recorded) return null
  if (!['ACTIVE', 'TRIAL', 'active', 'trialing'].includes(recorded.status)) {
    return null
  }

  return recorded
}
