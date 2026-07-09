/**
 * Canonical registry of Agentic AI employees — Phase 1 MVP (12 agents).
 * Single source for IDs, capabilities, event subscriptions, and approval policy.
 */

export const AGENT_STATUS = {
  IDLE: 'idle',
  ACTIVE: 'active',
  PAUSED: 'paused',
  DISABLED: 'disabled',
}

export const TASK_STATUS = {
  QUEUED: 'queued',
  RUNNING: 'running',
  AWAITING_APPROVAL: 'awaiting_approval',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
}

/** @type {Array<object>} */
export const AGENT_REGISTRY = [
  {
    id: 'lead-qualification-ai',
    name: 'Lead Qualification AI',
    role: 'Sales',
    description: 'Scores and qualifies new leads using AI and CRM signals.',
    subscribedEvents: ['lead.created', 'lead.updated'],
    capabilities: ['score_lead', 'assign_priority', 'recommend_next_action'],
    autoRun: true,
    requiresApproval: false,
  },
  {
    id: 'proposal-ai',
    name: 'Proposal AI',
    role: 'Sales',
    description: 'Generates proposals from opportunities and lead context.',
    subscribedEvents: ['opportunity.created', 'opportunity.stage_changed'],
    capabilities: ['generate_proposal', 'suggest_pricing'],
    autoRun: false,
    requiresApproval: true,
  },
  {
    id: 'sales-ai',
    name: 'Sales AI',
    role: 'Sales',
    description: 'Manages follow-ups, tasks, and sales cadence.',
    subscribedEvents: ['followup.created', 'task.created', 'lead.created'],
    capabilities: ['schedule_followup', 'draft_outreach'],
    autoRun: true,
    requiresApproval: false,
  },
  {
    id: 'marketing-ai',
    name: 'Marketing AI',
    role: 'Marketing',
    description: 'Launches and optimizes campaigns.',
    subscribedEvents: ['campaign.created', 'campaign.executed'],
    capabilities: ['launch_campaign', 'optimize_audience'],
    autoRun: true,
    requiresApproval: false,
  },
  {
    id: 'customer-success-ai',
    name: 'Customer Success AI',
    role: 'Support',
    description: 'Onboarding, health checks, and renewal preparation.',
    subscribedEvents: ['proposal.won', 'invoice.paid', 'customer.onboarded'],
    capabilities: ['schedule_onboarding', 'health_check'],
    autoRun: true,
    requiresApproval: false,
  },
  {
    id: 'finance-ai',
    name: 'Finance AI',
    role: 'Finance',
    description: 'Invoice generation, payment tracking, and revenue recognition.',
    subscribedEvents: ['proposal.converted_to_invoice', 'invoice.paid', 'payment.received'],
    capabilities: ['track_payment', 'reconcile_invoice'],
    autoRun: true,
    requiresApproval: false,
  },
  {
    id: 'revenue-intelligence-ai',
    name: 'Revenue Intelligence AI',
    role: 'Finance',
    description: 'Pipeline forecasting and revenue insights.',
    subscribedEvents: ['proposal.won', 'opportunity.stage_changed', 'payment.received'],
    capabilities: ['forecast_revenue', 'pipeline_analysis'],
    autoRun: true,
    requiresApproval: false,
  },
  {
    id: 'geo-scanner-ai',
    name: 'Geo Scanner AI',
    role: 'Marketing',
    description: 'Geo lead discovery and scanner result enrichment.',
    subscribedEvents: ['scanner.job.completed', 'scanner.result.converted'],
    capabilities: ['enrich_scan_results', 'prioritize_geo_leads'],
    autoRun: true,
    requiresApproval: false,
  },
  {
    id: 'meeting-scheduler-ai',
    name: 'Meeting Scheduler AI',
    role: 'Sales',
    description: 'Schedules meetings and calendar events for hot leads.',
    subscribedEvents: ['lead.created', 'opportunity.created'],
    capabilities: ['schedule_meeting', 'send_calendar_invite'],
    autoRun: false,
    requiresApproval: true,
  },
  {
    id: 'churn-prediction-ai',
    name: 'Churn Prediction AI',
    role: 'Support',
    description: 'Identifies at-risk customers and suggests retention actions.',
    subscribedEvents: ['invoice.paid', 'followup.created'],
    capabilities: ['score_churn_risk', 'retention_playbook'],
    autoRun: true,
    requiresApproval: false,
  },
  {
    id: 'ceo-ai',
    name: 'CEO AI',
    role: 'Executive',
    description: 'Executive briefings, KPI summaries, and strategic alerts.',
    subscribedEvents: ['proposal.won', 'payment.received', 'growth.audit.completed', 'agent.task.completed'],
    capabilities: ['daily_briefing', 'strategic_alert'],
    autoRun: true,
    requiresApproval: false,
  },
  {
    id: 'document-ai',
    name: 'Document AI',
    role: 'Operations',
    description: 'Processes uploaded documents and extracts CRM data.',
    subscribedEvents: ['document.uploaded'],
    capabilities: ['extract_entities', 'attach_to_lead'],
    autoRun: false,
    requiresApproval: true,
  },
]

export function getAgentById(agentId) {
  return AGENT_REGISTRY.find((a) => a.id === agentId) || null
}

export function getAgentsForEvent(eventType) {
  const base = String(eventType || '').replace(/\.v\d+$/, '')
  return AGENT_REGISTRY.filter((a) => a.subscribedEvents.includes(base))
}

export function listAgents() {
  return AGENT_REGISTRY.map((a) => ({
    id: a.id,
    name: a.name,
    role: a.role,
    description: a.description,
    capabilities: a.capabilities,
    autoRun: a.autoRun,
    requiresApproval: a.requiresApproval,
    subscribedEvents: a.subscribedEvents,
  }))
}
