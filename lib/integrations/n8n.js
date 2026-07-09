import { getDb } from '@/lib/mongo'

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || process.env.N8N_AGENT_WEBHOOK_URL || ''
const N8N_ENABLED = process.env.N8N_ENABLED !== 'false'

/** Event types forwarded to n8n by default. */
const DEFAULT_N8N_EVENTS = new Set([
  'agent.task.completed',
  'agent.action',
  'agent.failed',
  'agent.escalated',
  'agent.delegate.requested',
  'lead.created',
  'lead.qualified',
  'proposal.approved',
  'proposal.won',
  'payment.received',
  'invoice.paid',
  'customer.onboarded',
  'marketing.plan.completed',
  'marketing.content.publish',
  'marketing.followup.scheduled',
  'campaign.created',
  'campaign.executed',
  'campaign.completed',
])

export function isN8nEnabled() {
  return N8N_ENABLED && Boolean(N8N_WEBHOOK_URL)
}

export async function getOrgWebhookConfig(db, orgId) {
  const config = await db.collection('org_webhook_config').findOne({ orgId }, { projection: { _id: 0 } })
  return {
    enabled: config?.enabled ?? isN8nEnabled(),
    url: config?.url || N8N_WEBHOOK_URL,
    eventTypes: config?.eventTypes || [...DEFAULT_N8N_EVENTS],
    secret: config?.secret || process.env.N8N_WEBHOOK_SECRET || '',
  }
}

export async function publishWebhookEvent(event, dbIn = null) {
  const db = dbIn || await getDb()
  const config = await getOrgWebhookConfig(db, event.orgId)

  if (!config.enabled || !config.url) return { published: false, reason: 'disabled' }

  const eventTypes = new Set(config.eventTypes)
  if (!eventTypes.has(event.type) && !eventTypes.has('*')) {
    return { published: false, reason: 'event_type_not_subscribed' }
  }

  const payload = {
    id: event.id,
    type: event.type,
    version: event.version,
    orgId: event.orgId,
    entity: event.entity,
    entityId: event.entityId,
    agentId: event.agentId,
    correlationId: event.correlationId,
    payload: event.payload,
    createdAt: event.createdAt,
    source: 'leadedge360-platform',
  }

  const delivery = {
    orgId: event.orgId,
    eventId: event.id,
    eventType: event.type,
    url: config.url,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  try {
    const headers = { 'Content-Type': 'application/json' }
    if (config.secret) headers['X-Webhook-Secret'] = config.secret

    const res = await fetch(config.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    })

    delivery.status = res.ok ? 'delivered' : 'failed'
    delivery.httpStatus = res.status
    delivery.completedAt = new Date().toISOString()

    if (!res.ok) {
      delivery.error = `HTTP ${res.status}`
    }
  } catch (err) {
    delivery.status = 'failed'
    delivery.error = err.message
    delivery.completedAt = new Date().toISOString()
  }

  await db.collection('webhook_deliveries').insertOne(delivery)

  return {
    published: delivery.status === 'delivered',
    status: delivery.status,
    deliveryId: delivery.eventId,
  }
}

export async function listWebhookDeliveries(db, orgId, { limit = 50 } = {}) {
  return db.collection('webhook_deliveries')
    .find({ orgId }, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .limit(Math.min(limit, 100))
    .toArray()
}
