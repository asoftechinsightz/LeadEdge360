/**
 * Central Event Schema Registry — platform documentation for developers and AI agents.
 * Each event defines name, version, producer, consumers, payload schema, description.
 */

export const EVENT_SCHEMAS = {
  'lead.created': {
    version: 1,
    producers: ['api', 'scanner', 'growth-audit'],
    consumers: ['activity_projection', 'notification_projection', 'analytics', 'ai_memory'],
    description: 'A new lead was created in the CRM.',
    payload: {
      name: 'string?',
      source: 'string?',
      score: 'number?',
      company: 'string?',
      leadId: 'string?',
    },
  },
  'lead.updated': {
    version: 1,
    producers: ['api'],
    consumers: ['activity_projection', 'analytics', 'agent_runtime'],
    description: 'Lead record was updated.',
    payload: { from: 'string?', to: 'string?', leadId: 'string?', fields: 'array?' },
  },
  'lead.assigned': {
    version: 1,
    producers: ['api'],
    consumers: ['activity_projection', 'notification_projection', 'agent_runtime'],
    description: 'Lead assigned to sales agent.',
    payload: { leadId: 'string?', from: 'string?', to: 'string?' },
  },
  'lead.qualified': {
    version: 1,
    producers: ['api', 'agent:lead-qualification-ai'],
    consumers: ['activity_projection', 'analytics', 'agent_runtime'],
    description: 'Lead marked as qualified.',
    payload: { leadId: 'string?', score: 'number?' },
  },
  'lead.converted': {
    version: 1,
    producers: ['api', 'opportunities'],
    consumers: ['activity_projection', 'analytics', 'agent_runtime'],
    description: 'Lead converted to opportunity or won.',
    payload: { leadId: 'string?', from: 'string?', to: 'string?' },
  },
  'lead.lost': {
    version: 1,
    producers: ['api', 'opportunities'],
    consumers: ['activity_projection', 'analytics'],
    description: 'Lead marked as lost.',
    payload: { leadId: 'string?', reason: 'string?' },
  },
  'lead.deleted': {
    version: 1,
    producers: ['api'],
    consumers: ['activity_projection', 'audit'],
    description: 'Lead was soft-deleted/archived.',
    payload: { leadId: 'string?' },
  },
  'lead.restored': {
    version: 1,
    producers: ['api'],
    consumers: ['activity_projection'],
    description: 'Archived lead was restored.',
    payload: { leadId: 'string?' },
  },
  'opportunity.created': {
    version: 1,
    producers: ['api', 'opportunities'],
    consumers: ['activity_projection', 'analytics'],
    description: 'Sales opportunity created from a lead.',
    payload: { name: 'string?', opportunityName: 'string?', leadId: 'string?', amount: 'number?' },
  },
  'opportunity.stage_changed': {
    version: 1,
    producers: ['api', 'opportunities'],
    consumers: ['activity_projection', 'analytics', 'agent_runtime'],
    description: 'Opportunity pipeline stage changed.',
    payload: { from: 'string?', to: 'string?', opportunityId: 'string?', leadId: 'string?' },
  },
  'opportunity.won': {
    version: 1,
    producers: ['opportunities', 'proposals'],
    consumers: ['activity_projection', 'analytics', 'agent_runtime'],
    description: 'Opportunity won.',
    payload: { opportunityId: 'string?', amount: 'number?', name: 'string?' },
  },
  'opportunity.lost': {
    version: 1,
    producers: ['opportunities'],
    consumers: ['activity_projection', 'analytics'],
    description: 'Opportunity lost.',
    payload: { opportunityId: 'string?', name: 'string?' },
  },
  'proposal.created': {
    version: 1,
    producers: ['proposals', 'agent:proposal-ai'],
    consumers: ['activity_projection', 'notification_projection', 'analytics', 'agent_runtime'],
    description: 'Proposal document generated.',
    payload: { proposalNumber: 'string?', clientName: 'string?', leadId: 'string?', totalAmount: 'number?' },
  },
  'proposal.sent': {
    version: 1,
    producers: ['proposals'],
    consumers: ['activity_projection', 'notification_projection'],
    description: 'Proposal sent to client.',
    payload: { proposalNumber: 'string?', clientName: 'string?' },
  },
  'proposal.approved': {
    version: 1,
    producers: ['proposals'],
    consumers: ['activity_projection', 'analytics', 'agent_runtime'],
    description: 'Proposal approved by client.',
    payload: { proposalNumber: 'string?', totalAmount: 'number?' },
  },
  'proposal.rejected': {
    version: 1,
    producers: ['proposals'],
    consumers: ['activity_projection', 'analytics'],
    description: 'Proposal rejected.',
    payload: { proposalNumber: 'string?' },
  },
  'proposal.won': {
    version: 1,
    producers: ['proposals'],
    consumers: ['activity_projection', 'analytics', 'revenue'],
    description: 'Proposal marked as won.',
    payload: { proposalNumber: 'string?', totalAmount: 'number?', clientName: 'string?' },
  },
  'proposal.converted_to_invoice': {
    version: 1,
    producers: ['proposals'],
    consumers: ['activity_projection', 'notification_projection', 'analytics'],
    description: 'Proposal converted to invoice.',
    payload: { proposalNumber: 'string?', invoiceNumber: 'string?', proposalId: 'string?' },
  },
  'invoice.created': {
    version: 1,
    producers: ['proposals', 'billing'],
    consumers: ['activity_projection', 'analytics'],
    description: 'Invoice created.',
    payload: { invoiceNumber: 'string?', clientName: 'string?' },
  },
  'invoice.paid': {
    version: 1,
    producers: ['payments', 'billing'],
    consumers: ['activity_projection', 'notification_projection', 'analytics', 'revenue', 'agent_runtime'],
    description: 'Invoice payment received.',
    payload: { invoiceNumber: 'string?', amount: 'number?' },
  },
  'invoice.closed': {
    version: 1,
    producers: ['payments', 'billing'],
    consumers: ['activity_projection', 'analytics'],
    description: 'Invoice fully paid and closed.',
    payload: { invoiceNumber: 'string?', amount: 'number?' },
  },
  'payment.partial': {
    version: 1,
    producers: ['payments'],
    consumers: ['activity_projection', 'analytics', 'agent_runtime'],
    description: 'Partial payment received.',
    payload: { amount: 'number?', invoiceNumber: 'string?' },
  },
  'payment.failed': {
    version: 1,
    producers: ['payments'],
    consumers: ['activity_projection', 'notification_projection'],
    description: 'Payment attempt failed.',
    payload: { amount: 'number?', orderId: 'string?' },
  },
  'campaign.created': {
    version: 1,
    producers: ['campaigns', 'agent:marketing-ai'],
    consumers: ['activity_projection', 'analytics', 'agent_runtime'],
    description: 'Marketing campaign created.',
    payload: { campaignName: 'string?', name: 'string?', channel: 'string?' },
  },
  'campaign.started': {
    version: 1,
    producers: ['campaigns'],
    consumers: ['activity_projection', 'analytics'],
    description: 'Campaign execution started.',
    payload: { campaignName: 'string?', totalLeads: 'number?' },
  },
  'campaign.completed': {
    version: 1,
    producers: ['campaigns'],
    consumers: ['activity_projection', 'analytics', 'agent_runtime'],
    description: 'Campaign execution completed.',
    payload: { campaignName: 'string?', messagesSent: 'number?' },
  },
  'campaign.executed': {
    version: 1,
    producers: ['campaigns', 'agent:marketing-ai'],
    consumers: ['activity_projection', 'notification_projection', 'analytics'],
    description: 'Campaign launched or executed.',
    payload: { campaignName: 'string?', name: 'string?' },
  },
  'payment.received': {
    version: 1,
    producers: ['payments', 'billing'],
    consumers: ['activity_projection', 'analytics', 'revenue', 'agent_runtime'],
    description: 'Payment received.',
    payload: { amount: 'number?', invoiceNumber: 'string?' },
  },
  'customer.onboarded': {
    version: 1,
    producers: ['agent:customer-success-ai'],
    consumers: ['activity_projection', 'analytics', 'agent_runtime'],
    description: 'Customer onboarding initiated.',
    payload: { customerId: 'string?', clientName: 'string?' },
  },
  'customer.health_score_changed': {
    version: 1,
    producers: ['agent:churn-prediction-ai'],
    consumers: ['activity_projection', 'analytics'],
    description: 'Customer health score updated.',
    payload: { customerId: 'string?', churnRisk: 'string?', score: 'number?' },
  },
  'customer.renewal_due': {
    version: 1,
    producers: ['agent:customer-success-ai'],
    consumers: ['activity_projection', 'notification_projection'],
    description: 'Customer renewal approaching.',
    payload: { customerId: 'string?', renewalDate: 'string?' },
  },
  'task.created': {
    version: 1,
    producers: ['api'],
    consumers: ['activity_projection'],
    description: 'Task created on a lead.',
    payload: { title: 'string?', leadId: 'string?' },
  },
  'task.assigned': {
    version: 1,
    producers: ['api', 'agent:sales-ai'],
    consumers: ['activity_projection', 'ai_memory'],
    description: 'Task assigned to user or agent.',
    payload: { title: 'string?', assignee: 'string?', leadId: 'string?' },
  },
  'meeting.scheduled': {
    version: 1,
    producers: ['api', 'agent:customer-success-ai'],
    consumers: ['activity_projection'],
    description: 'Meeting or calendar event scheduled.',
    payload: { title: 'string?', scheduledAt: 'string?', leadId: 'string?' },
  },
  'followup.created': {
    version: 1,
    producers: ['api'],
    consumers: ['activity_projection'],
    description: 'Follow-up scheduled.',
    payload: { title: 'string?', dueAt: 'string?', leadId: 'string?' },
  },
  'document.uploaded': {
    version: 1,
    producers: ['documents'],
    consumers: ['activity_projection'],
    description: 'Document attached to a record.',
    payload: { docType: 'string?', leadId: 'string?' },
  },
  'agent.action': {
    version: 1,
    producers: ['agent-runtime'],
    consumers: ['activity_projection', 'ai_memory', 'audit'],
    description: 'Agentic AI employee performed an action.',
    payload: {
      agentId: 'string',
      agentName: 'string?',
      summary: 'string?',
      confidence: 'number?',
      explanation: 'string?',
    },
  },
  'agent.task.completed': {
    version: 1,
    producers: ['agent-runtime'],
    consumers: ['activity_projection', 'ai_memory', 'analytics', 'n8n', 'agent_runtime'],
    description: 'AI agent completed a task.',
    payload: {
      agentId: 'string',
      taskId: 'string?',
      status: 'string?',
      confidence: 'number?',
    },
  },
  'agent.started': {
    version: 1,
    producers: ['agent-runtime'],
    consumers: ['analytics', 'n8n'],
    description: 'AI agent started processing a task.',
    payload: { agentId: 'string', taskId: 'string?' },
  },
  'agent.waiting': {
    version: 1,
    producers: ['agent-runtime'],
    consumers: ['notification_projection', 'n8n'],
    description: 'AI agent waiting for human approval.',
    payload: { agentId: 'string', taskId: 'string?', approverRole: 'string?' },
  },
  'agent.completed': {
    version: 1,
    producers: ['agent-runtime'],
    consumers: ['analytics', 'n8n'],
    description: 'AI agent completed execution.',
    payload: { agentId: 'string', taskId: 'string?', confidence: 'number?' },
  },
  'agent.failed': {
    version: 1,
    producers: ['agent-runtime'],
    consumers: ['analytics', 'notification_projection', 'n8n'],
    description: 'AI agent task failed.',
    payload: { agentId: 'string', taskId: 'string?', error: 'string?' },
  },
  'agent.escalated': {
    version: 1,
    producers: ['agent-runtime'],
    consumers: ['notification_projection', 'n8n'],
    description: 'AI agent escalated to another agent.',
    payload: { fromAgentId: 'string', toAgentId: 'string', taskId: 'string?' },
  },
  'agent.delegate.requested': {
    version: 1,
    producers: ['agent-runtime'],
    consumers: ['agent_runtime', 'n8n'],
    description: 'Agent delegation requested via event bus.',
    payload: { fromAgentId: 'string', toAgentId: 'string', reason: 'string?' },
  },
  'scanner.job.completed': {
    version: 1,
    producers: ['scanner'],
    consumers: ['activity_projection', 'analytics'],
    description: 'Geo scanner job finished.',
    payload: { jobId: 'string?', resultCount: 'number?' },
  },
  'scanner.result.converted': {
    version: 1,
    producers: ['scanner'],
    consumers: ['activity_projection', 'analytics'],
    description: 'Scanner result converted to CRM lead.',
    payload: { leadId: 'string?', rating: 'number?' },
  },
  'subscription.changed': {
    version: 1,
    producers: ['billing'],
    consumers: ['activity_projection', 'analytics'],
    description: 'Subscription plan changed.',
    payload: { plan: 'string?', status: 'string?' },
  },
  'growth.audit.completed': {
    version: 1,
    producers: ['growth-audit'],
    consumers: ['activity_projection', 'analytics'],
    description: 'Growth audit completed.',
    payload: { score: 'number?', summary: 'string?' },
  },
}

export function getEventSchema(type) {
  const base = String(type || '').replace(/\.v\d+$/, '')
  return EVENT_SCHEMAS[base] || null
}

export function listEventSchemas() {
  return Object.entries(EVENT_SCHEMAS).map(([name, schema]) => ({
    name,
    versionedName: `${name}.v${schema.version}`,
    ...schema,
  }))
}

export function validateEventPayload(type, payload = {}) {
  const schema = getEventSchema(type)
  if (!schema) return { valid: true, warnings: [`Unknown event type: ${type}`] }
  const warnings = []
  for (const [key, spec] of Object.entries(schema.payload)) {
    const required = !spec.endsWith('?')
    if (required && (payload[key] === undefined || payload[key] === null)) {
      warnings.push(`Missing required payload field: ${key}`)
    }
  }
  return { valid: warnings.length === 0, warnings }
}
