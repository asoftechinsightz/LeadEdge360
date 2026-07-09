import { randomUUID } from 'crypto'

export async function createNotificationFromActivity(db, activity) {
  if (!activity?.orgId || !activity?.id) return null

  const sourceKey = `activity:${activity.id}`
  const existing = await db.collection('org_notifications').findOne(
    { orgId: activity.orgId, sourceKey },
    { projection: { _id: 0, id: 1 } },
  )
  if (existing) return existing

  const body = [
    activity.leadName,
    activity.companyName && activity.companyName !== '—' ? activity.companyName : null,
    activity.summary,
  ].filter(Boolean).join(' · ')

  const notification = {
    id: randomUUID(),
    orgId: activity.orgId,
    activityId: activity.id,
    sourceKey,
    title: activity.title,
    body: body || activity.summary || activity.title,
    href: activity.href || null,
    actorType: activity.actorType,
    actorName: activity.actorName,
    readAt: null,
    userId: activity.userId || null,
    createdAt: activity.createdAt || new Date().toISOString(),
  }

  await db.collection('org_notifications').insertOne(notification)
  return notification
}

export async function listNotifications(db, orgId, { userId = null, limit = 20 } = {}) {
  const cap = Math.min(Math.max(Number(limit) || 20, 1), 50)
  const filter = { orgId }
  if (userId) {
    filter.$or = [{ userId: null }, { userId }]
  }

  const notifications = await db.collection('org_notifications')
    .find(filter, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .limit(cap)
    .toArray()

  const unread = await db.collection('org_notifications').countDocuments({
    ...filter,
    readAt: null,
  })

  return { notifications, unread }
}

export async function markNotificationRead(db, orgId, notificationId) {
  const result = await db.collection('org_notifications').findOneAndUpdate(
    { orgId, id: notificationId },
    { $set: { readAt: new Date().toISOString() } },
    { returnDocument: 'after', projection: { _id: 0 } },
  )
  return result?.value || result || null
}
