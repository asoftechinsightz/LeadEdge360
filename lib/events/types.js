/** Platform event types — consumed by agents, n8n, and audit pipelines. */

export const PLATFORM_EVENTS = {
  // CRM — Lead lifecycle
  LEAD_CREATED: 'lead.created',
  LEAD_UPDATED: 'lead.updated',
  LEAD_ASSIGNED: 'lead.assigned',
  LEAD_QUALIFIED: 'lead.qualified',
  LEAD_CONVERTED: 'lead.converted',
  LEAD_LOST: 'lead.lost',
  LEAD_DELETED: 'lead.deleted',
  LEAD_RESTORED: 'lead.restored',

  // Opportunity
  OPPORTUNITY_CREATED: 'opportunity.created',
  OPPORTUNITY_STAGE_CHANGED: 'opportunity.stage_changed',
  OPPORTUNITY_WON: 'opportunity.won',
  OPPORTUNITY_LOST: 'opportunity.lost',

  // Proposal
  PROPOSAL_CREATED: 'proposal.created',
  PROPOSAL_SENT: 'proposal.sent',
  PROPOSAL_APPROVED: 'proposal.approved',
  PROPOSAL_REJECTED: 'proposal.rejected',
  PROPOSAL_WON: 'proposal.won',
  PROPOSAL_CONVERTED: 'proposal.converted_to_invoice',

  // Invoice & payments
  INVOICE_CREATED: 'invoice.created',
  INVOICE_PAID: 'invoice.paid',
  INVOICE_CLOSED: 'invoice.closed',
  PAYMENT_RECEIVED: 'payment.received',
  PAYMENT_PARTIAL: 'payment.partial',
  PAYMENT_FAILED: 'payment.failed',

  // Campaign
  CAMPAIGN_CREATED: 'campaign.created',
  CAMPAIGN_STARTED: 'campaign.started',
  CAMPAIGN_COMPLETED: 'campaign.completed',
  CAMPAIGN_EXECUTED: 'campaign.executed',

  // Customer success
  CUSTOMER_ONBOARDED: 'customer.onboarded',
  CUSTOMER_HEALTH_CHANGED: 'customer.health_score_changed',
  CUSTOMER_RENEWAL_DUE: 'customer.renewal_due',

  // Tasks & meetings
  FOLLOWUP_CREATED: 'followup.created',
  TASK_CREATED: 'task.created',
  TASK_ASSIGNED: 'task.assigned',
  MEETING_SCHEDULED: 'meeting.scheduled',
  DOCUMENT_UPLOADED: 'document.uploaded',

  // Agent lifecycle
  AGENT_STARTED: 'agent.started',
  AGENT_WAITING: 'agent.waiting',
  AGENT_COMPLETED: 'agent.completed',
  AGENT_FAILED: 'agent.failed',
  AGENT_ESCALATED: 'agent.escalated',
  AGENT_DELEGATE_REQUESTED: 'agent.delegate.requested',
  AGENT_ACTION: 'agent.action',
  AGENT_TASK_COMPLETED: 'agent.task.completed',

  // Scanner & billing
  SCANNER_JOB_COMPLETED: 'scanner.job.completed',
  SCANNER_RESULT_CONVERTED: 'scanner.result.converted',
  SUBSCRIPTION_CHANGED: 'subscription.changed',
  GROWTH_AUDIT_COMPLETED: 'growth.audit.completed',

  // Marketing Engine
  MARKETING_PLAN_COMPLETED: 'marketing.plan.completed',
  MARKETING_CONTENT_PUBLISH: 'marketing.content.publish',
  MARKETING_FOLLOWUP_SCHEDULED: 'marketing.followup.scheduled',
  MARKETING_PROPOSAL_AUTO: 'marketing.proposal.auto',
  MARKETING_CEO_BRIEFING: 'marketing.ceo.briefing',
}
