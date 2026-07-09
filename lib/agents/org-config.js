import { getAgentById } from '@/lib/agents/registry'

const DEFAULT_SETTINGS = {
  enabled: true,
  industryProfile: null,
  model: 'gpt-4o-mini',
  memoryRetentionDays: 90,
  aiBranding: { assistantName: 'LeadEdge AI', tone: 'professional' },
  businessHours: { start: '09:00', end: '18:00', timezone: 'Asia/Kolkata', enabled: false },
  confidenceThreshold: 0.6,
  dailyExecutionLimit: 500,
  monthlyTokenBudget: 1_000_000,
  monthlyCostBudget: 5000,
  escalationContacts: [],
  notificationPreferences: { onTaskComplete: true, onApprovalRequired: true, onFailure: true },
  agents: {},
}

export async function getOrgAiSettings(db, orgId) {
  const doc = await db.collection('org_ai_settings').findOne({ orgId }, { projection: { _id: 0 } })
  if (!doc) return { orgId, ...DEFAULT_SETTINGS, agents: {} }
  return {
    ...DEFAULT_SETTINGS,
    ...doc,
    agents: doc.agents || {},
  }
}

export async function saveOrgAiSettings(db, orgId, patch) {
  const now = new Date().toISOString()
  const doc = {
    orgId,
    ...patch,
    updatedAt: now,
  }
  await db.collection('org_ai_settings').updateOne(
    { orgId },
    { $set: doc, $setOnInsert: { createdAt: now } },
    { upsert: true },
  )
  return getOrgAiSettings(db, orgId)
}

export function getEffectiveAgentConfig(orgSettings, agent) {
  const override = orgSettings.agents?.[agent.id] || {}
  return {
    enabled: override.enabled !== false && orgSettings.enabled !== false,
    autoRun: override.autoRun ?? agent.autoRun,
    requiresApproval: override.requiresApproval ?? agent.requiresApproval,
    confidenceThreshold: override.confidenceThreshold ?? orgSettings.confidenceThreshold ?? 0.6,
    dailyLimit: override.dailyLimit ?? orgSettings.dailyExecutionLimit ?? 500,
  }
}

export function isAgentEnabledForOrg(orgSettings, agentId) {
  const agent = getAgentById(agentId)
  if (!agent) return false
  if (orgSettings.enabled === false) return false
  const cfg = getEffectiveAgentConfig(orgSettings, agent)
  return cfg.enabled !== false
}

export function isWithinBusinessHours(orgSettings) {
  const bh = orgSettings.businessHours
  if (!bh?.enabled) return true

  const now = new Date()
  const tz = bh.timezone || 'Asia/Kolkata'
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const parts = formatter.formatToParts(now)
  const hour = parts.find((p) => p.type === 'hour')?.value || '00'
  const minute = parts.find((p) => p.type === 'minute')?.value || '00'
  const current = `${hour}:${minute}`

  return current >= (bh.start || '09:00') && current <= (bh.end || '18:00')
}

export async function checkDailyAgentLimit(db, orgId, agentId, orgSettings) {
  const agent = getAgentById(agentId)
  if (!agent) return { allowed: false, reason: 'unknown_agent' }

  const cfg = getEffectiveAgentConfig(orgSettings, agent)
  const since = new Date()
  since.setHours(0, 0, 0, 0)

  const count = await db.collection('agent_tasks').countDocuments({
    orgId,
    agentId,
    createdAt: { $gte: since.toISOString() },
  })

  if (count >= cfg.dailyLimit) {
    return { allowed: false, reason: 'daily_limit_exceeded', count, limit: cfg.dailyLimit }
  }
  return { allowed: true, remaining: cfg.dailyLimit - count }
}

export async function getOrgAiConfigForRuntime(db, orgId) {
  const settings = await getOrgAiSettings(db, orgId)
  return settings
}
