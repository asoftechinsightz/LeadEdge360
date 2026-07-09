import { getAgentById } from '@/lib/agents/registry'
import { getTool } from '@/lib/agents/tools/registry'

/** Default least-privilege permissions per agent. */
const AGENT_PERMISSIONS = {
  'lead-qualification-ai': {
    allowedModules: ['crm', 'analytics'],
    allowedTools: ['lead_search', 'crm_search', 'knowledge_base'],
    allowedActions: ['read', 'update'],
    maxApprovalLimit: 0,
    rateLimitPerHour: 200,
  },
  'proposal-ai': {
    allowedModules: ['crm', 'proposals'],
    allowedTools: ['proposal_generator', 'customer_lookup', 'crm_search'],
    allowedActions: ['read', 'create'],
    maxApprovalLimit: 500000,
    rateLimitPerHour: 50,
  },
  'sales-ai': {
    allowedModules: ['crm', 'communications', 'scheduling'],
    allowedTools: ['lead_search', 'email', 'whatsapp', 'calendar'],
    allowedActions: ['read', 'create'],
    maxApprovalLimit: 0,
    rateLimitPerHour: 150,
  },
  'marketing-ai': {
    allowedModules: ['campaigns', 'crm', 'communications'],
    allowedTools: ['campaign_generator', 'lead_search', 'email'],
    allowedActions: ['read', 'create'],
    maxApprovalLimit: 0,
    rateLimitPerHour: 100,
  },
  'customer-success-ai': {
    allowedModules: ['crm', 'scheduling', 'communications'],
    allowedTools: ['customer_lookup', 'calendar', 'email'],
    allowedActions: ['read', 'create'],
    maxApprovalLimit: 0,
    rateLimitPerHour: 100,
  },
  'finance-ai': {
    allowedModules: ['billing', 'proposals'],
    allowedTools: ['invoice_generator', 'report_generator', 'customer_lookup'],
    allowedActions: ['read', 'create'],
    maxApprovalLimit: 1000000,
    rateLimitPerHour: 80,
  },
  'revenue-intelligence-ai': {
    allowedModules: ['analytics', 'crm', 'billing'],
    allowedTools: ['report_generator', 'crm_search'],
    allowedActions: ['read'],
    maxApprovalLimit: 0,
    rateLimitPerHour: 60,
  },
  'geo-scanner-ai': {
    allowedModules: ['scanner', 'crm'],
    allowedTools: ['geo_lead_finder', 'lead_search'],
    allowedActions: ['read', 'create'],
    maxApprovalLimit: 0,
    rateLimitPerHour: 40,
  },
  'meeting-scheduler-ai': {
    allowedModules: ['scheduling', 'crm', 'communications'],
    allowedTools: ['calendar', 'email', 'customer_lookup'],
    allowedActions: ['read', 'create'],
    maxApprovalLimit: 0,
    rateLimitPerHour: 60,
  },
  'churn-prediction-ai': {
    allowedModules: ['crm', 'analytics'],
    allowedTools: ['customer_lookup', 'report_generator'],
    allowedActions: ['read'],
    maxApprovalLimit: 0,
    rateLimitPerHour: 60,
  },
  'ceo-ai': {
    allowedModules: ['analytics'],
    allowedTools: ['report_generator', 'knowledge_base'],
    allowedActions: ['read'],
    maxApprovalLimit: 0,
    rateLimitPerHour: 30,
  },
  'document-ai': {
    allowedModules: ['documents', 'crm'],
    allowedTools: ['document_search', 'knowledge_base'],
    allowedActions: ['read'],
    maxApprovalLimit: 0,
    rateLimitPerHour: 40,
  },
  'compliance-ai': {
    allowedModules: ['documents', 'knowledge'],
    allowedTools: ['knowledge_base', 'document_search'],
    allowedActions: ['read'],
    maxApprovalLimit: 0,
    rateLimitPerHour: 30,
  },
  'renewal-ai': {
    allowedModules: ['crm', 'communications'],
    allowedTools: ['customer_lookup', 'email'],
    allowedActions: ['read', 'create'],
    maxApprovalLimit: 0,
    rateLimitPerHour: 40,
  },
}

export function getAgentPermissions(agentId) {
  return AGENT_PERMISSIONS[agentId] || {
    allowedModules: [],
    allowedTools: [],
    allowedActions: ['read'],
    maxApprovalLimit: 0,
    rateLimitPerHour: 20,
  }
}

export function assertAgentToolAccess(agentId, toolId) {
  const agent = getAgentById(agentId)
  if (!agent) throw new Error(`Unknown agent: ${agentId}`)

  const perms = getAgentPermissions(agentId)
  if (!perms.allowedTools.includes(toolId)) {
    throw new Error(`Agent ${agentId} is not permitted to use tool: ${toolId}`)
  }

  const tool = getTool(toolId)
  if (tool && !perms.allowedModules.includes(tool.module)) {
    throw new Error(`Agent ${agentId} is not permitted to access module: ${tool.module}`)
  }
}

export async function checkRateLimit(db, orgId, agentId) {
  const perms = getAgentPermissions(agentId)
  const since = new Date(Date.now() - 3600_000).toISOString()
  const count = await db.collection('agent_tasks').countDocuments({
    orgId,
    agentId,
    createdAt: { $gte: since },
  })
  if (count >= perms.rateLimitPerHour) {
    throw new Error(`Rate limit exceeded for agent ${agentId}`)
  }
  return { remaining: perms.rateLimitPerHour - count }
}

export function enrichAgentWithSecurity(agent) {
  return {
    ...agent,
    permissions: getAgentPermissions(agent.id),
  }
}
