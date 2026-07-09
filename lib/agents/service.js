import { randomUUID } from 'crypto'
import { getAgentById, TASK_STATUS } from '@/lib/agents/registry'
import { MARKETPLACE_AGENT_DEFS } from '@/lib/agents/marketplace/manifest'
import { executeAgentTask } from '@/lib/agents/executor'

function resolveAgent(agentId) {
  return getAgentById(agentId) || MARKETPLACE_AGENT_DEFS[agentId] || null
}

export async function createAgentTask(db, {
  orgId,
  agentId,
  type,
  input = {},
  eventId = null,
  correlationId = null,
  entity = null,
  entityId = null,
  priority = 'normal',
}) {
  const agent = resolveAgent(agentId)
  if (!agent) throw new Error(`Unknown agent: ${agentId}`)

  const task = {
    id: randomUUID(),
    orgId,
    agentId,
    agentName: agent.name,
    type: type || eventId ? 'event_triggered' : 'manual',
    status: TASK_STATUS.QUEUED,
    input,
    output: null,
    eventId,
    correlationId,
    entity,
    entityId,
    priority,
    confidence: null,
    explanation: null,
    requiresApproval: agent.requiresApproval,
    approvedBy: null,
    approvedAt: null,
    error: null,
    retryCount: 0,
    createdAt: new Date().toISOString(),
    startedAt: null,
    completedAt: null,
  }

  await db.collection('agent_tasks').insertOne(task)
  return task
}

export async function getAgentTask(db, orgId, taskId) {
  return db.collection('agent_tasks').findOne(
    { orgId, id: taskId },
    { projection: { _id: 0 } },
  )
}

export async function listAgentTasks(db, orgId, {
  agentId = null,
  status = null,
  limit = 50,
  cursor = null,
} = {}) {
  const filter = { orgId }
  if (agentId) filter.agentId = agentId
  if (status) filter.status = status

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

  const cap = Math.min(Math.max(Number(limit) || 50, 1), 100)
  const rows = await db.collection('agent_tasks')
    .find(filter, { projection: { _id: 0 } })
    .sort({ createdAt: -1, id: -1 })
    .limit(cap + 1)
    .toArray()

  const hasMore = rows.length > cap
  const items = hasMore ? rows.slice(0, cap) : rows
  const last = items[items.length - 1]
  const nextCursor = hasMore && last
    ? Buffer.from(JSON.stringify({ createdAt: last.createdAt, id: last.id })).toString('base64url')
    : null

  return { items, nextCursor, hasMore }
}

export async function approveAgentTask(db, orgId, taskId, userId) {
  const task = await getAgentTask(db, orgId, taskId)
  if (!task) throw new Error('NOT_FOUND')
  if (task.status !== TASK_STATUS.AWAITING_APPROVAL) {
    throw new Error('NOT_AWAITING_APPROVAL')
  }

  await db.collection('agent_tasks').updateOne(
    { orgId, id: taskId },
    {
      $set: {
        status: TASK_STATUS.QUEUED,
        approvedBy: userId,
        approvedAt: new Date().toISOString(),
      },
    },
  )

  const updated = await getAgentTask(db, orgId, taskId)
  return executeAgentTask(db, updated)
}

export async function runAgentTask(db, orgId, taskId) {
  const task = await getAgentTask(db, orgId, taskId)
  if (!task) throw new Error('NOT_FOUND')
  if ([TASK_STATUS.COMPLETED, TASK_STATUS.RUNNING].includes(task.status)) {
    return task
  }
  return executeAgentTask(db, task)
}

export async function processAgentQueue(db, orgId, { limit = 10 } = {}) {
  const tasks = await db.collection('agent_tasks')
    .find({ orgId, status: TASK_STATUS.QUEUED }, { projection: { _id: 0 } })
    .sort({ createdAt: 1 })
    .limit(limit)
    .toArray()

  const results = []
  for (const task of tasks) {
    try {
      const result = await executeAgentTask(db, task)
      results.push({ taskId: task.id, status: result.status, ok: true })
    } catch (err) {
      results.push({ taskId: task.id, status: 'failed', ok: false, error: err.message })
    }
  }
  return results
}

export async function getAgentRuntimeStatus(db, orgId) {
  const since = new Date(Date.now() - 86_400_000).toISOString()
  const [queued, running, awaiting, completed, failed] = await Promise.all([
    db.collection('agent_tasks').countDocuments({ orgId, status: TASK_STATUS.QUEUED }),
    db.collection('agent_tasks').countDocuments({ orgId, status: TASK_STATUS.RUNNING }),
    db.collection('agent_tasks').countDocuments({ orgId, status: TASK_STATUS.AWAITING_APPROVAL }),
    db.collection('agent_tasks').countDocuments({ orgId, status: TASK_STATUS.COMPLETED, completedAt: { $gte: since } }),
    db.collection('agent_tasks').countDocuments({ orgId, status: TASK_STATUS.FAILED, completedAt: { $gte: since } }),
  ])

  const byAgent = await db.collection('agent_tasks').aggregate([
    { $match: { orgId, createdAt: { $gte: since } } },
    { $group: { _id: '$agentId', count: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } } } },
  ]).toArray()

  return { queued, running, awaiting, completedToday: completed, failedToday: failed, byAgent }
}
