import { format, formatDistanceToNow } from 'date-fns'
import { resolveActor } from '@/lib/activities/registry'
import { buildActivitySummary } from '@/lib/activities/projector'
import { leadDetailPath } from '@/lib/leads/paths'

const ACTIVITY_TITLES = {
  followup_created: 'Follow-up Created',
  note_added: 'Note Added',
  task_created: 'Task Created',
  status_change: 'Status Updated',
  assigned: 'Lead Assigned',
  scanner_conversion: 'Lead from Geo Scanner',
  auto_conversion: 'Auto-Converted Lead',
  system: 'System Update',
  proposal_created: 'Proposal Created',
  proposal_won: 'Proposal Won',
  invoice_created: 'Invoice Created',
}

function parseDate(value) {
  if (!value) return null
  const d = value instanceof Date ? value : new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

function formatExactTime(value) {
  const d = parseDate(value)
  if (!d) return ''
  return format(d, 'd MMM yyyy, h:mm a')
}

function formatRelativeTime(value) {
  const d = parseDate(value)
  if (!d) return ''
  return formatDistanceToNow(d, { addSuffix: true })
}

function resolveIcon(type) {
  const map = {
    followup_created: 'calendar',
    note_added: 'message',
    task_created: 'check',
    status_change: 'activity',
    assigned: 'user',
    scanner_conversion: 'map',
    auto_conversion: 'sparkles',
    proposal_created: 'file',
    proposal_won: 'trophy',
    invoice_created: 'receipt',
    system: 'settings',
    'lead.created': 'user',
    'proposal.won': 'trophy',
    'campaign.executed': 'megaphone',
    'invoice.paid': 'receipt',
    'payment.received': 'payment',
    'agent.action': 'bot',
    'meeting.scheduled': 'calendar',
  }
  return map[type] || 'activity'
}

/**
 * Format stored org_activities row for API/UI consumption.
 */
export function formatActivityResponse(row, { orgName = '', branding = {} } = {}) {
  const createdAt = row.createdAt
  const actor = resolveActor(row)
  const href = row.href || (row.leadId ? leadDetailPath(row.leadId) : null)

  return {
    id: row.id,
    type: row.type,
    category: row.category,
    title: row.title || ACTIVITY_TITLES[row.type] || row.type,
    summary: row.summary || buildActivitySummary(row.type, row.payload || {}),
    leadName: row.leadName || 'Unknown contact',
    companyName: row.companyName || '—',
    opportunityName: row.opportunityName || null,
    proposalNumber: row.proposalNumber || null,
    invoiceNumber: row.invoiceNumber || null,
    contactName: row.leadName || null,
    organizationName: row.organizationName || orgName || branding.companyName || null,
    actorType: row.actorType || actor.actorType,
    actorName: row.actorName || actor.actorName,
    actorLabel: row.actorLabel || actor.actorLabel,
    agentId: row.agentId || actor.agentId,
    priority: row.priority || null,
    status: row.status || null,
    tags: row.tags || [],
    icon: row.icon || resolveIcon(row.type),
    href,
    leadHref: href,
    brandingColor: branding.primaryColor || null,
    createdAt: createdAt ? new Date(createdAt).toISOString() : null,
    relativeTime: row.relativeTime || formatRelativeTime(createdAt),
    timestamp: row.timestamp || formatExactTime(createdAt),
    text: `${row.title || 'Activity'} — ${row.leadName || 'Contact'}${row.companyName && row.companyName !== '—' ? ` (${row.companyName})` : ''}`,
    time: row.relativeTime || formatRelativeTime(createdAt),
  }
}

/**
 * @deprecated Use formatActivityResponse for org_activities rows.
 */
export function formatActivityItem(row, leadMap, orgName = '') {
  const lead = leadMap.get(row.leadId) || {}
  const leadName = lead.name || lead.contactName || 'Unknown contact'
  const companyName = lead.company || '—'
  const type = row.type || 'activity'
  const title = ACTIVITY_TITLES[type] || type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const summary = buildActivitySummary(type, row.payload)
  const actor = resolveActor(row)
  const createdAt = row.createdAt
  const href = row.leadId ? leadDetailPath(row.leadId) : null

  return {
    id: row.id,
    type,
    title,
    summary,
    leadName,
    companyName,
    opportunityName: row.payload?.opportunityName || null,
    proposalNumber: row.payload?.proposalNumber || null,
    invoiceNumber: row.payload?.invoiceNumber || null,
    contactName: lead.name || null,
    organizationName: orgName || null,
    actorType: actor.actorType,
    actorName: actor.actorName,
    actorLabel: actor.actorLabel,
    agentId: actor.agentId,
    icon: resolveIcon(type),
    href,
    leadHref: href,
    createdAt: createdAt ? new Date(createdAt).toISOString() : null,
    relativeTime: formatRelativeTime(createdAt),
    timestamp: formatExactTime(createdAt),
    text: `${title} — ${leadName}${companyName && companyName !== '—' ? ` (${companyName})` : ''}`,
    time: formatRelativeTime(createdAt),
  }
}

export { ACTIVITY_TITLES, formatRelativeTime, formatExactTime }
