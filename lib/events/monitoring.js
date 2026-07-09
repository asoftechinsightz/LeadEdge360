import { countDeadLetterByStatus } from '@/lib/events/dlq'
import { listReplayJobs } from '@/lib/events/replay'

export async function getEventMetrics(db, orgId) {
  const now = Date.now()
  const oneMinuteAgo = new Date(now - 60_000).toISOString()
  const oneHourAgo = new Date(now - 3_600_000).toISOString()

  const [
    eventsLastMinute,
    eventsLastHour,
    totalEvents,
    failedProcessing,
    dlqCounts,
    recentJobs,
    slowConsumers,
    avgLatency,
  ] = await Promise.all([
    db.collection('platform_events').countDocuments({ orgId, createdAt: { $gte: oneMinuteAgo } }),
    db.collection('platform_events').countDocuments({ orgId, createdAt: { $gte: oneHourAgo } }),
    db.collection('platform_events').countDocuments({ orgId }),
    db.collection('event_processing_log').countDocuments({ orgId, status: 'failed', createdAt: { $gte: oneHourAgo } }),
    countDeadLetterByStatus(db, orgId),
    listReplayJobs(db, orgId, { limit: 5 }),
    db.collection('event_processing_log').aggregate([
      { $match: { orgId, createdAt: { $gte: oneHourAgo } } },
      { $group: { _id: '$processor', avgMs: { $avg: '$durationMs' }, count: { $sum: 1 }, failures: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } } } },
      { $sort: { avgMs: -1 } },
      { $limit: 10 },
    ]).toArray(),
    db.collection('event_processing_log').aggregate([
      { $match: { orgId, status: 'success', createdAt: { $gte: oneHourAgo } } },
      { $group: { _id: null, avgMs: { $avg: '$durationMs' } } },
    ]).toArray(),
  ])

  const pendingDlq = (dlqCounts.failed || 0) + (dlqCounts.pending || 0)
  const latestReplay = recentJobs[0] || null

  return {
    eventsPerMinute: eventsLastMinute,
    eventsLastHour,
    totalEvents,
    eventQueue: pendingDlq,
    failedEvents: failedProcessing,
    retryQueue: dlqCounts.failed || 0,
    deadLetterQueue: dlqCounts.failed || 0,
    ignoredEvents: dlqCounts.ignored || 0,
    resolvedEvents: dlqCounts.resolved || 0,
    averageLatencyMs: Math.round(avgLatency[0]?.avgMs || 0),
    slowConsumers: slowConsumers.map((r) => ({
      processor: r._id,
      avgMs: Math.round(r.avgMs || 0),
      count: r.count,
      failures: r.failures,
    })),
    replayStatus: latestReplay ? {
      jobId: latestReplay.id,
      status: latestReplay.status,
      processed: latestReplay.processed,
      failed: latestReplay.failed,
      startedAt: latestReplay.startedAt,
      completedAt: latestReplay.completedAt,
    } : null,
    recentReplayJobs: recentJobs,
  }
}

export async function getPlatformHealth(db, orgId) {
  const mongoStart = Date.now()
  let mongoOk = false
  try {
    await db.command({ ping: 1 })
    mongoOk = true
  } catch {
    mongoOk = false
  }
  const mongoLatencyMs = Date.now() - mongoStart

  const metrics = await getEventMetrics(db, orgId)

  let n8nOk = null
  const n8nUrl = process.env.N8N_HEALTH_URL || process.env.N8N_WEBHOOK_URL
  if (n8nUrl) {
    try {
      const res = await fetch(n8nUrl.replace(/\/webhook.*/, '/healthz'), { signal: AbortSignal.timeout(3000) })
      n8nOk = res.ok
    } catch {
      n8nOk = false
    }
  }

  return {
    mongodb: { ok: mongoOk, latencyMs: mongoLatencyMs },
    eventBus: { ok: true, queueDepth: metrics.eventQueue, eventsPerMinute: metrics.eventsPerMinute },
    n8n: n8nOk === null ? { ok: null, status: 'not_configured' } : { ok: n8nOk },
    api: { ok: true },
    checkedAt: new Date().toISOString(),
  }
}
