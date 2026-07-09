import { randomUUID } from 'crypto'
import { COLLECTIONS } from './constants.js'

export async function writeExpiryAuditLog(db, {
  orgId,
  userId,
  action,
  entity,
  entityId,
  previousValue = null,
  newValue = null,
  reason = null,
  ip = '',
  ua = '',
}) {
  const entry = {
    id: randomUUID(),
    orgId,
    userId,
    action,
    entity,
    entityId,
    previousValue,
    newValue,
    reason,
    ip,
    ua,
    createdAt: new Date().toISOString(),
  }
  await db.collection(COLLECTIONS.AUDIT).insertOne(entry)
  return entry
}

export async function listExpiryAuditLogs(db, orgId, { page = 1, limit = 25, entityId, action } = {}) {
  const filter = { orgId }
  if (entityId) filter.entityId = entityId
  if (action) filter.action = action
  const cap = Math.min(Math.max(limit, 1), 100)
  const skip = (Math.max(page, 1) - 1) * cap
  const [items, total] = await Promise.all([
    db.collection(COLLECTIONS.AUDIT)
      .find(filter, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(cap)
      .toArray(),
    db.collection(COLLECTIONS.AUDIT).countDocuments(filter),
  ])
  return { items, total, page, limit: cap, pages: Math.ceil(total / cap) || 1 }
}
