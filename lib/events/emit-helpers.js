import { emitPlatformEvent } from '@/lib/events/bus'
import { PLATFORM_EVENTS } from '@/lib/events/types'

/** Emit lead lifecycle events from CRM mutations. */
export async function emitLeadLifecycleEvent(db, {
  orgId,
  type,
  leadId,
  payload = {},
  userId = null,
  source = 'api',
  correlationId = null,
}) {
  return emitPlatformEvent({
    db,
    orgId,
    type,
    entity: 'lead',
    entityId: leadId,
    payload: { leadId, ...payload },
    userId,
    source,
    correlationId,
  })
}

export async function emitOpportunityEvent(db, {
  orgId,
  type,
  opportunityId,
  payload = {},
  userId = null,
  source = 'opportunities',
  correlationId = null,
}) {
  return emitPlatformEvent({
    db,
    orgId,
    type,
    entity: 'opportunity',
    entityId: opportunityId,
    payload: { opportunityId, ...payload },
    userId,
    source,
    correlationId,
  })
}

export async function emitProposalEvent(db, {
  orgId,
  type,
  proposalId,
  payload = {},
  userId = null,
  source = 'proposals',
  correlationId = null,
}) {
  return emitPlatformEvent({
    db,
    orgId,
    type,
    entity: 'proposal',
    entityId: proposalId,
    payload: { proposalId, ...payload },
    userId,
    source,
    correlationId,
  })
}

export async function emitInvoiceEvent(db, {
  orgId,
  type,
  invoiceId,
  payload = {},
  userId = null,
  source = 'billing',
  correlationId = null,
}) {
  return emitPlatformEvent({
    db,
    orgId,
    type,
    entity: 'invoice',
    entityId: invoiceId,
    payload: { invoiceId, ...payload },
    userId,
    source,
    correlationId,
  })
}

export async function emitCampaignEvent(db, {
  orgId,
  type,
  campaignId,
  payload = {},
  userId = null,
  source = 'campaigns',
  correlationId = null,
}) {
  return emitPlatformEvent({
    db,
    orgId,
    type,
    entity: 'campaign',
    entityId: campaignId,
    payload: { campaignId, ...payload },
    userId,
    source,
    correlationId,
  })
}

export async function emitCustomerEvent(db, {
  orgId,
  type,
  customerId,
  payload = {},
  userId = null,
  source = 'customer-success',
  correlationId = null,
}) {
  return emitPlatformEvent({
    db,
    orgId,
    type,
    entity: 'customer',
    entityId: customerId,
    payload: { customerId, ...payload },
    userId,
    source,
    correlationId,
  })
}

export async function emitAgentLifecycleEvent(db, {
  orgId,
  type,
  agentId,
  taskId,
  payload = {},
  correlationId = null,
  causationId = null,
}) {
  return emitPlatformEvent({
    db,
    orgId,
    type,
    entity: 'agent_task',
    entityId: taskId,
    agentId,
    source: 'agent-runtime',
    correlationId,
    causationId,
    payload: { agentId, taskId, ...payload },
  })
}

export { PLATFORM_EVENTS }
