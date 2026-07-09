/** Configurable event retention policies (days). 0 = unlimited. */

export const DEFAULT_RETENTION = {
  platform_events: 365 * 5,
  audit_logs: 365 * 7,
  org_notifications: 180,
  org_activities: 0,
  dead_letter_events: 365,
  event_processing_log: 90,
  event_analytics: 365 * 3,
  ai_agent_memory: 365 * 2,
}

export async function getRetentionPolicy(db, orgId) {
  const stored = await db.collection('org_event_policy').findOne(
    { orgId },
    { projection: { _id: 0 } },
  )
  return { ...DEFAULT_RETENTION, ...(stored?.retention || {}) }
}

export async function saveRetentionPolicy(db, orgId, retention) {
  await db.collection('org_event_policy').updateOne(
    { orgId },
    {
      $set: {
        retention: { ...DEFAULT_RETENTION, ...retention },
        updatedAt: new Date().toISOString(),
      },
      $setOnInsert: { orgId, createdAt: new Date().toISOString() },
    },
    { upsert: true },
  )
  return getRetentionPolicy(db, orgId)
}

/**
 * Archive records older than retention window to archive collections.
 */
export async function applyRetentionPolicy(db, orgId) {
  const policy = await getRetentionPolicy(db, orgId)
  const results = []

  for (const [collection, days] of Object.entries(policy)) {
    if (!days || days <= 0) continue
    const cutoff = new Date(Date.now() - days * 86_400_000).toISOString()
    const archiveCollection = `${collection}_archive`

    const old = await db.collection(collection)
      .find({ orgId, createdAt: { $lt: cutoff } })
      .limit(500)
      .toArray()

    if (!old.length) continue

    await db.collection(archiveCollection).insertMany(
      old.map((doc) => ({ ...doc, archivedAt: new Date().toISOString() })),
      { ordered: false },
    ).catch(() => { /* duplicates ok */ })

    const ids = old.map((d) => d.id).filter(Boolean)
    if (ids.length) {
      await db.collection(collection).deleteMany({ orgId, id: { $in: ids } })
    }

    results.push({ collection, archived: old.length, cutoff })
  }

  return { orgId, results, appliedAt: new Date().toISOString() }
}

export async function restoreFromArchive(db, orgId, collection, { limit = 100 } = {}) {
  const archiveCollection = `${collection}_archive`
  const docs = await db.collection(archiveCollection)
    .find({ orgId })
    .limit(limit)
    .toArray()

  if (!docs.length) return { restored: 0 }

  const clean = docs.map(({ archivedAt, _id, ...rest }) => rest)
  await db.collection(collection).insertMany(clean, { ordered: false }).catch(() => {})
  return { restored: clean.length }
}
