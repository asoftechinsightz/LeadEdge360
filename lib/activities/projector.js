import { randomUUID } from 'crypto'
import { format, formatDistanceToNow } from 'date-fns'
import {
  buildActivityHref,
  getActivityMeta,
  resolveActor,
} from '@/lib/activities/registry'

function parseDate(value) {
  if (!value) return null
  const d = value instanceof Date ? value : new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

function truncate(text, max = 120) {
  const s = String(text || '').trim()
  if (!s) return ''
  return s.length > max ? `${s.slice(0, max - 1)}…` : s
}

function formatDueDate(value) {
  const d = parseDate(value)
  if (!d) return ''
  return format(d, 'd MMM yyyy')
}

export function buildActivitySummary(type, payload = {}) {
  switch (type) {
    case 'followup_created':
    case 'followup.created':
      return payload.title
        ? `Next follow-up: ${formatDueDate(payload.dueAt) || 'scheduled'}`
        : (payload.dueAt ? `Next follow-up: ${formatDueDate(payload.dueAt)}` : '')
    case 'note_added':
      return truncate(payload.note || payload.summary, 120)
    case 'task_created':
    case 'task.created':
    case 'task.assigned':
      return payload.title ? `Task: ${payload.title}` : (payload.assignee ? `Assigned to ${payload.assignee}` : '')
    case 'status_change':
    case 'lead.updated':
      return payload.from && payload.to
        ? `Status: ${payload.from} → ${payload.to}`
        : (payload.to ? `Status: ${payload.to}` : '')
    case 'assigned':
      return payload.to ? `Assigned to: ${payload.to}` : ''
    case 'scanner_conversion':
    case 'scanner.result.converted':
      return payload.rating ? `Rating: ${payload.rating}★` : 'Converted from geo scan'
    case 'lead.created':
      return payload.name ? `New lead: ${payload.name}` : (payload.source ? `Source: ${payload.source}` : '')
    case 'proposal.created':
    case 'proposal_created':
      return payload.proposalNumber ? `Proposal ${payload.proposalNumber}` : 'New proposal'
    case 'proposal.won':
    case 'proposal_won':
      return payload.proposalNumber ? `Won: ${payload.proposalNumber}` : 'Marked as won'
    case 'proposal.converted_to_invoice':
    case 'invoice_created':
    case 'invoice.created':
      return payload.invoiceNumber ? `Invoice ${payload.invoiceNumber}` : 'Invoice generated'
    case 'invoice.paid':
      return payload.invoiceNumber ? `Paid: ${payload.invoiceNumber}` : 'Payment recorded'
    case 'campaign.executed':
    case 'campaign.created':
      return payload.campaignName ? `"${payload.campaignName}"` : (payload.name ? `"${payload.name}"` : '')
    case 'payment.received':
      return payload.amount ? `₹${Number(payload.amount).toLocaleString('en-IN')}` : 'Payment received'
    case 'agent.action':
      return truncate(payload.summary || payload.message, 120)
    case 'opportunity.created':
      return payload.name || payload.opportunityName || ''
    case 'meeting.scheduled':
      return payload.title ? `${payload.title} · ${formatDueDate(payload.scheduledAt)}` : ''
    default:
      return truncate(payload.summary || payload.message || payload.reason, 120)
  }
}

function buildSearchText(fields) {
  return [
    fields.title,
    fields.summary,
    fields.leadName,
    fields.companyName,
    fields.organizationName,
    fields.actorName,
    fields.proposalNumber,
    fields.invoiceNumber,
    fields.opportunityName,
    fields.type,
    fields.agentId,
  ].filter(Boolean).join(' ').toLowerCase()
}

function formatTimestamps(createdAt) {
  const d = parseDate(createdAt)
  return {
    createdAt: d ? d.toISOString() : null,
    relativeTime: d ? formatDistanceToNow(d, { addSuffix: true }) : '',
    timestamp: d ? format(d, 'd MMM yyyy, h:mm a') : '',
  }
}

export function buildActivityDocument({
  orgId,
  type,
  sourceKey,
  eventId = null,
  source = 'platform_event',
  entity = null,
  entityId = null,
  payload = {},
  userId = null,
  actorType = null,
  actorName = null,
  agentId = null,
  leadId = null,
  leadName = null,
  companyName = null,
  organizationName = null,
  opportunityName = null,
  proposalNumber = null,
  invoiceNumber = null,
  priority = null,
  status = null,
  tags = [],
  createdAt = null,
}) {
  const meta = getActivityMeta(type)
  const actor = resolveActor({ type, payload, actorType, actorName, agentId, source })
  const resolvedEntity = entity || meta.entity
  const resolvedEntityId = entityId || payload.entityId || leadId || null
  const href = buildActivityHref(resolvedEntity, resolvedEntityId, { ...payload, leadId })
  const title = payload.title || meta.title
  const summary = buildActivitySummary(type, payload)
  const times = formatTimestamps(createdAt || new Date())

  const doc = {
    id: randomUUID(),
    orgId,
    sourceKey,
    eventId,
    source,
    type,
    category: actor.actorType === 'agent' ? 'ai' : meta.category,
    title,
    summary,
    entity: resolvedEntity,
    entityId: resolvedEntityId,
    href,
    leadId: leadId || payload.leadId || (resolvedEntity === 'lead' ? resolvedEntityId : null),
    leadName: leadName || payload.leadName || payload.name || payload.clientName || null,
    companyName: companyName || payload.company || payload.companyName || null,
    organizationName: organizationName || null,
    opportunityName: opportunityName || payload.opportunityName || null,
    proposalNumber: proposalNumber || payload.proposalNumber || null,
    invoiceNumber: invoiceNumber || payload.invoiceNumber || null,
    actorType: actor.actorType,
    actorName: actor.actorName,
    agentId: actor.agentId,
    userId,
    priority: priority || payload.priority || null,
    status: status || payload.status || null,
    tags: tags.length ? tags : (payload.tags || []),
    icon: meta.icon,
    createdAt: times.createdAt,
  }

  doc.searchText = buildSearchText({
    ...doc,
    type,
    agentId: actor.agentId,
  })

  return { ...doc, ...times }
}

async function enrichFromLead(db, orgId, leadId) {
  if (!leadId) return {}
  const lead = await db.collection('leads').findOne(
    { orgId, id: leadId },
    { projection: { _id: 0, name: 1, company: 1 } },
  )
  if (!lead) return {}
  return { leadName: lead.name, companyName: lead.company }
}

async function enrichFromProposal(db, orgId, proposalId, payload) {
  if (payload.proposalNumber) return {}
  if (!proposalId) return {}
  const proposal = await db.collection('proposals').findOne(
    { orgId, $or: [{ id: proposalId }, { _id: proposalId }] },
    { projection: { _id: 0, proposalNumber: 1, clientName: 1, company: 1, leadId: 1 } },
  )
  if (!proposal) return {}
  return {
    proposalNumber: proposal.proposalNumber,
    leadName: proposal.clientName,
    companyName: proposal.company,
    leadId: proposal.leadId,
  }
}

export async function projectFromPlatformEvent(event, dbIn) {
  if (!event?.orgId || !event?.type) return null
  const db = dbIn
  const sourceKey = `platform_event:${event.id}`

  const existing = await db.collection('org_activities').findOne(
    { orgId: event.orgId, sourceKey },
    { projection: { _id: 0, id: 1 } },
  )
  if (existing) return existing

  const [org, leadEnrichment, proposalEnrichment] = await Promise.all([
    db.collection('orgs').findOne({ id: event.orgId }, { projection: { _id: 0, name: 1 } }),
    enrichFromLead(db, event.orgId, event.payload?.leadId),
    enrichFromProposal(db, event.orgId, event.entity === 'proposal' ? event.entityId : event.payload?.proposalId, event.payload || {}),
  ])

  const doc = buildActivityDocument({
    orgId: event.orgId,
    type: event.type,
    sourceKey,
    eventId: event.id,
    source: 'platform_event',
    entity: event.entity,
    entityId: event.entityId,
    payload: event.payload || {},
    userId: event.userId,
    organizationName: org?.name || '',
    createdAt: event.createdAt,
    ...leadEnrichment,
    ...proposalEnrichment,
  })

  await db.collection('org_activities').insertOne(doc)
  return doc
}

export async function projectFromTimelineRow(row, dbIn) {
  if (!row?.orgId || !row?.id) return null
  const db = dbIn
  const sourceKey = `lead_timeline:${row.id}`

  const existing = await db.collection('org_activities').findOne(
    { orgId: row.orgId, sourceKey },
    { projection: { _id: 0, id: 1 } },
  )
  if (existing) return existing

  const [org, leadEnrichment] = await Promise.all([
    db.collection('orgs').findOne({ id: row.orgId }, { projection: { _id: 0, name: 1 } }),
    enrichFromLead(db, row.orgId, row.leadId),
  ])

  const doc = buildActivityDocument({
    orgId: row.orgId,
    type: row.type,
    sourceKey,
    source: 'lead_timeline',
    entity: row.leadId ? 'lead' : 'activity',
    entityId: row.leadId,
    payload: row.payload || {},
    leadId: row.leadId,
    organizationName: org?.name || '',
    createdAt: row.createdAt,
    ...leadEnrichment,
  })

  await db.collection('org_activities').insertOne(doc)
  return doc
}

export async function insertLeadTimeline(db, doc) {
  await db.collection('lead_timeline').insertOne(doc)
  const activity = await projectFromTimelineRow(doc, db)
  return { timeline: doc, activity }
}
