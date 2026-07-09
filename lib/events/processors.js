import { randomUUID } from 'crypto'
import { projectFromPlatformEvent } from '@/lib/activities/projector'
import { createNotificationFromActivity } from '@/lib/activities/notifications'

export const PROJECTION_TARGETS = {
  ACTIVITIES: 'activities',
  NOTIFICATIONS: 'notifications',
  ANALYTICS: 'analytics',
  AI_MEMORY: 'ai_memory',
  SEARCH_INDEX: 'search_index',
  AGENT_RUNTIME: 'agent_runtime',
}

/** Registered projection processors — replay runs these idempotently. */
export const EVENT_PROCESSORS = {
  [PROJECTION_TARGETS.ACTIVITIES]: {
    name: 'activities',
    description: 'Activity feed projection',
    async run(event, db) {
      return projectFromPlatformEvent(event, db)
    },
  },
  [PROJECTION_TARGETS.NOTIFICATIONS]: {
    name: 'notifications',
    description: 'Notification center projection',
    async run(event, db) {
      const activity = await projectFromPlatformEvent(event, db)
      if (activity) return createNotificationFromActivity(db, activity)
      return null
    },
  },
  [PROJECTION_TARGETS.ANALYTICS]: {
    name: 'analytics',
    description: 'Event analytics aggregation',
    async run(event, db) {
      const day = (event.createdAt || new Date().toISOString()).slice(0, 10)
      await db.collection('event_analytics').updateOne(
        { orgId: event.orgId, type: event.type, day },
        {
          $inc: { count: 1 },
          $setOnInsert: { id: randomUUID(), createdAt: new Date().toISOString() },
          $set: { updatedAt: new Date().toISOString() },
        },
        { upsert: true },
      )
      return { ok: true }
    },
  },
  [PROJECTION_TARGETS.AI_MEMORY]: {
    name: 'ai_memory',
    description: 'AI agent memory store',
    async run(event, db) {
      const agentId = event.payload?.agentId || event.agentId
      if (!agentId && event.type !== 'agent.action' && event.type !== 'agent.task.completed') {
        return null
      }
      const memory = {
        id: randomUUID(),
        orgId: event.orgId,
        eventId: event.id,
        agentId: agentId || 'system',
        type: event.type,
        summary: event.payload?.summary || event.payload?.explanation || event.type,
        confidence: event.payload?.confidence ?? null,
        correlationId: event.correlationId || null,
        createdAt: event.createdAt || new Date().toISOString(),
      }
      await db.collection('ai_agent_memory').updateOne(
        { orgId: event.orgId, eventId: event.id, agentId: memory.agentId },
        { $setOnInsert: memory },
        { upsert: true },
      )
      return memory
    },
  },
  [PROJECTION_TARGETS.SEARCH_INDEX]: {
    name: 'search_index',
    description: 'Search index materialization',
    async run(event, db) {
      const text = [
        event.type,
        event.entity,
        event.entityId,
        JSON.stringify(event.payload || {}),
      ].join(' ').toLowerCase()
      await db.collection('event_search_index').updateOne(
        { orgId: event.orgId, eventId: event.id },
        {
          $set: {
            text,
            type: event.type,
            entity: event.entity,
            entityId: event.entityId,
            updatedAt: new Date().toISOString(),
          },
          $setOnInsert: { id: randomUUID(), createdAt: event.createdAt },
        },
        { upsert: true },
      )
      return { ok: true }
    },
  },
  [PROJECTION_TARGETS.AGENT_RUNTIME]: {
    name: 'agent_runtime',
    description: 'Agentic AI task dispatch and execution',
    async run(event, db) {
      const { dispatchAgentTasks } = await import('@/lib/agents/dispatch')
      return dispatchAgentTasks(event, db)
    },
  },
}

export function getProcessorNames() {
  return Object.keys(EVENT_PROCESSORS)
}

/** Agent dispatch can invoke LLM tools — never block API responses on it. */
const ASYNC_PROCESSORS = new Set([PROJECTION_TARGETS.AGENT_RUNTIME])

async function runSingleProcessor(event, db, processor, { skipDlq = false, onFailure = null } = {}) {
  const started = Date.now()
  try {
    const result = await processor.run(event, db)
    const durationMs = Date.now() - started
    await db.collection('event_processing_log').insertOne({
      id: randomUUID(),
      orgId: event.orgId,
      eventId: event.id,
      processor: processor.name,
      status: 'success',
      durationMs,
      createdAt: new Date().toISOString(),
    })
    return { processor: processor.name, status: 'success', durationMs, result }
  } catch (err) {
    const durationMs = Date.now() - started
    const failure = {
      processor: processor.name,
      status: 'failed',
      durationMs,
      error: err.message,
      stack: err.stack,
    }
    await db.collection('event_processing_log').insertOne({
      id: randomUUID(),
      orgId: event.orgId,
      eventId: event.id,
      processor: processor.name,
      status: 'failed',
      durationMs,
      error: err.message,
      createdAt: new Date().toISOString(),
    })
    if (!skipDlq && onFailure) {
      await onFailure({ event, processor: processor.name, error: err })
    }
    return failure
  }
}

export async function runEventProcessors(event, db, {
  targets = getProcessorNames(),
  skipDlq = false,
  onFailure = null,
} = {}) {
  const results = []
  for (const target of targets) {
    const processor = EVENT_PROCESSORS[target]
    if (!processor) continue

    if (ASYNC_PROCESSORS.has(target)) {
      void runSingleProcessor(event, db, processor, { skipDlq, onFailure }).catch((err) => {
        console.error(`[event_processor] async ${processor.name} failed:`, err.message)
      })
      results.push({ processor: processor.name, status: 'deferred', durationMs: 0 })
      continue
    }

    results.push(await runSingleProcessor(event, db, processor, { skipDlq, onFailure }))
  }
  return results
}
