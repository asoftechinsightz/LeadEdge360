import { getAgentById } from '@/lib/agents/registry'

const DEFAULT_APPROVAL_RULES = [
  {
    id: 'proposal-high-value',
    name: 'High-value proposal approval',
    enabled: true,
    conditions: { dealValueGte: 500000, currency: 'INR' },
    approverRole: 'Sales Manager',
    priority: 10,
  },
  {
    id: 'discount-high',
    name: 'High discount approval',
    enabled: true,
    conditions: { discountPctGte: 20 },
    approverRole: 'Director',
    priority: 20,
  },
  {
    id: 'customer-deletion',
    name: 'Customer deletion approval',
    enabled: true,
    conditions: { action: 'customer.delete' },
    approverRole: 'Administrator',
    priority: 30,
  },
  {
    id: 'low-confidence',
    name: 'Low AI confidence approval',
    enabled: true,
    conditions: { aiConfidenceLt: 0.6 },
    approverRole: 'Manager',
    priority: 5,
  },
]

function matchesCondition(conditions, context) {
  if (conditions.dealValueGte != null && (context.dealValue || 0) < conditions.dealValueGte) return false
  if (conditions.discountPctGte != null && (context.discountPct || 0) < conditions.discountPctGte) return false
  if (conditions.aiConfidenceLt != null && (context.confidence ?? 1) >= conditions.aiConfidenceLt) return false
  if (conditions.action && context.action !== conditions.action) return false
  if (conditions.department && context.department !== conditions.department) return false
  if (conditions.riskScoreGte != null && (context.riskScore || 0) < conditions.riskScoreGte) return false
  return true
}

export async function getApprovalRules(db, orgId) {
  const custom = await db.collection('org_approval_rules')
    .find({ orgId, enabled: { $ne: false } }, { projection: { _id: 0 } })
    .sort({ priority: 1 })
    .toArray()

  if (custom.length) return custom
  return DEFAULT_APPROVAL_RULES
}

export async function saveApprovalRule(db, orgId, rule) {
  const doc = {
    ...rule,
    orgId,
    updatedAt: new Date().toISOString(),
    createdAt: rule.createdAt || new Date().toISOString(),
  }
  await db.collection('org_approval_rules').updateOne(
    { orgId, id: rule.id },
    { $set: doc },
    { upsert: true },
  )
  return doc
}

/**
 * Evaluate whether a task requires approval based on configurable rules.
 */
export async function evaluateApproval(db, orgId, task, context = {}) {
  const agent = getAgentById(task.agentId)
  const rules = await getApprovalRules(db, orgId)

  const matched = []
  for (const rule of rules) {
    if (rule.enabled === false) continue
    if (matchesCondition(rule.conditions || {}, context)) {
      matched.push(rule)
    }
  }

  const requiresByRule = matched.length > 0
  const requiresByAgent = agent?.requiresApproval === true

  return {
    requiresApproval: requiresByRule || requiresByAgent,
    matchedRules: matched,
    approverRole: matched[0]?.approverRole || (requiresByAgent ? 'Manager' : null),
    reason: matched[0]?.name || (requiresByAgent ? 'Agent policy requires approval' : null),
  }
}
