/** Shared org billing read model for /api/auth/me and /api/billing/status */

export async function getOrgBillingContext(db, orgId) {
  const org = await db.collection('orgs').findOne({ id: orgId }, { projection: { _id: 0 } })
  const subscription = await db.collection('subscriptions').findOne(
    { orgId, status: { $in: ['trialing', 'active'] } },
    { projection: { _id: 0 }, sort: { createdAt: -1 } },
  )

  return {
    plan: org?.plan || 'starter',
    billingStatus: org?.billingStatus || 'none',
    entitlements: {
      leadEnabled: org?.leadEnabled ?? true,
      retailEnabled: org?.retailEnabled ?? false,
    },
    subscription,
    activated: org?.billingStatus === 'active' && !!subscription,
  }
}
