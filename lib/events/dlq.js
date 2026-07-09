import { randomUUID } from 'crypto'

const COLLECTION = 'dead_letter_events'

export async function writeDeadLetterEvent(db, {
  event,
  orgId,
  processor,
  error,
  stack = '',
  retryCount = 0,
}) {
  const entry = {
    id: randomUUID(),
    orgId: orgId || event?.orgId,
    eventId: event?.id,
    event,
    processor,
    error: String(error?.message || error || 'Unknown error'),
    stack: stack || error?.stack || '',
    retryCount,
    status: 'failed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  await db.collection(COLLECTION).insertOne(entry)
  return entry
}

export async function listDeadLetterEvents(db, orgId, {
  status = null,
  limit = 50,
  skip = 0,
} = {}) {
  const filter = { orgId }
  if (status) filter.status = status
  const [items, total] = await Promise.all([
    db.collection(COLLECTION)
      .find(filter, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Math.min(limit, 100))
      .toArray(),
    db.collection(COLLECTION).countDocuments(filter),
  ])
  return { items, total }
}

export async function getDeadLetterEvent(db, orgId, id) {
  return db.collection(COLLECTION).findOne({ orgId, id }, { projection: { _id: 0 } })
}

export async function retryDeadLetterEvent(db, orgId, id, { replayFn }) {
  const entry = await getDeadLetterEvent(db, orgId, id)
  if (!entry) throw new Error('NOT_FOUND')
  if (entry.status === 'ignored') throw new Error('IGNORED')

  try {
    await replayFn(entry.event, entry.processor)
    await db.collection(COLLECTION).updateOne(
      { orgId, id },
      {
        $set: { status: 'resolved', resolvedAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        $inc: { retryCount: 1 },
      },
    )
    return { ok: true, status: 'resolved' }
  } catch (err) {
    await db.collection(COLLECTION).updateOne(
      { orgId, id },
      {
        $set: {
          status: 'failed',
          error: err.message,
          stack: err.stack || '',
          updatedAt: new Date().toISOString(),
        },
        $inc: { retryCount: 1 },
      },
    )
    throw err
  }
}

export async function ignoreDeadLetterEvent(db, orgId, id) {
  const result = await db.collection(COLLECTION).findOneAndUpdate(
    { orgId, id },
    { $set: { status: 'ignored', ignoredAt: new Date().toISOString(), updatedAt: new Date().toISOString() } },
    { returnDocument: 'after', projection: { _id: 0 } },
  )
  return result?.value || result
}

export async function exportDeadLetterEvents(db, orgId) {
  const items = await db.collection(COLLECTION)
    .find({ orgId }, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .limit(5000)
    .toArray()
  return items
}

export async function countDeadLetterByStatus(db, orgId) {
  const rows = await db.collection(COLLECTION).aggregate([
    { $match: { orgId } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]).toArray()
  return Object.fromEntries(rows.map((r) => [r._id, r.count]))
}
