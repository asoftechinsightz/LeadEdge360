import { randomUUID } from 'crypto'
import { getDb } from '@/lib/mongo'
import { validateEventPayload } from '@/lib/events/schema-registry'
import { normalizeEventType } from '@/lib/events/versioning'
import { generateCorrelationId } from '@/lib/events/correlation'
import { runEventProcessors } from '@/lib/events/processors'
import { writeDeadLetterEvent } from '@/lib/events/dlq'
import { publishWebhookEvent } from '@/lib/integrations/n8n'

const listeners = new Map()

/**
 * Persist a versioned platform event — single source of truth for all projections.
 */
export async function emitPlatformEvent({
  db: dbIn,
  orgId,
  type,
  entity = null,
  entityId = null,
  payload = {},
  userId = null,
  source = 'system',
  correlationId = null,
  causationId = null,
  requestId = null,
  sessionId = null,
  agentId = null,
  skipProcessors = false,
}) {
  if (!orgId || !type) return null

  const { type: baseType, version, versionedType } = normalizeEventType(type)
  const validation = validateEventPayload(baseType, payload)
  if (validation.warnings?.length) {
    console.warn(`[platform_event] ${versionedType}:`, validation.warnings.join('; '))
  }

  const db = dbIn || await getDb()
  const event = {
    id: randomUUID(),
    orgId,
    type: baseType,
    version,
    versionedType,
    entity,
    entityId,
    payload,
    userId,
    agentId: agentId || payload.agentId || null,
    source,
    correlationId: correlationId || payload.correlationId || generateCorrelationId(),
    causationId: causationId || payload.causationId || null,
    requestId: requestId || payload.requestId || null,
    sessionId: sessionId || payload.sessionId || null,
    createdAt: new Date().toISOString(),
  }

  await db.collection('platform_events').insertOne(event)

  if (!skipProcessors) {
    await runEventProcessors(event, db, {
      onFailure: async ({ event: ev, processor, error }) => {
        await writeDeadLetterEvent(db, {
          event: ev,
          processor,
          error,
          stack: error.stack,
        })
      },
    })

    void publishWebhookEvent(event, db).catch((err) => {
      console.error(`[platform_event] n8n webhook failed for ${baseType}:`, err.message)
    })
  }

  const handlers = listeners.get(baseType) || []
  for (const handler of handlers) {
    try {
      await handler(event)
    } catch (err) {
      console.error(`[platform_event] listener failed for ${baseType}:`, err.message)
      await writeDeadLetterEvent(db, {
        event,
        processor: `listener:${baseType}`,
        error: err,
        stack: err.stack,
      })
    }
  }

  return event
}

export function onPlatformEvent(type, handler) {
  const { type: baseType } = normalizeEventType(type)
  if (!listeners.has(baseType)) listeners.set(baseType, [])
  listeners.get(baseType).push(handler)
}

export function clearPlatformEventListeners() {
  listeners.clear()
}

export async function listPlatformEvents(orgId, {
  limit = 50,
  type = null,
  from = null,
  to = null,
  correlationId = null,
} = {}) {
  const db = await getDb()
  const filter = { orgId }
  if (type) filter.type = type.replace(/\.v\d+$/, '')
  if (correlationId) filter.correlationId = correlationId
  if (from || to) {
    filter.createdAt = {}
    if (from) filter.createdAt.$gte = from
    if (to) filter.createdAt.$lte = to
  }
  const cap = Math.min(Math.max(Number(limit) || 50, 1), 200)
  const items = await db.collection('platform_events')
    .find(filter, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .limit(cap)
    .toArray()
  return { success: true, items, count: items.length }
}

export async function getEventsByCorrelation(db, orgId, correlationId) {
  return db.collection('platform_events')
    .find({ orgId, correlationId }, { projection: { _id: 0 } })
    .sort({ createdAt: 1 })
    .toArray()
}
