import { randomUUID } from 'crypto'
import { createHash } from 'crypto'
import { COLLECTIONS } from './constants.js'

export function contentHash(body) {
  return createHash('sha256').update(String(body || '').trim().toLowerCase()).digest('hex')
}

export async function insertContentBatch(db, orgId, items, { weekId, plannerRunId } = {}) {
  const now = new Date().toISOString()
  const docs = items.map((item) => ({
    id: randomUUID(),
    orgId,
    weekId: weekId || null,
    plannerRunId: plannerRunId || null,
    contentHash: contentHash(item.body),
    status: 'draft',
    version: 1,
    createdAt: now,
    updatedAt: now,
    ...item,
  }))

  if (!docs.length) return { inserted: 0, ids: [] }

  const existing = await db.collection(COLLECTIONS.CONTENT)
    .find({ orgId, contentHash: { $in: docs.map((d) => d.contentHash) } }, { projection: { contentHash: 1 } })
    .toArray()
  const seen = new Set(existing.map((e) => e.contentHash))
  const unique = docs.filter((d) => !seen.has(d.contentHash))

  if (unique.length) {
    try {
      await db.collection(COLLECTIONS.CONTENT).insertMany(unique, { ordered: false })
    } catch (err) {
      if (err.code !== 11000 && !err.writeErrors?.every((e) => e.code === 11000)) {
        throw err
      }
    }
  }

  return { inserted: unique.length, skipped: docs.length - unique.length, ids: unique.map((d) => d.id), docs: unique }
}

export async function listContent(db, orgId, {
  status,
  type,
  platform,
  weekId,
  page = 1,
  limit = 50,
} = {}) {
  const filter = { orgId }
  if (status) filter.status = status
  if (type) filter.type = type
  if (platform) filter.platform = platform
  if (weekId) filter.weekId = weekId

  page = Math.max(1, parseInt(page, 10) || 1)
  limit = Math.min(200, Math.max(1, parseInt(limit, 10) || 50))
  const skip = (page - 1) * limit

  const [items, total] = await Promise.all([
    db.collection(COLLECTIONS.CONTENT)
      .find(filter, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    db.collection(COLLECTIONS.CONTENT).countDocuments(filter),
  ])

  return { items, meta: { page, limit, total, hasMore: page * limit < total } }
}

export async function getMarketingCalendar(db, orgId, { from, to } = {}) {
  const filter = { orgId }
  if (from || to) {
    filter.scheduledAt = {}
    if (from) filter.scheduledAt.$gte = from
    if (to) filter.scheduledAt.$lte = to
  }

  const items = await db.collection(COLLECTIONS.CALENDAR)
    .find(filter, { projection: { _id: 0 } })
    .sort({ scheduledAt: 1 })
    .limit(500)
    .toArray()

  return { items }
}

export async function upsertCalendarEntry(db, orgId, entry) {
  const now = new Date().toISOString()
  const doc = {
    id: entry.id || randomUUID(),
    orgId,
    contentId: entry.contentId || entry.id || randomUUID(),
    platform: entry.platform,
    scheduledAt: entry.scheduledAt,
    slot: entry.slot,
    title: entry.title || entry.platform || 'Scheduled content',
    status: entry.status || 'scheduled',
    publishQueueId: entry.publishQueueId || null,
    updatedAt: now,
  }

  await db.collection(COLLECTIONS.CALENDAR).updateOne(
    { orgId, id: doc.id },
    { $set: doc, $setOnInsert: { createdAt: now } },
    { upsert: true },
  )

  return doc
}

export async function updateCalendarEntry(db, orgId, id, patch) {
  const allowed = ['scheduledAt', 'status', 'platform', 'slot', 'title']
  const $set = { updatedAt: new Date().toISOString() }
  for (const key of allowed) {
    if (patch[key] !== undefined) $set[key] = patch[key]
  }
  const result = await db.collection(COLLECTIONS.CALENDAR).findOneAndUpdate(
    { orgId, id },
    { $set },
    { returnDocument: 'after', projection: { _id: 0 } },
  )
  if (!result) {
    const err = new Error('NOT_FOUND')
    err.detail = 'Calendar entry not found'
    throw err
  }
  return result?.value ?? result
}
