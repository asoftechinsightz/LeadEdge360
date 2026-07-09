import { randomUUID } from 'crypto'
import { COLLECTIONS, ALERT_LEVELS } from './constants.js'
import { daysUntilExpiry, deriveAlertLevel } from './utils.js'
import { notifyFromAlert } from './notifications.js'

export async function runAlertEngine(db, orgId) {
  const batches = await db.collection(COLLECTIONS.BATCHES)
    .find({
      orgId,
      quantityAvailable: { $gt: 0 },
      batchStatus: { $nin: ['recalled', 'blocked', 'depleted'] },
    })
    .toArray()

  const now = new Date().toISOString()
  let created = 0
  let updated = 0

  for (const batch of batches) {
    const days = daysUntilExpiry(batch.expiryDate)
    const level = deriveAlertLevel(days)
    if (!level) continue

    const sourceKey = `alert:${batch.id}:${level}`
    const existing = await db.collection(COLLECTIONS.ALERTS).findOne({ orgId, batchId: batch.id, level, acknowledged: false })

    const alertData = {
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      productId: batch.productId,
      productName: batch.productName,
      level,
      daysRemaining: days,
      expiryDate: batch.expiryDate,
      quantityAvailable: batch.quantityAvailable,
      warehouseId: batch.warehouseId,
      message: days < 0
        ? `EXPIRED — ${Math.abs(days)} days past expiry`
        : `Expires in ${days} days`,
      channels: ['dashboard', 'admin'],
      updatedAt: now,
    }

    if (existing) {
      await db.collection(COLLECTIONS.ALERTS).updateOne(
        { orgId, id: existing.id },
        { $set: alertData },
      )
      updated += 1
    } else {
      const alert = {
        id: randomUUID(),
        orgId,
        ...alertData,
        acknowledged: false,
        acknowledgedBy: null,
        acknowledgedAt: null,
        createdAt: now,
      }
      await db.collection(COLLECTIONS.ALERTS).insertOne(alert)
      await notifyFromAlert(db, alert)
      created += 1
    }

    const newStatus = days < 0 ? 'expired' : days <= 7 ? 'critical' : days <= 30 ? 'near_expiry' : batch.batchStatus
    if (newStatus !== batch.batchStatus) {
      await db.collection(COLLECTIONS.BATCHES).updateOne(
        { orgId, id: batch.id },
        { $set: { batchStatus: newStatus, updatedAt: now } },
      )
    }
  }

  return { created, updated, scanned: batches.length }
}

export async function listAlerts(db, orgId, { level, acknowledged, page = 1, limit = 25 } = {}) {
  const filter = { orgId }
  if (level) filter.level = level
  if (acknowledged !== undefined) filter.acknowledged = acknowledged === 'true' || acknowledged === true
  const cap = Math.min(Math.max(limit, 1), 100)
  const skip = (Math.max(page, 1) - 1) * cap

  const [items, total] = await Promise.all([
    db.collection(COLLECTIONS.ALERTS)
      .find(filter, { projection: { _id: 0 } })
      .sort({ 'level': 1, createdAt: -1 })
      .skip(skip)
      .limit(cap)
      .toArray(),
    db.collection(COLLECTIONS.ALERTS).countDocuments(filter),
  ])

  return { items, total, page, limit: cap, pages: Math.ceil(total / cap) || 1 }
}

export async function acknowledgeAlert(db, orgId, userId, alertId) {
  const now = new Date().toISOString()
  const result = await db.collection(COLLECTIONS.ALERTS).findOneAndUpdate(
    { orgId, id: alertId },
    { $set: { acknowledged: true, acknowledgedBy: userId, acknowledgedAt: now, updatedAt: now } },
    { returnDocument: 'after', projection: { _id: 0 } },
  )
  return { alert: result?.value || result }
}

export async function getCriticalAlerts(db, orgId, limit = 10) {
  const items = await db.collection(COLLECTIONS.ALERTS)
    .find({ orgId, acknowledged: false, level: { $in: ['critical', 'high'] } }, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()
  return items
}

export { ALERT_LEVELS }
