import { randomUUID } from 'crypto'
import { EVENT_PROCESSORS, runEventProcessors } from '@/lib/events/processors'
import { writeDeadLetterEvent } from '@/lib/events/dlq'

/**
 * Replay platform events to rebuild projections idempotently.
 */
export async function replayPlatformEvents(db, {
  orgId = null,
  from = null,
  to = null,
  type = null,
  targets = null,
  dryRun = false,
  batchSize = 100,
  clearTargets = false,
  userId = null,
} = {}) {
  const jobId = randomUUID()
  const startedAt = new Date().toISOString()
  const processorTargets = targets || Object.keys(EVENT_PROCESSORS)

  const filter = {}
  if (orgId) filter.orgId = orgId
  if (type) filter.type = type.replace(/\.v\d+$/, '')
  if (from || to) {
    filter.createdAt = {}
    if (from) filter.createdAt.$gte = from
    if (to) filter.createdAt.$lte = to
  }

  const totalEvents = await db.collection('platform_events').countDocuments(filter)

  await db.collection('event_replay_jobs').insertOne({
    id: jobId,
    orgId,
    filter,
    targets: processorTargets,
    dryRun,
    status: 'running',
    totalEvents,
    processed: 0,
    failed: 0,
    startedAt,
    startedBy: userId,
    createdAt: startedAt,
  })

  if (dryRun) {
    await db.collection('event_replay_jobs').updateOne(
      { id: jobId },
      { $set: { status: 'completed', completedAt: new Date().toISOString(), processed: 0 } },
    )
    return { jobId, dryRun: true, totalEvents, targets: processorTargets }
  }

  if (clearTargets && orgId) {
    await clearProjectionTargets(db, orgId, processorTargets)
  }

  let processed = 0
  let failed = 0
  let skip = 0

  while (skip < totalEvents) {
    const batch = await db.collection('platform_events')
      .find(filter, { projection: { _id: 0 } })
      .sort({ createdAt: 1, id: 1 })
      .skip(skip)
      .limit(batchSize)
      .toArray()

    if (!batch.length) break

    for (const event of batch) {
      const results = await runEventProcessors(event, db, {
        targets: processorTargets,
        onFailure: async ({ event: ev, processor, error }) => {
          failed += 1
          await writeDeadLetterEvent(db, { event: ev, processor, error, stack: error.stack })
        },
      })
      const hasFailure = results.some((r) => r.status === 'failed')
      if (!hasFailure) processed += 1
    }

    skip += batch.length
    await db.collection('event_replay_jobs').updateOne(
      { id: jobId },
      { $set: { processed, failed, updatedAt: new Date().toISOString() } },
    )
  }

  await db.collection('event_replay_jobs').updateOne(
    { id: jobId },
    { $set: { status: 'completed', completedAt: new Date().toISOString(), processed, failed } },
  )

  return { jobId, totalEvents, processed, failed, targets: processorTargets }
}

async function clearProjectionTargets(db, orgId, targets) {
  const ops = []
  if (targets.includes('activities') || targets.includes('notifications')) {
    ops.push(db.collection('org_activities').deleteMany({ orgId, source: 'platform_event' }))
    ops.push(db.collection('org_notifications').deleteMany({ orgId }))
  }
  if (targets.includes('analytics')) {
    ops.push(db.collection('event_analytics').deleteMany({ orgId }))
  }
  if (targets.includes('ai_memory')) {
    ops.push(db.collection('ai_agent_memory').deleteMany({ orgId }))
  }
  if (targets.includes('search_index')) {
    ops.push(db.collection('event_search_index').deleteMany({ orgId }))
  }
  await Promise.all(ops)
}

export async function getReplayJob(db, jobId) {
  return db.collection('event_replay_jobs').findOne({ id: jobId }, { projection: { _id: 0 } })
}

export async function listReplayJobs(db, orgId, { limit = 20 } = {}) {
  const filter = orgId ? { orgId } : {}
  const items = await db.collection('event_replay_jobs')
    .find(filter, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()
  return items
}
