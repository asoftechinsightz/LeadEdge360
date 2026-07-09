/** Unified activity type registry — categories, icons, titles, navigation. */

import { LEADS_LIST_PATH, leadDetailPath } from '@/lib/leads/paths'

export const ACTIVITY_CATEGORIES = {
  ALL: 'all',
  SALES: 'sales',
  MARKETING: 'marketing',
  FINANCE: 'finance',
  SUPPORT: 'support',
  AI: 'ai',
  SYSTEM: 'system',
  MINE: 'mine',
}

export const ACTIVITY_FILTERS = [
  { id: ACTIVITY_CATEGORIES.ALL, label: 'All Activities' },
  { id: ACTIVITY_CATEGORIES.SALES, label: 'Sales' },
  { id: ACTIVITY_CATEGORIES.MARKETING, label: 'Marketing' },
  { id: ACTIVITY_CATEGORIES.FINANCE, label: 'Finance' },
  { id: ACTIVITY_CATEGORIES.SUPPORT, label: 'Customer Support' },
  { id: ACTIVITY_CATEGORIES.AI, label: 'AI Activities' },
  { id: ACTIVITY_CATEGORIES.SYSTEM, label: 'System Events' },
  { id: ACTIVITY_CATEGORIES.MINE, label: 'My Activities' },
]

const TIMELINE_TYPES = {
  followup_created: { title: 'Follow-up Created', category: 'sales', icon: 'calendar', entity: 'followup' },
  note_added: { title: 'Note Added', category: 'sales', icon: 'message', entity: 'lead' },
  task_created: { title: 'Task Created', category: 'sales', icon: 'check', entity: 'task' },
  status_change: { title: 'Status Updated', category: 'sales', icon: 'activity', entity: 'lead' },
  assigned: { title: 'Lead Assigned', category: 'sales', icon: 'user', entity: 'lead' },
  scanner_conversion: { title: 'Lead from Geo Scanner', category: 'marketing', icon: 'map', entity: 'lead' },
  auto_conversion: { title: 'Auto-Converted Lead', category: 'ai', icon: 'sparkles', entity: 'lead' },
  proposal_created: { title: 'Proposal Created', category: 'sales', icon: 'file', entity: 'proposal' },
  proposal_won: { title: 'Proposal Won', category: 'sales', icon: 'trophy', entity: 'proposal' },
  invoice_created: { title: 'Invoice Created', category: 'finance', icon: 'receipt', entity: 'invoice' },
  system: { title: 'System Update', category: 'system', icon: 'settings', entity: 'system' },
}

const PLATFORM_TYPES = {
  'lead.created': { title: 'Lead Created', category: 'sales', icon: 'user', entity: 'lead' },
  'lead.updated': { title: 'Lead Updated', category: 'sales', icon: 'activity', entity: 'lead' },
  'lead.deleted': { title: 'Lead Archived', category: 'sales', icon: 'archive', entity: 'lead' },
  'lead.restored': { title: 'Lead Restored', category: 'sales', icon: 'user', entity: 'lead' },
  'opportunity.created': { title: 'Opportunity Created', category: 'sales', icon: 'target', entity: 'opportunity' },
  'opportunity.stage_changed': { title: 'Opportunity Stage Changed', category: 'sales', icon: 'target', entity: 'opportunity' },
  'proposal.created': { title: 'Proposal Generated', category: 'sales', icon: 'file', entity: 'proposal' },
  'proposal.won': { title: 'Proposal Won', category: 'sales', icon: 'trophy', entity: 'proposal' },
  'proposal.converted_to_invoice': { title: 'Invoice Generated', category: 'finance', icon: 'receipt', entity: 'invoice' },
  'invoice.paid': { title: 'Invoice Paid', category: 'finance', icon: 'receipt', entity: 'invoice' },
  'invoice.created': { title: 'Invoice Created', category: 'finance', icon: 'receipt', entity: 'invoice' },
  'campaign.created': { title: 'Campaign Created', category: 'marketing', icon: 'megaphone', entity: 'campaign' },
  'campaign.executed': { title: 'Campaign Launched', category: 'marketing', icon: 'megaphone', entity: 'campaign' },
  'payment.received': { title: 'Payment Received', category: 'finance', icon: 'payment', entity: 'payment' },
  'scanner.job.completed': { title: 'Geo Scan Completed', category: 'marketing', icon: 'map', entity: 'scanner' },
  'scanner.result.converted': { title: 'Scanner Lead Converted', category: 'marketing', icon: 'map', entity: 'lead' },
  'subscription.changed': { title: 'Subscription Updated', category: 'finance', icon: 'settings', entity: 'billing' },
  'task.created': { title: 'Task Created', category: 'sales', icon: 'check', entity: 'task' },
  'task.assigned': { title: 'Task Assigned', category: 'sales', icon: 'check', entity: 'task' },
  'meeting.scheduled': { title: 'Meeting Scheduled', category: 'sales', icon: 'calendar', entity: 'meeting' },
  'followup.created': { title: 'Follow-up Scheduled', category: 'support', icon: 'calendar', entity: 'followup' },
  'document.uploaded': { title: 'Document Uploaded', category: 'sales', icon: 'file', entity: 'document' },
  'agent.action': { title: 'AI Agent Action', category: 'ai', icon: 'bot', entity: 'agent' },
  'growth.audit.completed': { title: 'Growth Audit Completed', category: 'marketing', icon: 'sparkles', entity: 'audit' },
}

const AGENT_NAMES = {
  'proposal-ai': 'Proposal AI',
  'marketing-ai': 'Marketing AI',
  'lead-qualification-ai': 'Lead Qualification AI',
  'customer-success-ai': 'Customer Success AI',
  'sales-ai': 'Sales AI',
}

export function getActivityMeta(type) {
  return PLATFORM_TYPES[type] || TIMELINE_TYPES[type] || {
    title: String(type || 'activity').replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    category: 'sales',
    icon: 'activity',
    entity: 'activity',
  }
}

export function resolveAgentName(agentId, payload = {}) {
  if (payload.agentName) return payload.agentName
  if (!agentId) return null
  return AGENT_NAMES[agentId] || agentId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function buildActivityHref(entity, entityId, payload = {}) {
  if (payload.href) return payload.href
  const id = entityId || payload.entityId || payload.id
  switch (entity) {
    case 'lead':
      return id ? leadDetailPath(id) : LEADS_LIST_PATH
    case 'opportunity':
      return id ? `/opportunities?id=${encodeURIComponent(id)}` : '/opportunities'
    case 'proposal':
      return id ? `/proposals/${id}` : '/proposals'
    case 'invoice':
      return payload.invoiceId ? `/invoices` : '/invoices'
    case 'campaign':
      return id ? `/campaigns?id=${encodeURIComponent(id)}` : '/campaigns'
    case 'task':
      return payload.leadId ? leadDetailPath(payload.leadId) : '/dashboard'
    case 'followup':
      return payload.leadId ? leadDetailPath(payload.leadId) : '/dashboard'
    case 'meeting':
      return '/dashboard'
    case 'payment':
      return '/payments'
    case 'document':
      return payload.leadId ? leadDetailPath(payload.leadId) : '/dashboard'
    case 'scanner':
      return '/leadedge360/geo-finder'
    case 'billing':
      return '/settings'
    case 'audit':
      return '/growth-audit'
    case 'agent':
      return '/leadedge360/command-center'
    default:
      return payload.leadId ? leadDetailPath(payload.leadId) : null
  }
}

export function resolveActor(eventOrRow = {}) {
  const payload = eventOrRow.payload || {}
  let actorType = eventOrRow.actorType || payload.actorType || 'user'
  const agentId = eventOrRow.agentId || payload.agentId || null
  const agentName = resolveAgentName(agentId, payload)

  if (agentId || agentName || eventOrRow.source === 'agent' || payload.source === 'agent') {
    actorType = 'agent'
  } else if (
    actorType === 'system'
    || eventOrRow.source === 'system'
    || ['scanner_conversion', 'auto_conversion', 'system'].includes(eventOrRow.type)
  ) {
    actorType = 'system'
  }

  const actorName = agentName
    || eventOrRow.actorName
    || payload.actorName
    || payload.assignedBy
    || payload.createdBy
    || payload.userName
    || (actorType === 'system' ? 'System' : 'Team member')

  const actorEmoji = actorType === 'agent' ? '🤖' : actorType === 'system' ? '⚙️' : '👤'

  return {
    actorType,
    actorName,
    actorLabel: `${actorEmoji} ${actorName}`,
    agentId,
  }
}

export { PLATFORM_TYPES, TIMELINE_TYPES, AGENT_NAMES }
