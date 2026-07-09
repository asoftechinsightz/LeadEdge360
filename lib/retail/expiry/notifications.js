import { randomUUID } from 'crypto'
import { COLLECTIONS } from './constants.js'

export async function createExpiryNotification(db, {
  orgId,
  userId = null,
  title,
  body,
  href = null,
  sourceKey,
}) {
  if (!orgId || !title) return null
  const key = sourceKey || `expiry:${randomUUID()}`
  const existing = await db.collection('org_notifications').findOne(
    { orgId, sourceKey: key },
    { projection: { _id: 0, id: 1 } },
  )
  if (existing) return existing

  const notification = {
    id: randomUUID(),
    orgId,
    sourceKey: key,
    title,
    body: body || title,
    href,
    actorType: 'system',
    actorName: 'Expiry Management',
    readAt: null,
    userId,
    createdAt: new Date().toISOString(),
  }
  await db.collection('org_notifications').insertOne(notification)
  return notification
}

export async function notifyFromAlert(db, alert) {
  return createExpiryNotification(db, {
    orgId: alert.orgId,
    title: `Expiry Alert: ${alert.level?.toUpperCase()}`,
    body: `${alert.productName} (${alert.batchNumber}) — ${alert.message}`,
    href: '/retailedge360/expiry?tab=alerts',
    sourceKey: `expiry-alert:${alert.id}`,
  })
}

export async function notifyReturnStatus(db, ret, status) {
  const titles = {
    approved: 'Return Approved',
    rejected: 'Return Rejected',
    credited: 'Credit Note Issued',
    refunded: 'Refund Processed',
  }
  return createExpiryNotification(db, {
    orgId: ret.orgId,
    userId: ret.createdBy,
    title: titles[status] || `Return ${status}`,
    body: `${ret.productName} — ${ret.returnNumber}`,
    href: '/retailedge360/expiry?tab=returns',
    sourceKey: `expiry-return:${ret.id}:${status}`,
  })
}

export async function notifyDisposalStatus(db, disposal, status) {
  return createExpiryNotification(db, {
    orgId: disposal.orgId,
    userId: disposal.createdBy,
    title: status === 'approved' ? 'Disposal Approved' : `Disposal ${status}`,
    body: `${disposal.productName} — ${disposal.disposalNumber}`,
    href: '/retailedge360/expiry?tab=disposals',
    sourceKey: `expiry-disposal:${disposal.id}:${status}`,
  })
}

export async function notifyForecast(db, forecast) {
  return createExpiryNotification(db, {
    orgId: forecast.orgId,
    title: 'AI Expiry Recommendation',
    body: `${forecast.productName}: ${forecast.recommendation}`,
    href: '/retailedge360/expiry?tab=ai',
    sourceKey: `expiry-forecast:${forecast.id}`,
  })
}
