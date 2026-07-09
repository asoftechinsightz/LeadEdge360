import { TASK_STATUS } from '@/lib/agents/registry'
import { executeAgentTask } from '@/lib/agents/executor'
import { publishWebhookEvent } from '@/lib/integrations/n8n'
import { replayPlatformEvents } from '@/lib/events/replay'

/**
 * Disaster recovery procedures for Agent Runtime.
 */

export async function retryFailedTasks(db, orgId, { limit = 20 } = {}) {
  const tasks = await db.collection('agent_tasks')
    .find({ orgId, status: TASK_STATUS.FAILED }, { projection: { _id: 0 } })
    .sort({ completedAt: -1 })
    .limit(limit)
    .toArray()

  const results = []
  for (const task of tasks) {
    await db.collection('agent_tasks').updateOne(
      { orgId, id: task.id },
      { $set: { status: TASK_STATUS.QUEUED, error: null } },
    )
    try {
      const result = await executeAgentTask(db, { ...task, status: TASK_STATUS.QUEUED })
      results.push({ taskId: task.id, status: result.status, ok: true })
    } catch (err) {
      results.push({ taskId: task.id, status: 'failed', ok: false, error: err.message })
    }
  }
  return { retried: results.length, results }
}

export async function replayFailedWebhooks(db, orgId, { limit = 50 } = {}) {
  const deliveries = await db.collection('webhook_deliveries')
    .find({ orgId, status: 'failed' }, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()

  const results = []
  for (const delivery of deliveries) {
    const event = await db.collection('platform_events').findOne(
      { orgId, id: delivery.eventId },
      { projection: { _id: 0 } },
    )
    if (!event) {
      results.push({ eventId: delivery.eventId, status: 'event_not_found' })
      continue
    }
    const result = await publishWebhookEvent(event, db)
    results.push({ eventId: delivery.eventId, ...result })
  }
  return { replayed: results.length, results }
}

export async function rebuildAgentMemory(db, orgId, { agentId = null, sinceDays = 30 } = {}) {
  const since = new Date(Date.now() - sinceDays * 24 * 3600_000).toISOString()
  const filter = { orgId, type: 'agent.action', createdAt: { $gte: since } }
  if (agentId) filter.agentId = agentId

  const events = await db.collection('platform_events')
    .find(filter, { projection: { _id: 0 } })
    .sort({ createdAt: 1 })
    .toArray()

  let rebuilt = 0
  for (const event of events) {
    await db.collection('agent_memory').updateOne(
      {
        orgId,
        agentId: event.agentId,
        layer: 'historical',
        key: event.payload?.taskId || event.id,
      },
      {
        $set: {
          orgId,
          agentId: event.agentId,
          layer: 'historical',
          key: event.payload?.taskId || event.id,
          value: {
            summary: event.payload?.summary,
            confidence: event.payload?.confidence,
            rebuiltFrom: event.id,
            at: event.createdAt,
          },
          updatedAt: new Date().toISOString(),
        },
        $setOnInsert: { createdAt: event.createdAt },
      },
      { upsert: true },
    )
    rebuilt++
  }
  return { rebuilt, eventsProcessed: events.length }
}

export async function rebuildNotifications(db, orgId, { limit = 500 } = {}) {
  const { createNotificationFromActivity } = await import('@/lib/activities/notifications')
  const activities = await db.collection('org_activities')
    .find({ orgId }, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()

  let created = 0
  for (const activity of activities) {
    const result = await createNotificationFromActivity(db, activity)
    if (result) created++
  }
  return { activitiesScanned: activities.length, notificationsCreated: created }
}

export async function recoverFromOutage(db, orgId, {
  retryTasks = true,
  replayWebhooks = true,
  rebuildMemory = true,
  replayEvents = false,
  from = null,
  to = null,
} = {}) {
  const report = { orgId, startedAt: new Date().toISOString(), steps: [] }

  if (retryTasks) {
    const r = await retryFailedTasks(db, orgId)
    report.steps.push({ step: 'retry_failed_tasks', ...r })
  }

  if (replayWebhooks) {
    const r = await replayFailedWebhooks(db, orgId)
    report.steps.push({ step: 'replay_failed_webhooks', ...r })
  }

  if (rebuildMemory) {
    const r = await rebuildAgentMemory(db, orgId)
    report.steps.push({ step: 'rebuild_agent_memory', ...r })
  }

  if (replayEvents && from) {
    const r = await replayPlatformEvents(db, { orgId, from, to })
    report.steps.push({ step: 'replay_platform_events', ...r })
  }

  report.completedAt = new Date().toISOString()
  await db.collection('dr_recovery_log').insertOne(report)
  return report
}

export const RECOVERY_RUNBOOK = [
  { id: 'failed_task', title: 'Failed agent execution', action: 'retryFailedTasks', api: 'POST /api/agents/recovery/retry-tasks' },
  { id: 'failed_webhook', title: 'Failed n8n webhooks', action: 'replayFailedWebhooks', api: 'POST /api/agents/recovery/replay-webhooks' },
  { id: 'queue_corruption', title: 'Queue corruption', action: 'Reset queued tasks to failed then retry', api: 'POST /api/agents/recovery/retry-tasks' },
  { id: 'outage_replay', title: 'Replay after outage', action: 'recoverFromOutage', api: 'POST /api/agents/recovery/outage' },
  { id: 'memory_rebuild', title: 'Memory rebuild', action: 'rebuildAgentMemory', api: 'POST /api/agents/recovery/rebuild-memory' },
  { id: 'notification_rebuild', title: 'Notification rebuild', action: 'rebuildNotifications', api: 'POST /api/agents/recovery/rebuild-notifications' },
]
