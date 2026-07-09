import { randomUUID } from 'crypto'
import { getSubscription } from '@/lib/billing/get-subscription'
import { resolvePlanCode } from '@/lib/billing/plan-map'

const ZENDESK_SUBDOMAIN = process.env.ZENDESK_SUBDOMAIN || ''
const ZENDESK_EMAIL = process.env.ZENDESK_EMAIL || ''
const ZENDESK_API_TOKEN = process.env.ZENDESK_API_TOKEN || ''

export const ENTERPRISE_PLANS = new Set([
  'LEAD_ENTERPRISE',
  'RETAIL_ENTERPRISE',
  'SUITE_ENTERPRISE',
  'ENTERPRISE',
  'SCALE',
])

export const PRIORITY_PLANS = new Set([
  'LEAD_BUSINESS',
  'SUITE_BUSINESS',
  'BUSINESS_GROWTH',
  'PROFESSIONAL',
  'PRO',
  'GROWTH',
])

/** SLA profiles keyed by tier */
export const SLA_PROFILES = {
  enterprise: {
    tier: 'enterprise',
    label: 'Enterprise SLA',
    responseTime: '1 hour',
    responseTimeMs: 60 * 60 * 1000,
    ticketPriority: 'urgent',
    dedicatedCsm: true,
    channels: ['email', 'phone', 'slack'],
    description: 'Premium SLA with dedicated Customer Success Manager',
  },
  priority: {
    tier: 'priority',
    label: 'Priority Support',
    responseTime: '4 hours',
    responseTimeMs: 4 * 60 * 60 * 1000,
    ticketPriority: 'high',
    dedicatedCsm: false,
    channels: ['email', 'chat'],
    description: 'Business-hours priority queue',
  },
  standard: {
    tier: 'standard',
    label: 'Standard Support',
    responseTime: '24 hours',
    responseTimeMs: 24 * 60 * 60 * 1000,
    ticketPriority: 'normal',
    dedicatedCsm: false,
    channels: ['email'],
    description: 'Email support during business hours',
  },
}

/**
 * @param {string} planCode
 */
export function resolveSlaTier(planCode) {
  const code = resolvePlanCode(planCode)
  if (ENTERPRISE_PLANS.has(code)) return 'enterprise'
  if (PRIORITY_PLANS.has(code)) return 'priority'
  return 'standard'
}

/**
 * @param {string} planCode
 */
export function getSlaProfile(planCode) {
  const tier = resolveSlaTier(planCode)
  return SLA_PROFILES[tier]
}

/**
 * Zendesk priority + routing tags for Enterprise tier.
 * @param {string} planCode
 * @param {object} [ticket]
 */
export function routeTicketPriority(planCode, ticket = {}) {
  const profile = getSlaProfile(planCode)
  const isEnterprise = profile.tier === 'enterprise'

  const tags = [
    `plan_${resolvePlanCode(planCode).toLowerCase()}`,
    `sla_${profile.tier}`,
    ...(ticket.category ? [`category_${ticket.category}`] : []),
  ]

  if (isEnterprise) {
    tags.push('enterprise_routing', 'dedicated_csm_queue')
  }

  return {
    priority: profile.ticketPriority,
    slaTier: profile.tier,
    tags,
    groupId: isEnterprise
      ? process.env.ZENDESK_ENTERPRISE_GROUP_ID || null
      : process.env.ZENDESK_STANDARD_GROUP_ID || null,
    responseDueAt: new Date(Date.now() + profile.responseTimeMs).toISOString(),
    dedicatedCsm: profile.dedicatedCsm,
  }
}

export function isZendeskConfigured() {
  return Boolean(ZENDESK_SUBDOMAIN && ZENDESK_EMAIL && ZENDESK_API_TOKEN)
}

/**
 * Create ticket in Zendesk (or noop when not configured).
 * @param {object} input
 */
export async function createZendeskTicket(input) {
  const {
    subject,
    body,
    requesterEmail,
    requesterName,
    priority = 'normal',
    tags = [],
    groupId = null,
  } = input

  if (!isZendeskConfigured()) {
    return {
      ok: false,
      external: false,
      message: 'Zendesk not configured — ticket stored locally',
    }
  }

  const auth = Buffer.from(`${ZENDESK_EMAIL}/token:${ZENDESK_API_TOKEN}`).toString('base64')
  const payload = {
    ticket: {
      subject,
      comment: { body },
      priority,
      tags,
      requester: { name: requesterName || requesterEmail, email: requesterEmail },
      ...(groupId ? { group_id: Number(groupId) } : {}),
    },
  }

  const res = await fetch(`https://${ZENDESK_SUBDOMAIN}.zendesk.com/api/v2/tickets.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    return {
      ok: false,
      external: true,
      message: data.error || data.description || `Zendesk error (${res.status})`,
    }
  }

  return {
    ok: true,
    external: true,
    zendeskId: data.ticket?.id,
    zendeskUrl: data.ticket?.url,
    status: data.ticket?.status,
  }
}

/**
 * Load org SLA profile + CSM assignment.
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 */
export async function getOrgSupportProfile(db, orgId) {
  const subscription = await getSubscription(orgId)
  const planCode = resolvePlanCode(subscription?.planCode || 'LEAD_BUSINESS')
  const sla = getSlaProfile(planCode)

  const org = await db.collection('orgs').findOne({ id: orgId }, { projection: { _id: 0, name: 1 } })
  const assignment = await db.collection('org_support_assignments').findOne({ orgId })

  const openTickets = await db.collection('support_tickets').countDocuments({
    orgId,
    status: { $in: ['OPEN', 'open', 'PENDING', 'pending'] },
  })

  const recentTickets = await db.collection('support_tickets')
    .find({ orgId }, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .limit(10)
    .toArray()

  return {
    orgId,
    orgName: org?.name || orgId,
    planCode,
    sla: {
      ...sla,
      dedicatedCsm: sla.dedicatedCsm,
      csmName: assignment?.csmName || (sla.dedicatedCsm ? 'Your dedicated CSM (assigning…)' : null),
      csmEmail: assignment?.csmEmail || (sla.dedicatedCsm ? process.env.SUPPORT_CSM_EMAIL || 'success@asoftechinsightz.com' : null),
    },
    openTickets,
    recentTickets,
    zendeskEnabled: isZendeskConfigured(),
  }
}

/**
 * Create org support ticket with Enterprise priority routing.
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 * @param {object} user
 * @param {{ subject: string, body: string, category?: string }} input
 */
export async function createOrgSupportTicket(db, orgId, user, input) {
  const subscription = await getSubscription(orgId)
  const planCode = resolvePlanCode(subscription?.planCode || 'LEAD_BUSINESS')
  const routing = routeTicketPriority(planCode, input)
  const now = new Date().toISOString()

  const zendesk = await createZendeskTicket({
    subject: input.subject,
    body: input.body,
    requesterEmail: user.email,
    requesterName: user.fullName || user.name || user.email,
    priority: routing.priority,
    tags: routing.tags,
    groupId: routing.groupId,
  })

  const ticket = {
    id: randomUUID(),
    orgId,
    userId: user.id,
    subject: input.subject,
    body: input.body,
    category: input.category || 'general',
    status: 'OPEN',
    priority: routing.priority,
    slaTier: routing.slaTier,
    responseDueAt: routing.responseDueAt,
    dedicatedCsm: routing.dedicatedCsm,
    zendeskId: zendesk.zendeskId || null,
    zendeskUrl: zendesk.zendeskUrl || null,
    syncedToZendesk: zendesk.ok && zendesk.external,
    createdAt: now,
    updatedAt: now,
  }

  await db.collection('support_tickets').insertOne(ticket)

  if (routing.dedicatedCsm && !await db.collection('org_support_assignments').findOne({ orgId })) {
    await db.collection('org_support_assignments').updateOne(
      { orgId },
      {
        $set: {
          orgId,
          csmName: process.env.SUPPORT_CSM_NAME || 'Priya Iyer',
          csmEmail: process.env.SUPPORT_CSM_EMAIL || 'success@asoftechinsightz.com',
          assignedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    )
  }

  return { ticket, zendesk, routing }
}
