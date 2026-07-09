import { emitPlatformEvent } from '@/lib/events/bus'
import { PLATFORM_EVENTS } from '@/lib/events/types'
import { emitAgentLifecycleEvent } from '@/lib/events/emit-helpers'
import { writeAgentAuditLog } from '@/lib/audit/service'
import { getAgentById, TASK_STATUS } from '@/lib/agents/registry'
import { MARKETPLACE_AGENT_DEFS } from '@/lib/agents/marketplace/manifest'
import { runAgentHandler } from '@/lib/agents/handlers'
import { evaluateApproval } from '@/lib/agents/approval'
import { recordHistoricalDecision, setWorkingMemory } from '@/lib/agents/memory'
import { checkRateLimit, getAgentPermissions } from '@/lib/agents/security'
import { recordUsage } from '@/lib/agents/cost-management'
import { getOrgAiSettings } from '@/lib/agents/org-config'

export async function executeAgentTask(db, task) {
  const agent = getAgentById(task.agentId) || MARKETPLACE_AGENT_DEFS[task.agentId]
  if (!agent) throw new Error(`Unknown agent: ${task.agentId}`)

  const orgSettings = await getOrgAiSettings(db, task.orgId)
  if (!orgSettings.enabled) throw new Error('AI workforce disabled for organization')

  await checkRateLimit(db, task.orgId, task.agentId)

  let event = null
  if (task.eventId) {
    event = await db.collection('platform_events').findOne(
      { orgId: task.orgId, id: task.eventId },
      { projection: { _id: 0 } },
    )
  }

  const approvalContext = {
    dealValue: event?.payload?.totalAmount || event?.payload?.amount || task.input?.dealValue || 0,
    discountPct: task.input?.discountPct || 0,
    confidence: task.confidence,
    action: task.input?.action,
    department: agent.role,
  }

  const approval = await evaluateApproval(db, task.orgId, task, approvalContext)
  const needsApproval = (approval.requiresApproval || task.requiresApproval) && !task.approvedBy

  if (needsApproval) {
    await db.collection('agent_tasks').updateOne(
      { orgId: task.orgId, id: task.id },
      {
        $set: {
          status: TASK_STATUS.AWAITING_APPROVAL,
          approvalRule: approval.matchedRules?.[0]?.id || null,
          approverRole: approval.approverRole,
        },
      },
    )

    await emitAgentLifecycleEvent(db, {
      orgId: task.orgId,
      type: PLATFORM_EVENTS.AGENT_WAITING,
      agentId: task.agentId,
      taskId: task.id,
      correlationId: task.correlationId,
      causationId: task.eventId,
      payload: {
        reason: approval.reason,
        approverRole: approval.approverRole,
      },
    })

    return { ...task, status: TASK_STATUS.AWAITING_APPROVAL }
  }

  const startedAt = new Date().toISOString()
  await db.collection('agent_tasks').updateOne(
    { orgId: task.orgId, id: task.id },
    { $set: { status: TASK_STATUS.RUNNING, startedAt } },
  )

  await emitAgentLifecycleEvent(db, {
    orgId: task.orgId,
    type: PLATFORM_EVENTS.AGENT_STARTED,
    agentId: task.agentId,
    taskId: task.id,
    correlationId: task.correlationId,
    causationId: task.eventId,
  })

  try {
    const result = await runAgentHandler(db, task, event)

    const completedAt = new Date().toISOString()
    const perms = getAgentPermissions(task.agentId)

    await db.collection('agent_tasks').updateOne(
      { orgId: task.orgId, id: task.id },
      {
        $set: {
          status: TASK_STATUS.COMPLETED,
          output: result.output || {},
          confidence: result.confidence ?? null,
          explanation: result.explanation || result.summary || '',
          completedAt,
          tokensUsed: result.tokensUsed || 0,
        },
      },
    )

    await setWorkingMemory(db, task.orgId, task.agentId, task.id, {
      summary: result.summary,
      output: result.output,
      completedAt,
    })

    await recordHistoricalDecision(db, {
      orgId: task.orgId,
      agentId: task.agentId,
      taskId: task.id,
      decision: result.summary,
      confidence: result.confidence,
      explanation: result.explanation,
    })

    if (result.tokensUsed) {
      await recordUsage(db, {
        orgId: task.orgId,
        agentId: task.agentId,
        taskId: task.id,
        tokens: result.tokensUsed,
        cost: result.aiCost || null,
        model: result.model || orgSettings.model || 'gpt-4o-mini',
        department: agent.role,
        durationMs: startedAt ? Date.now() - new Date(startedAt).getTime() : 0,
        success: true,
      })
    }

    await writeAgentAuditLog({
      orgId: task.orgId,
      agentId: task.agentId,
      action: 'agent.task.completed',
      entity: task.entity,
      entityId: task.entityId,
      detail: result.summary,
      confidence: result.confidence,
      explanation: result.explanation,
      correlationId: task.correlationId,
    })

    await emitPlatformEvent({
      db,
      orgId: task.orgId,
      type: PLATFORM_EVENTS.AGENT_ACTION,
      entity: task.entity || 'agent',
      entityId: task.entityId,
      agentId: task.agentId,
      source: 'agent-runtime',
      correlationId: task.correlationId,
      causationId: task.eventId,
      payload: {
        agentId: task.agentId,
        agentName: task.agentName || agent.name,
        taskId: task.id,
        summary: result.summary,
        confidence: result.confidence,
        explanation: result.explanation,
        permissions: perms.allowedModules,
      },
    })

    await emitAgentLifecycleEvent(db, {
      orgId: task.orgId,
      type: PLATFORM_EVENTS.AGENT_COMPLETED,
      agentId: task.agentId,
      taskId: task.id,
      correlationId: task.correlationId,
      causationId: task.eventId,
      payload: { confidence: result.confidence },
    })

    await emitPlatformEvent({
      db,
      orgId: task.orgId,
      type: PLATFORM_EVENTS.AGENT_TASK_COMPLETED,
      entity: 'agent_task',
      entityId: task.id,
      agentId: task.agentId,
      source: 'agent-runtime',
      correlationId: task.correlationId,
      causationId: task.eventId,
      payload: {
        agentId: task.agentId,
        taskId: task.id,
        status: 'completed',
        confidence: result.confidence,
      },
    })

    return {
      ...task,
      status: TASK_STATUS.COMPLETED,
      output: result.output,
      confidence: result.confidence,
      explanation: result.explanation,
      completedAt,
    }
  } catch (err) {
    const completedAt = new Date().toISOString()
    await db.collection('agent_tasks').updateOne(
      { orgId: task.orgId, id: task.id },
      {
        $set: {
          status: TASK_STATUS.FAILED,
          error: err.message,
          completedAt,
        },
        $inc: { retryCount: 1 },
      },
    )

    await emitAgentLifecycleEvent(db, {
      orgId: task.orgId,
      type: PLATFORM_EVENTS.AGENT_FAILED,
      agentId: task.agentId,
      taskId: task.id,
      correlationId: task.correlationId,
      causationId: task.eventId,
      payload: { error: err.message },
    })

    throw err
  }
}
