import { randomUUID } from 'crypto'
import { getDb } from '@/lib/mongo'
import { mergeTemplate } from '@/lib/campaigns/templates'
import { getSmtpReadiness } from '@/lib/campaigns/smtp'
import { sendLeadWhatsAppTemplate } from '@/lib/whatsapp-service'
import { trackWhatsAppSent } from '@/lib/analytics/track-whatsapp'
import { emitPlatformEvent } from '@/lib/events/bus'

export const WORKFLOW_TRIGGERS = {
  LEAD_CREATED: 'lead_created',
  STAGE_CHANGE: 'stage_change',
  NO_REPLY_3_DAYS: 'no_reply_3_days',
}

const WORKFLOWS = 'automation_workflows'
const ENROLLMENTS = 'workflow_enrollments'

function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
}

/**
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 * @param {object} workflow
 */
export async function createWorkflow(db, orgId, workflow) {
  const now = new Date().toISOString()
  const doc = {
    id: randomUUID(),
    orgId,
    name: workflow.name || 'Untitled workflow',
    status: workflow.status || 'draft',
    trigger: workflow.trigger || { type: WORKFLOW_TRIGGERS.LEAD_CREATED },
    steps: workflow.steps || [],
    dripTemplateId: workflow.dripTemplateId || null,
    campaignId: workflow.campaignId || null,
    runs: 0,
    conversions: 0,
    createdAt: now,
    updatedAt: now,
    createdBy: workflow.createdBy || 'system',
  }
  await db.collection(WORKFLOWS).insertOne(doc)
  return doc
}

/**
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 */
export async function listWorkflows(db, orgId) {
  return db.collection(WORKFLOWS)
    .find({ orgId }, { projection: { _id: 0 } })
    .sort({ updatedAt: -1 })
    .toArray()
}

/**
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 * @param {string} workflowId
 */
export async function getWorkflow(db, orgId, workflowId) {
  return db.collection(WORKFLOWS).findOne({ orgId, id: workflowId }, { projection: { _id: 0 } })
}

/**
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 * @param {string} workflowId
 * @param {object} patch
 */
export async function updateWorkflow(db, orgId, workflowId, patch) {
  const update = { updatedAt: new Date().toISOString() }
  if (patch.name !== undefined) update.name = patch.name
  if (patch.status !== undefined) update.status = patch.status
  if (patch.trigger !== undefined) update.trigger = patch.trigger
  if (patch.steps !== undefined) update.steps = patch.steps

  await db.collection(WORKFLOWS).updateOne({ orgId, id: workflowId }, { $set: update })
  return getWorkflow(db, orgId, workflowId)
}

/**
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 * @param {string} workflowId
 * @param {string} leadId
 */
export async function enrollLeadInWorkflow(db, orgId, workflowId, leadId) {
  const workflow = await getWorkflow(db, orgId, workflowId)
  if (!workflow || workflow.status !== 'active') return null

  const existing = await db.collection(ENROLLMENTS).findOne({
    orgId,
    workflowId,
    leadId,
    status: 'active',
  })
  if (existing) return existing

  const lead = await db.collection('leads').findOne({ orgId, id: leadId }, { projection: { _id: 0 } })
  if (!lead) return null

  const now = new Date()
  const firstStep = workflow.steps[0]
  const nextRunAt = firstStep?.type === 'wait'
    ? addDays(now, firstStep.delayDays || 0).toISOString()
    : now.toISOString()

  const enrollment = {
    id: randomUUID(),
    orgId,
    workflowId,
    leadId,
    currentStepIndex: 0,
    status: 'active',
    nextRunAt,
    context: {
      enrolledAt: now.toISOString(),
      lastOutboundAt: null,
      replied: false,
    },
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  }

  await db.collection(ENROLLMENTS).insertOne(enrollment)
  await db.collection(WORKFLOWS).updateOne(
    { orgId, id: workflowId },
    { $inc: { runs: 1 }, $set: { updatedAt: now.toISOString() } },
  )

  return enrollment
}

/**
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 * @param {string} triggerType
 * @param {{ leadId: string, lead?: object, fromStage?: string, toStage?: string }} payload
 */
export async function handleWorkflowTrigger(db, orgId, triggerType, payload) {
  const filter = { orgId, status: 'active', 'trigger.type': triggerType }
  const workflows = await db.collection(WORKFLOWS).find(filter, { projection: { _id: 0 } }).toArray()

  const enrolled = []
  for (const workflow of workflows) {
    if (triggerType === WORKFLOW_TRIGGERS.STAGE_CHANGE) {
      const targetStage = workflow.trigger?.stage
      if (targetStage && payload.toStage !== targetStage) continue
    }
    const e = await enrollLeadInWorkflow(db, orgId, workflow.id, payload.leadId)
    if (e) enrolled.push(e)
  }
  return enrolled
}

async function leadHasReplied(db, orgId, leadId, sinceIso) {
  const since = sinceIso ? new Date(sinceIso) : new Date(0)
  const wa = await db.collection('whatsapp_messages').findOne({
    orgId,
    leadId,
    direction: 'inbound',
    createdAt: { $gte: since.toISOString() },
  })
  if (wa) return true

  const thread = await db.collection('whatsapp_threads').findOne({ orgId, leadId })
  if (thread) {
    const inbound = await db.collection('whatsapp_messages').findOne({
      orgId,
      threadId: thread.id,
      direction: 'inbound',
      createdAt: { $gte: since.toISOString() },
    })
    if (inbound) return true
  }
  return false
}

async function executeSendEmail(db, orgId, lead, step) {
  const smtp = getSmtpReadiness()
  let subject = step.subject || ''
  let body = step.body || ''

  if (step.emailTemplateId) {
    const tpl = await db.collection('email_templates').findOne({ orgId, id: step.emailTemplateId })
    if (tpl) {
      subject = tpl.subject
      body = tpl.body
    }
  }

  subject = mergeTemplate(subject, lead)
  body = mergeTemplate(body, lead)

  let status = 'generated'
  if (smtp.ready && lead.email) {
    try {
      const { getTenantEmailFromName } = await import('@/lib/branding/tenant-defaults')
      const fromName = await getTenantEmailFromName(db, orgId)
      const { sendEmail } = await import('@/lib/email/send-email')
      await sendEmail({ fromName, to: lead.email, subject, html: body })
      status = 'sent'
    } catch {
      status = 'failed'
    }
  }

  await db.collection('campaign_messages').insertOne({
    id: randomUUID(),
    orgId,
    leadId: lead.id,
    channel: 'email',
    workflowStepId: step.id,
    status,
    subject,
    body,
    createdAt: new Date().toISOString(),
  })

  return status
}

async function executeStep(db, orgId, enrollment, workflow, lead, step) {
  const now = new Date()

  if (step.type === 'wait') {
    return {
      done: false,
      nextRunAt: now.toISOString(),
      advance: true,
    }
  }

  if (step.type === 'send_email') {
    await executeSendEmail(db, orgId, lead, step)
    return {
      done: false,
      nextRunAt: now.toISOString(),
      advance: true,
      lastOutboundAt: now.toISOString(),
    }
  }

  if (step.type === 'condition_no_reply') {
    const since = enrollment.context?.lastOutboundAt || enrollment.context?.enrolledAt
    const replied = await leadHasReplied(db, orgId, lead.id, since)
    if (replied) {
      return { done: true, advance: false, replied: true }
    }
    if (!enrollment.context?.waitingForReplySince) {
      return {
        done: false,
        nextRunAt: addDays(now, step.waitDays || 3).toISOString(),
        advance: false,
        waitingForReplySince: now.toISOString(),
      }
    }
    return {
      done: false,
      nextRunAt: now.toISOString(),
      advance: true,
    }
  }

  if (step.type === 'send_whatsapp') {
    try {
      await sendLeadWhatsAppTemplate(db, orgId, 'system', lead, step.templateId || 'new_lead', {})
    } catch (e) {
      if (lead.phone) {
        await trackWhatsAppSent(db, {
          orgId,
          leadId: lead.id,
          templateName: step.templateId || 'new_lead',
          userId: 'system',
          metadata: { workflowId: workflow.id, error: e.message },
        })
      }
    }
    return {
      done: false,
      nextRunAt: now.toISOString(),
      advance: true,
      lastOutboundAt: now.toISOString(),
    }
  }

  if (step.type === 'create_task') {
    const title = String(step.taskTitle || step.label || 'Follow up with lead')
      .replace(/\{\{name\}\}/g, lead.name || 'lead')
      .replace(/\{\{company\}\}/g, lead.company || 'their company')
    await db.collection('tasks').insertOne({
      id: randomUUID(),
      orgId,
      leadId: lead.id,
      title,
      status: 'open',
      priority: step.priority || 'medium',
      dueAt: addDays(now, step.dueDays || 0).toISOString(),
      source: 'workflow',
      workflowId: workflow.id,
      workflowStepId: step.id,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    })
    return {
      done: false,
      nextRunAt: now.toISOString(),
      advance: true,
    }
  }

  return { done: false, nextRunAt: now.toISOString(), advance: true }
}

/**
 * Process enrollments that are due — called by scheduled campaign runner.
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 */
export async function processDueWorkflowEnrollments(db, orgId, { limit = 50, now = new Date() } = {}) {
  const isoNow = now.toISOString()
  const due = await db.collection(ENROLLMENTS)
    .find({
      orgId,
      status: 'active',
      nextRunAt: { $lte: isoNow },
    }, { projection: { _id: 0 } })
    .sort({ nextRunAt: 1 })
    .limit(limit)
    .toArray()

  const results = { processed: 0, completed: 0, skipped: 0, errors: [] }

  for (const enrollment of due) {
    try {
      const workflow = await getWorkflow(db, orgId, enrollment.workflowId)
      if (!workflow || workflow.status !== 'active') {
        await db.collection(ENROLLMENTS).updateOne(
          { orgId, id: enrollment.id },
          { $set: { status: 'cancelled', updatedAt: isoNow } },
        )
        results.skipped++
        continue
      }

      const lead = await db.collection('leads').findOne({ orgId, id: enrollment.leadId }, { projection: { _id: 0 } })
      if (!lead) {
        await db.collection(ENROLLMENTS).updateOne(
          { orgId, id: enrollment.id },
          { $set: { status: 'cancelled', updatedAt: isoNow } },
        )
        results.skipped++
        continue
      }

      let stepIndex = enrollment.currentStepIndex || 0
      let step = workflow.steps[stepIndex]
      if (!step) {
        await db.collection(ENROLLMENTS).updateOne(
          { orgId, id: enrollment.id },
          { $set: { status: 'completed', updatedAt: isoNow, completedAt: isoNow } },
        )
        await db.collection(WORKFLOWS).updateOne(
          { orgId, id: workflow.id },
          { $inc: { conversions: 1 } },
        )
        results.completed++
        continue
      }

      const outcome = await executeStep(db, orgId, enrollment, workflow, lead, step)
      const context = { ...enrollment.context }
      if (outcome.lastOutboundAt) context.lastOutboundAt = outcome.lastOutboundAt
      if (outcome.replied) context.replied = true
      if (outcome.waitingForReplySince) context.waitingForReplySince = outcome.waitingForReplySince
      if (outcome.advance && step?.type === 'condition_no_reply') {
        delete context.waitingForReplySince
      }

      if (outcome.done) {
        await db.collection(ENROLLMENTS).updateOne(
          { orgId, id: enrollment.id },
          { $set: { status: 'completed', context, updatedAt: isoNow, completedAt: isoNow } },
        )
        results.completed++
        results.processed++
        continue
      }

      let nextIndex = stepIndex
      if (outcome.advance) nextIndex = stepIndex + 1

      let nextRunAt = outcome.nextRunAt || isoNow
      const upcoming = workflow.steps[nextIndex]
      if (outcome.advance && upcoming?.type === 'wait') {
        nextRunAt = addDays(now, upcoming.delayDays || 1).toISOString()
      }

      if (nextIndex >= workflow.steps.length) {
        await db.collection(ENROLLMENTS).updateOne(
          { orgId, id: enrollment.id },
          {
            $set: {
              status: 'completed',
              currentStepIndex: nextIndex,
              context,
              updatedAt: isoNow,
              completedAt: isoNow,
            },
          },
        )
        await db.collection(WORKFLOWS).updateOne(
          { orgId, id: workflow.id },
          { $inc: { conversions: 1 } },
        )
        results.completed++
      } else {
        await db.collection(ENROLLMENTS).updateOne(
          { orgId, id: enrollment.id },
          {
            $set: {
              currentStepIndex: nextIndex,
              nextRunAt,
              context,
              updatedAt: isoNow,
            },
          },
        )
      }

      results.processed++
    } catch (e) {
      results.errors.push({ enrollmentId: enrollment.id, error: e.message })
    }
  }

  return results
}

/**
 * Enroll leads with no reply in 3+ days into no_reply_3_days workflows.
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 */
export async function processNoReplyTriggers(db, orgId) {
  const workflows = await db.collection(WORKFLOWS)
    .find({ orgId, status: 'active', 'trigger.type': WORKFLOW_TRIGGERS.NO_REPLY_3_DAYS })
    .toArray()

  if (!workflows.length) return { enrolled: 0 }

  const cutoff = addDays(new Date(), -3).toISOString()
  const leads = await db.collection('leads')
    .find({
      orgId,
      status: { $nin: ['Lost', 'Won'] },
      $or: [
        { lastWhatsAppAt: { $lte: cutoff } },
        { lastWhatsAppAt: { $exists: false } },
      ],
      updatedAt: { $lte: cutoff },
    }, { projection: { _id: 0, id: 1 } })
    .limit(100)
    .toArray()

  let enrolled = 0
  for (const lead of leads) {
    for (const workflow of workflows) {
      const e = await enrollLeadInWorkflow(db, orgId, workflow.id, lead.id)
      if (e) enrolled++
    }
  }
  return { enrolled }
}

/**
 * Activate workflow and linked drip campaign.
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 * @param {string} workflowId
 * @param {string} userId
 */
export async function activateWorkflow(db, orgId, workflowId, userId) {
  const now = new Date().toISOString()
  await db.collection(WORKFLOWS).updateOne(
    { orgId, id: workflowId },
    { $set: { status: 'active', activatedAt: now, activatedBy: userId, updatedAt: now } },
  )

  const workflow = await getWorkflow(db, orgId, workflowId)
  if (workflow?.campaignId) {
    await db.collection('campaigns').updateOne(
      { orgId, id: workflow.campaignId },
      { $set: { status: 'scheduled', scheduledAt: now, updatedAt: now } },
    )
  }

  await emitPlatformEvent({
    db,
    orgId,
    type: 'workflow.activated',
    entity: 'workflow',
    entityId: workflowId,
    userId,
    payload: { name: workflow?.name, dripTemplateId: workflow?.dripTemplateId },
    source: 'automation',
  })

  return workflow
}

/**
 * Enroll existing leads matching drip trigger (on activation).
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 * @param {object} workflow
 */
export async function enrollExistingLeadsForWorkflow(db, orgId, workflow) {
  const trigger = workflow.trigger || {}
  let leads = []

  if (trigger.type === WORKFLOW_TRIGGERS.LEAD_CREATED) {
    leads = await db.collection('leads')
      .find({ orgId, status: 'New' }, { projection: { _id: 0, id: 1 } })
      .limit(200)
      .toArray()
  } else if (trigger.type === WORKFLOW_TRIGGERS.STAGE_CHANGE && trigger.stage) {
    leads = await db.collection('leads')
      .find({ orgId, status: trigger.stage }, { projection: { _id: 0, id: 1 } })
      .limit(200)
      .toArray()
  }

  let count = 0
  for (const lead of leads) {
    const e = await enrollLeadInWorkflow(db, orgId, workflow.id, lead.id)
    if (e) count++
  }
  return count
}
