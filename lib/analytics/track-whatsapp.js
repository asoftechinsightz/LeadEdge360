import { randomUUID } from 'crypto'
import { emitPlatformEvent } from '@/lib/events/bus'

const COLLECTION = 'whatsapp_analytics'

export const WHATSAPP_TRACK_EVENTS = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  REPLIED: 'replied',
  FAILED: 'failed',
}

/**
 * @param {import('mongodb').Db} db
 * @param {{ orgId: string, leadId?: string, threadId?: string, messageId?: string, templateName?: string, userId?: string, waMessageId?: string, metadata?: Record<string, unknown> }} input
 */
export async function trackWhatsAppSent(db, input) {
  return recordWhatsAppEvent(db, {
    ...input,
    eventType: WHATSAPP_TRACK_EVENTS.SENT,
    status: 'sent',
  })
}

/**
 * @param {import('mongodb').Db} db
 */
export async function trackWhatsAppDelivered(db, input) {
  return recordWhatsAppEvent(db, {
    ...input,
    eventType: WHATSAPP_TRACK_EVENTS.DELIVERED,
    status: 'delivered',
  })
}

/**
 * @param {import('mongodb').Db} db
 */
export async function trackWhatsAppReplied(db, input) {
  return recordWhatsAppEvent(db, {
    ...input,
    eventType: WHATSAPP_TRACK_EVENTS.REPLIED,
    status: 'replied',
  })
}

/**
 * @param {import('mongodb').Db} db
 */
async function recordWhatsAppEvent(db, {
  orgId,
  leadId = '',
  threadId = '',
  messageId = '',
  templateName = '',
  userId = '',
  waMessageId = '',
  eventType,
  status,
  metadata = {},
}) {
  if (!orgId || !eventType) return null

  const now = new Date().toISOString()
  const doc = {
    id: randomUUID(),
    orgId,
    leadId: String(leadId || ''),
    threadId: String(threadId || ''),
    messageId: String(messageId || ''),
    templateName: String(templateName || ''),
    waMessageId: String(waMessageId || ''),
    eventType,
    status,
    metadata,
    createdAt: now,
  }

  await db.collection(COLLECTION).insertOne(doc)

  await emitPlatformEvent({
    db,
    orgId,
    type: `whatsapp.message.${eventType}`,
    entity: 'lead',
    entityId: leadId || null,
    userId: userId || null,
    payload: {
      leadId,
      threadId,
      messageId,
      templateName,
      waMessageId,
      status,
      ...metadata,
    },
    source: 'whatsapp',
  })

  return doc
}

/**
 * Update delivery status from Meta webhook / status callback.
 * @param {import('mongodb').Db} db
 */
export async function recordWhatsAppDeliveryStatus(db, {
  orgId,
  waMessageId,
  status,
  leadId = '',
  threadId = '',
  messageId = '',
}) {
  if (!orgId || !waMessageId) return null

  const normalized = String(status || '').toLowerCase()
  if (normalized === 'delivered' || normalized === 'read') {
    return trackWhatsAppDelivered(db, {
      orgId,
      leadId,
      threadId,
      messageId,
      waMessageId,
      metadata: { deliveryStatus: normalized },
    })
  }
  if (normalized === 'failed') {
    return recordWhatsAppEvent(db, {
      orgId,
      leadId,
      threadId,
      messageId,
      waMessageId,
      eventType: WHATSAPP_TRACK_EVENTS.FAILED,
      status: 'failed',
      metadata: { deliveryStatus: normalized },
    })
  }
  return null
}

/**
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 * @param {{ since?: string }} [options]
 */
export async function getWhatsAppAnalyticsSummary(db, orgId, options = {}) {
  const filter = { orgId }
  if (options.since) filter.createdAt = { $gte: options.since }

  const events = await db.collection(COLLECTION)
    .find(filter, { projection: { _id: 0, eventType: 1 } })
    .toArray()

  const counts = events.reduce((acc, e) => {
    acc[e.eventType] = (acc[e.eventType] || 0) + 1
    return acc
  }, {})

  return {
    sent: counts.sent || 0,
    delivered: counts.delivered || 0,
    replied: counts.replied || 0,
    failed: counts.failed || 0,
    replyRate: counts.sent
      ? Math.round(((counts.replied || 0) / counts.sent) * 100)
      : 0,
  }
}
