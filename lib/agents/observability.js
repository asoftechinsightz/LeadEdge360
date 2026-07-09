import { TASK_STATUS } from '@/lib/agents/registry'

const SLA_MS = 5 * 60 * 1000

export async function getAgentObservabilityMetrics(db, orgId, { sinceHours = 24 } = {}) {
  const since = new Date(Date.now() - sinceHours * 3600_000).toISOString()
  const filter = { orgId, createdAt: { $gte: since } }

  const [
    queued,
    running,
    awaiting,
    failed,
    retryQueue,
    tasks,
    toolCalls,
    tokenUsage,
  ] = await Promise.all([
    db.collection('agent_tasks').countDocuments({ orgId, status: TASK_STATUS.QUEUED }),
    db.collection('agent_tasks').countDocuments({ orgId, status: TASK_STATUS.RUNNING }),
    db.collection('agent_tasks').countDocuments({ orgId, status: TASK_STATUS.AWAITING_APPROVAL }),
    db.collection('agent_tasks').countDocuments({ ...filter, status: TASK_STATUS.FAILED }),
    db.collection('agent_tasks').countDocuments({ orgId, status: TASK_STATUS.FAILED, retryCount: { $gt: 0 } }),
    db.collection('agent_tasks').find(filter, { projection: { _id: 0, startedAt: 1, completedAt: 1, status: 1, confidence: 1, retryCount: 1, agentId: 1 } }).toArray(),
    db.collection('agent_tool_calls').countDocuments({ orgId, createdAt: { $gte: since } }),
    db.collection('agent_token_usage').aggregate([
      { $match: { orgId, createdAt: { $gte: since } } },
      { $group: { _id: null, tokens: { $sum: '$tokens' }, cost: { $sum: '$cost' } } },
    ]).toArray(),
  ])

  const completed = tasks.filter((t) => t.status === TASK_STATUS.COMPLETED)
  const durations = completed
    .filter((t) => t.startedAt && t.completedAt)
    .map((t) => new Date(t.completedAt) - new Date(t.startedAt))

  const avgProcessingMs = durations.length
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : 0

  const successRate = tasks.length
    ? Math.round((completed.length / tasks.length) * 100)
    : 100

  const failureRate = tasks.length
    ? Math.round((failed / tasks.length) * 100)
    : 0

  const slaCompliant = completed.filter((t) => {
    if (!t.startedAt || !t.completedAt) return false
    return (new Date(t.completedAt) - new Date(t.startedAt)) <= SLA_MS
  }).length

  const slaCompliance = completed.length
    ? Math.round((slaCompliant / completed.length) * 100)
    : 100

  const confidenceBuckets = { high: 0, medium: 0, low: 0, unknown: 0 }
  for (const t of completed) {
    const c = t.confidence
    if (c == null) confidenceBuckets.unknown++
    else if (c >= 0.8) confidenceBuckets.high++
    else if (c >= 0.6) confidenceBuckets.medium++
    else confidenceBuckets.low++
  }

  const byAgent = {}
  for (const t of tasks) {
    if (!byAgent[t.agentId]) byAgent[t.agentId] = { total: 0, completed: 0, failed: 0 }
    byAgent[t.agentId].total++
    if (t.status === TASK_STATUS.COMPLETED) byAgent[t.agentId].completed++
    if (t.status === TASK_STATUS.FAILED) byAgent[t.agentId].failed++
  }

  const awaitingTasks = await db.collection('agent_tasks')
    .find({ orgId, status: TASK_STATUS.AWAITING_APPROVAL }, { projection: { _id: 0, createdAt: 1 } })
    .toArray()

  const approvalWaitingMs = awaitingTasks.length
    ? Math.round(
      awaitingTasks.reduce((sum, t) => sum + (Date.now() - new Date(t.createdAt).getTime()), 0) / awaitingTasks.length,
    )
    : 0

  const eventRate = await db.collection('platform_events').countDocuments({
    orgId,
    type: { $regex: /^agent\./ },
    createdAt: { $gte: since },
  })

  return {
    queueDepth: queued,
    running,
    awaitingApproval: awaiting,
    failedTasks: failed,
    retryQueue,
    taskThroughput: tasks.length,
    avgProcessingMs,
    failureRate,
    successRate,
    retryCount: tasks.reduce((s, t) => s + (t.retryCount || 0), 0),
    approvalWaitingMs,
    toolCalls,
    aiCost: tokenUsage[0]?.cost || 0,
    tokenUsage: tokenUsage[0]?.tokens || 0,
    slaCompliance,
    confidenceDistribution: confidenceBuckets,
    agentHealth: byAgent,
    eventProcessingRate: eventRate,
    humanEscalations: await db.collection('agent_delegations').countDocuments({ orgId, createdAt: { $gte: since } }),
  }
}

export async function recordTokenUsage(db, { orgId, agentId, taskId, tokens, cost = 0, model = 'gpt-4o-mini' }) {
  await db.collection('agent_token_usage').insertOne({
    orgId,
    agentId,
    taskId,
    tokens,
    cost,
    model,
    createdAt: new Date().toISOString(),
  })
}
