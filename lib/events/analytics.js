import { getEventMetrics, getPlatformHealth } from '@/lib/events/monitoring'
import { listAgents } from '@/lib/agents/registry'
import { getAgentRuntimeStatus } from '@/lib/agents/service'

const AI_AGENTS = listAgents()

export async function computeEventAnalytics(db, orgId, { days = 30 } = {}) {
  const since = new Date(Date.now() - days * 86_400_000).toISOString()

  const [byType, agentEvents, humanAudit, aiAudit, dailyTrend] = await Promise.all([
    db.collection('platform_events').aggregate([
      { $match: { orgId, createdAt: { $gte: since } } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).toArray(),
    db.collection('platform_events').countDocuments({
      orgId,
      createdAt: { $gte: since },
      $or: [{ type: 'agent.action' }, { type: 'agent.task.completed' }, { 'payload.agentId': { $exists: true } }],
    }),
    db.collection('audit_logs').countDocuments({ orgId, actorType: 'user', createdAt: { $gte: since } }),
    db.collection('audit_logs').countDocuments({ orgId, actorType: 'agent', createdAt: { $gte: since } }),
    db.collection('platform_events').aggregate([
      { $match: { orgId, createdAt: { $gte: since } } },
      { $group: { _id: { $substr: ['$createdAt', 0, 10] }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]).toArray(),
  ])

  const typeMap = Object.fromEntries(byType.map((r) => [r._id, r.count]))
  const totalActions = humanAudit + aiAudit
  const automationPct = totalActions > 0 ? Math.round((aiAudit / totalActions) * 100) : 0

  return {
    period: { days, since },
    leadsCreated: typeMap['lead.created'] || 0,
    opportunitiesWon: typeMap['opportunity.stage_changed'] || 0,
    proposalsGenerated: (typeMap['proposal.created'] || 0) + (typeMap['proposal.won'] || 0),
    invoicesPaid: typeMap['invoice.paid'] || 0,
    campaignsLaunched: typeMap['campaign.executed'] || 0,
    paymentsReceived: typeMap['payment.received'] || 0,
    aiTasksCompleted: typeMap['agent.task.completed'] || 0,
    aiActions: agentEvents,
    humanTasksCompleted: humanAudit,
    humanVsAiRatio: {
      human: humanAudit,
      ai: aiAudit,
      automationPercentage: automationPct,
    },
    byType: byType.map((r) => ({ type: r._id, count: r.count })),
    dailyTrend: dailyTrend.map((r) => ({ date: r._id, count: r.count })),
  }
}

export async function getAIOpsDashboard(db, orgId) {
  const since = new Date(Date.now() - 86_400_000).toISOString()

  const [
    agentActivities,
    failedDlq,
    pendingApprovals,
    avgConfidence,
    avgResponseTime,
    health,
    metrics,
    runtime,
  ] = await Promise.all([
    db.collection('org_activities').aggregate([
      { $match: { orgId, actorType: 'agent', createdAt: { $gte: since } } },
      { $group: { _id: '$agentId', count: { $sum: 1 }, avgConfidence: { $avg: '$confidence' } } },
    ]).toArray(),
    db.collection('dead_letter_events').countDocuments({ orgId, status: 'failed' }),
    db.collection('agent_tasks').countDocuments({ orgId, status: 'awaiting_approval' }),
    db.collection('agent_tasks').aggregate([
      { $match: { orgId, confidence: { $ne: null } } },
      { $group: { _id: null, avg: { $avg: '$confidence' } } },
    ]).toArray(),
    db.collection('agent_tasks').aggregate([
      { $match: { orgId, status: 'completed', startedAt: { $exists: true }, completedAt: { $exists: true } } },
      { $project: { durationMs: { $subtract: [{ $toDate: '$completedAt' }, { $toDate: '$startedAt' }] } } },
      { $group: { _id: null, avg: { $avg: '$durationMs' } } },
    ]).toArray(),
    getPlatformHealth(db, orgId),
    getEventMetrics(db, orgId),
    getAgentRuntimeStatus(db, orgId),
  ])

  const activityByAgent = Object.fromEntries(
    agentActivities.map((r) => [r._id || 'unknown', { tasks: r.count, avgConfidence: r.avgConfidence }]),
  )

  const agents = AI_AGENTS.map((agent) => ({
    ...agent,
    status: activityByAgent[agent.id] ? 'active' : 'idle',
    tasksToday: activityByAgent[agent.id]?.tasks || 0,
    avgConfidence: activityByAgent[agent.id]?.avgConfidence
      ? Math.round(activityByAgent[agent.id].avgConfidence * 100)
      : null,
  }))

  const runningTasks = runtime.running
  const waitingTasks = runtime.queued
  const failedTasks = runtime.failedToday + failedDlq

  return {
    agents,
    activeAgents: agents.filter((a) => a.status === 'active').length,
    runningTasks,
    waitingTasks,
    failedTasks,
    humanEscalations: await db.collection('audit_logs').countDocuments({
      orgId,
      action: { $regex: /escalat/i },
      createdAt: { $gte: since },
    }),
    pendingApprovals,
    aiUtilization: agents.filter((a) => a.tasksToday > 0).length,
    aiCost: null,
    averageConfidence: Math.round((avgConfidence[0]?.avg || 0) * 100),
    averageResponseTimeMs: Math.round(avgResponseTime[0]?.avg || metrics.averageLatencyMs || 0),
    eventQueueHealth: metrics,
    runtime,
    health,
  }
}

export async function listAgentTimeline(db, orgId, {
  agentId = null,
  type = null,
  status = null,
  from = null,
  to = null,
  limit = 50,
  cursor = null,
} = {}) {
  const filter = { orgId, actorType: 'agent' }
  if (agentId) filter.agentId = agentId
  if (type) filter.type = type
  if (status) filter.status = status
  if (from || to) {
    filter.createdAt = {}
    if (from) filter.createdAt.$gte = from
    if (to) filter.createdAt.$lte = to
  }
  if (cursor) {
    try {
      const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'))
      if (parsed.createdAt && parsed.id) {
        filter.$or = [
          { createdAt: { $lt: parsed.createdAt } },
          { createdAt: parsed.createdAt, id: { $lt: parsed.id } },
        ]
      }
    } catch { /* ignore */ }
  }

  const cap = Math.min(limit, 50)
  const rows = await db.collection('org_activities')
    .find(filter, { projection: { _id: 0, searchText: 0 } })
    .sort({ createdAt: -1, id: -1 })
    .limit(cap + 1)
    .toArray()

  const hasMore = rows.length > cap
  const items = hasMore ? rows.slice(0, cap) : rows
  const last = items[items.length - 1]
  const nextCursor = hasMore && last
    ? Buffer.from(JSON.stringify({ createdAt: last.createdAt, id: last.id })).toString('base64url')
    : null

  return { items, nextCursor, hasMore, agents: AI_AGENTS }
}

export { AI_AGENTS }
