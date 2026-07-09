import { TASK_STATUS } from '@/lib/agents/registry'
import { getUsageSummary, getApprovalRate } from '@/lib/agents/cost-management'

export async function getWorkforceAnalytics(db, orgId, { sinceDays = 30 } = {}) {
  const since = new Date(Date.now() - sinceDays * 24 * 3600_000).toISOString()
  const sinceHours = sinceDays * 24

  const [
    aiTasks,
    humanTasks,
    completedAi,
    leadsQualified,
    proposalsCreated,
    revenueInfluenced,
    usage,
    approval,
  ] = await Promise.all([
    db.collection('agent_tasks').countDocuments({ orgId, createdAt: { $gte: since } }),
    db.collection('lead_tasks').countDocuments({ orgId, createdAt: { $gte: since } }),
    db.collection('agent_tasks').find(
      { orgId, status: TASK_STATUS.COMPLETED, completedAt: { $gte: since } },
      { projection: { _id: 0, confidence: 1, startedAt: 1, completedAt: 1, agentId: 1 } },
    ).toArray(),
    db.collection('platform_events').countDocuments({ orgId, type: 'lead.qualified', createdAt: { $gte: since } }),
    db.collection('platform_events').countDocuments({ orgId, type: 'proposal.created', createdAt: { $gte: since } }),
    db.collection('platform_events').aggregate([
      { $match: { orgId, type: { $in: ['proposal.won', 'payment.received'] }, createdAt: { $gte: since } } },
      { $group: { _id: null, amount: { $sum: '$payload.totalAmount' } } },
    ]).toArray(),
    getUsageSummary(db, orgId, { sinceHours }),
    getApprovalRate(db, orgId, { sinceHours }),
  ])

  const durations = completedAi
    .filter((t) => t.startedAt && t.completedAt)
    .map((t) => new Date(t.completedAt) - new Date(t.startedAt))

  const avgProcessingMs = durations.length
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : 0

  const confidences = completedAi.filter((t) => t.confidence != null).map((t) => t.confidence)
  const avgConfidence = confidences.length
    ? Math.round((confidences.reduce((a, b) => a + b, 0) / confidences.length) * 100) / 100
    : 0

  const humanVsAiRatio = aiTasks + humanTasks > 0
    ? { ai: Math.round((aiTasks / (aiTasks + humanTasks)) * 100), human: Math.round((humanTasks / (aiTasks + humanTasks)) * 100) }
    : { ai: 0, human: 0 }

  const byAgent = {}
  for (const t of completedAi) {
    if (!byAgent[t.agentId]) byAgent[t.agentId] = { completed: 0, totalConfidence: 0, count: 0 }
    byAgent[t.agentId].completed++
    if (t.confidence != null) {
      byAgent[t.agentId].totalConfidence += t.confidence
      byAgent[t.agentId].count++
    }
  }

  return {
    period: { since, days: sinceDays },
    tasksCompleted: completedAi.length,
    humanTasks,
    aiTasks,
    humanVsAiRatio,
    avgConfidence,
    avgProcessingMs,
    leadsQualified,
    proposalsGenerated: proposalsCreated,
    revenueInfluenced: revenueInfluenced[0]?.amount || 0,
    businessValueGenerated: (revenueInfluenced[0]?.amount || 0) + (proposalsCreated * 50000),
    usage: usage.totals,
    approval,
    agentPerformance: Object.entries(byAgent).map(([agentId, stats]) => ({
      agentId,
      completed: stats.completed,
      avgConfidence: stats.count ? Math.round((stats.totalConfidence / stats.count) * 100) / 100 : null,
    })),
  }
}
