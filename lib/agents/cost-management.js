const TOKEN_COST_PER_1K = 0.15 // INR estimate for gpt-4o-mini

export function estimateCost(tokens, model = 'gpt-4o-mini') {
  const multiplier = model.includes('gpt-4') && !model.includes('mini') ? 5 : 1
  return Math.round((tokens / 1000) * TOKEN_COST_PER_1K * multiplier * 100) / 100
}

export async function recordUsage(db, {
  orgId,
  agentId,
  taskId,
  tokens = 0,
  cost = null,
  model = 'gpt-4o-mini',
  department = null,
  userId = null,
  durationMs = 0,
  success = true,
}) {
  const estimatedCost = cost ?? estimateCost(tokens, model)
  const doc = {
    orgId,
    agentId,
    taskId,
    tokens,
    cost: estimatedCost,
    model,
    department,
    userId,
    durationMs,
    success,
    createdAt: new Date().toISOString(),
  }
  await db.collection('agent_token_usage').insertOne(doc)
  return doc
}

export async function getUsageSummary(db, orgId, { sinceHours = 24, groupBy = 'agent' } = {}) {
  const since = new Date(Date.now() - sinceHours * 3600_000).toISOString()
  const match = { orgId, createdAt: { $gte: since } }

  const groupField = groupBy === 'department' ? '$department'
    : groupBy === 'user' ? '$userId'
      : '$agentId'

  const grouped = await db.collection('agent_token_usage').aggregate([
    { $match: match },
    {
      $group: {
        _id: groupField,
        tokens: { $sum: '$tokens' },
        cost: { $sum: '$cost' },
        tasks: { $sum: 1 },
        failures: { $sum: { $cond: [{ $eq: ['$success', false] }, 1, 0] } },
        avgDurationMs: { $avg: '$durationMs' },
      },
    },
    { $sort: { cost: -1 } },
  ]).toArray()

  const totals = await db.collection('agent_token_usage').aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        tokens: { $sum: '$tokens' },
        cost: { $sum: '$cost' },
        tasks: { $sum: 1 },
        failures: { $sum: { $cond: [{ $eq: ['$success', false] }, 1, 0] } },
      },
    },
  ]).toArray()

  const t = totals[0] || { tokens: 0, cost: 0, tasks: 0, failures: 0 }
  const successRate = t.tasks ? Math.round(((t.tasks - t.failures) / t.tasks) * 100) : 100

  return {
    since,
    totals: { ...t, successRate },
    byGroup: grouped.map((g) => ({
      key: g._id || 'unknown',
      tokens: g.tokens,
      cost: g.cost,
      tasks: g.tasks,
      failures: g.failures,
      avgDurationMs: Math.round(g.avgDurationMs || 0),
      successRate: g.tasks ? Math.round(((g.tasks - g.failures) / g.tasks) * 100) : 100,
    })),
  }
}

export async function checkUsageBudget(db, orgId, orgSettings) {
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const usage = await db.collection('agent_token_usage').aggregate([
    { $match: { orgId, createdAt: { $gte: monthStart.toISOString() } } },
    { $group: { _id: null, tokens: { $sum: '$tokens' }, cost: { $sum: '$cost' } } },
  ]).toArray()

  const current = usage[0] || { tokens: 0, cost: 0 }
  const tokenBudget = orgSettings.monthlyTokenBudget || 1_000_000
  const costBudget = orgSettings.monthlyCostBudget || 5000

  return {
    withinBudget: current.tokens < tokenBudget && current.cost < costBudget,
    current,
    limits: { tokenBudget, costBudget },
    utilization: {
      tokens: Math.round((current.tokens / tokenBudget) * 100),
      cost: Math.round((current.cost / costBudget) * 100),
    },
  }
}

export async function getApprovalRate(db, orgId, { sinceHours = 168 } = {}) {
  const since = new Date(Date.now() - sinceHours * 3600_000).toISOString()
  const [total, approved, awaiting] = await Promise.all([
    db.collection('agent_tasks').countDocuments({ orgId, createdAt: { $gte: since }, requiresApproval: true }),
    db.collection('agent_tasks').countDocuments({ orgId, createdAt: { $gte: since }, approvedBy: { $ne: null } }),
    db.collection('agent_tasks').countDocuments({ orgId, status: 'awaiting_approval' }),
  ])
  return {
    totalRequiringApproval: total,
    approved,
    awaiting,
    approvalRate: total ? Math.round((approved / total) * 100) : 0,
  }
}
