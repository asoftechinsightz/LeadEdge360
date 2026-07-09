import { getSubscribedAgents } from '@/lib/agents/marketplace/manifest'
import { createAgentTask } from '@/lib/agents/service'
import { executeAgentTask } from '@/lib/agents/executor'
import { evaluateApproval } from '@/lib/agents/approval'
import {
  getOrgAiSettings,
  getEffectiveAgentConfig,
  isAgentEnabledForOrg,
  isWithinBusinessHours,
  checkDailyAgentLimit,
} from '@/lib/agents/org-config'
import { checkUsageBudget } from '@/lib/agents/cost-management'

/**
 * Dispatch agent tasks for a platform event (called from event processor).
 */
export async function dispatchAgentTasks(event, db) {
  const agents = await getSubscribedAgents(db, event.orgId, event.type)
  if (!agents.length) return []

  const orgSettings = await getOrgAiSettings(db, event.orgId)

  if (!orgSettings.enabled) return []

  if (!isWithinBusinessHours(orgSettings)) {
    return [{ status: 'skipped', reason: 'outside_business_hours' }]
  }

  const budget = await checkUsageBudget(db, event.orgId, orgSettings)
  if (!budget.withinBudget) {
    return [{ status: 'skipped', reason: 'budget_exceeded' }]
  }

  const results = []
  for (const agent of agents) {
    if (!isAgentEnabledForOrg(orgSettings, agent.id)) {
      results.push({ agentId: agent.id, status: 'skipped', reason: 'disabled' })
      continue
    }

    const limitCheck = await checkDailyAgentLimit(db, event.orgId, agent.id, orgSettings)
    if (!limitCheck.allowed) {
      results.push({ agentId: agent.id, status: 'skipped', reason: limitCheck.reason })
      continue
    }

    const effective = getEffectiveAgentConfig(orgSettings, agent)

    const approvalContext = {
      dealValue: event.payload?.totalAmount || event.payload?.amount || 0,
      confidence: event.payload?.confidence,
    }
    const approval = await evaluateApproval(db, event.orgId, { agentId: agent.id }, approvalContext)

    const task = await createAgentTask(db, {
      orgId: event.orgId,
      agentId: agent.id,
      type: 'event_triggered',
      input: { eventType: event.type, payload: event.payload },
      eventId: event.id,
      correlationId: event.correlationId,
      entity: event.entity,
      entityId: event.entityId,
      priority: agent.id === 'lead-qualification-ai' ? 'high' : 'normal',
    })

    const needsApproval = approval.requiresApproval || effective.requiresApproval
    if (needsApproval) {
      await db.collection('agent_tasks').updateOne(
        { orgId: event.orgId, id: task.id },
        { $set: { requiresApproval: true, approverRole: approval.approverRole } },
      )
    }

    const shouldAutoRun = effective.autoRun && !needsApproval

    if (shouldAutoRun) {
      try {
        const completed = await executeAgentTask(db, { ...task, requiresApproval: needsApproval })
        results.push({ agentId: agent.id, taskId: task.id, status: completed.status })
      } catch (err) {
        results.push({ agentId: agent.id, taskId: task.id, status: 'failed', error: err.message })
      }
    } else if (needsApproval) {
      results.push({ agentId: agent.id, taskId: task.id, status: 'awaiting_approval' })
    } else {
      results.push({ agentId: agent.id, taskId: task.id, status: 'queued' })
    }
  }

  return results
}
