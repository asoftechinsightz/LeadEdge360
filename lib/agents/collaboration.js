import { randomUUID } from 'crypto'
import { emitPlatformEvent } from '@/lib/events/bus'
import { PLATFORM_EVENTS } from '@/lib/events/types'
import { createAgentTask } from '@/lib/agents/service'
import { getAgentById } from '@/lib/agents/registry'

/**
 * Delegate work to another AI employee via Event Bus + Task Queue.
 * Never calls handler functions directly.
 */
export async function delegateToAgent(db, {
  orgId,
  fromAgentId,
  toAgentId,
  input = {},
  entity = null,
  entityId = null,
  correlationId = null,
  reason = '',
  parentTaskId = null,
}) {
  const target = getAgentById(toAgentId)
  if (!target) throw new Error(`Unknown target agent: ${toAgentId}`)

  const event = await emitPlatformEvent({
    db,
    orgId,
    type: PLATFORM_EVENTS.AGENT_DELEGATE_REQUESTED,
    entity: entity || 'agent',
    entityId: entityId || parentTaskId,
    agentId: fromAgentId,
    source: 'agent-runtime',
    correlationId,
    payload: {
      fromAgentId,
      toAgentId,
      reason,
      parentTaskId,
      input,
    },
  })

  const task = await createAgentTask(db, {
    orgId,
    agentId: toAgentId,
    type: 'delegation',
    input: { ...input, delegatedFrom: fromAgentId, reason },
    eventId: event.id,
    correlationId: correlationId || event.correlationId,
    entity,
    entityId,
    priority: 'high',
  })

  await db.collection('agent_delegations').insertOne({
    id: randomUUID(),
    orgId,
    fromAgentId,
    toAgentId,
    parentTaskId,
    childTaskId: task.id,
    eventId: event.id,
    reason,
    createdAt: new Date().toISOString(),
  })

  return { event, task }
}

export async function escalateToAgent(db, params) {
  const result = await delegateToAgent(db, {
    ...params,
    reason: params.reason || 'Escalation',
  })

  await emitPlatformEvent({
    db,
    orgId: params.orgId,
    type: PLATFORM_EVENTS.AGENT_ESCALATED,
    entity: 'agent_task',
    entityId: result.task.id,
    agentId: params.fromAgentId,
    source: 'agent-runtime',
    correlationId: params.correlationId,
    payload: {
      fromAgentId: params.fromAgentId,
      toAgentId: params.toAgentId,
      taskId: result.task.id,
      reason: params.reason,
    },
  })

  return result
}
