/**
 * Pre-built drip sequences — activate in 2 clicks (Email + WhatsApp + Tasks).
 */

export const DRIP_TEMPLATES = [
  {
    id: 'new_lead_nurture',
    name: 'New Lead Nurture',
    description: 'Day 0 welcome email → Day 1 WhatsApp intro → Day 3 call task.',
    trigger: { type: 'lead_created', label: 'New Lead' },
    channels: ['email', 'whatsapp', 'task'],
    steps: [
      { id: 'email-day0', type: 'send_email', templateKey: 'new_lead_nurture_email', label: 'Day 0 — Welcome email' },
      { id: 'wait-1d', type: 'wait', delayDays: 1, label: 'Wait until Day 1' },
      { id: 'wa-day1', type: 'send_whatsapp', templateId: 'new_lead', label: 'Day 1 — WhatsApp intro' },
      { id: 'wait-2d', type: 'wait', delayDays: 2, label: 'Wait until Day 3' },
      { id: 'task-day3', type: 'create_task', label: 'Day 3 — Schedule call', taskTitle: 'Call {{name}} about {{company}}', dueDays: 0 },
    ],
    emailTemplates: {
      new_lead_nurture_email: {
        name: 'New Lead Nurture — Welcome',
        subject: 'Welcome {{name}} — let\'s connect about {{company}}',
        body: '<p>Hi {{name}},</p><p>Thanks for your interest in {{company}}. We\'d love to learn more about your goals and show how LeadEdge360 can help.</p><p>Reply to this email or message us on WhatsApp anytime.</p>',
      },
    },
  },
  {
    id: 'proposal_followup',
    name: 'Proposal Follow-up',
    description: 'Day 2 proposal reminder email → Day 5 WhatsApp nudge.',
    trigger: { type: 'stage_change', stage: 'Proposal', label: 'Stage → Proposal' },
    channels: ['email', 'whatsapp'],
    steps: [
      { id: 'wait-2d', type: 'wait', delayDays: 2, label: 'Wait until Day 2' },
      { id: 'email-proposal', type: 'send_email', templateKey: 'proposal_followup_email', label: 'Day 2 — Proposal email' },
      { id: 'wait-3d', type: 'wait', delayDays: 3, label: 'Wait until Day 5' },
      { id: 'wa-proposal', type: 'send_whatsapp', templateId: 'proposal_sent', label: 'Day 5 — WhatsApp follow-up' },
    ],
    emailTemplates: {
      proposal_followup_email: {
        name: 'Proposal Follow-up',
        subject: 'Following up on your proposal — {{company}}',
        body: '<p>Hi {{name}},</p><p>Just checking if you had a chance to review our proposal for {{company}}. Happy to answer questions or adjust the scope.</p>',
      },
    },
  },
  {
    id: 'lost_lead_winback',
    name: 'Lost Lead Winback',
    description: 'Day 30 winback email when a lead moves to Lost.',
    trigger: { type: 'stage_change', stage: 'Lost', label: 'Stage → Lost' },
    channels: ['email'],
    steps: [
      { id: 'wait-30d', type: 'wait', delayDays: 30, label: 'Wait 30 days' },
      { id: 'email-winback', type: 'send_email', templateKey: 'lost_lead_winback_email', label: 'Day 30 — Winback email' },
    ],
    emailTemplates: {
      lost_lead_winback_email: {
        name: 'Lost Lead Winback',
        subject: '{{name}}, still thinking about {{company}}?',
        body: '<p>Hi {{name}},</p><p>We noticed things didn\'t move forward last time. If your priorities have changed, we\'re happy to share a fresh proposal for {{company}}.</p>',
      },
    },
  },
]

/**
 * @param {string} dripId
 */
export function getDripTemplate(dripId) {
  return DRIP_TEMPLATES.find((d) => d.id === dripId) || null
}

export function listDripTemplates() {
  return DRIP_TEMPLATES.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    trigger: d.trigger,
    channels: d.channels,
    stepCount: d.steps.length,
  }))
}

/**
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 * @param {{ id: string, emailTemplates?: Record<string, object> }} drip
 */
export async function ensureDripEmailTemplates(db, orgId, drip) {
  const templateIds = {}
  const templates = drip.emailTemplates || {}

  for (const [key, tpl] of Object.entries(templates)) {
    const existing = await db.collection('email_templates').findOne({ orgId, dripKey: key })
    if (existing) {
      templateIds[key] = existing.id
      continue
    }
    const { randomUUID } = await import('crypto')
    const id = randomUUID()
    await db.collection('email_templates').insertOne({
      id,
      orgId,
      dripKey: key,
      dripId: drip.id,
      name: tpl.name || key,
      subject: tpl.subject,
      body: tpl.body,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    templateIds[key] = id
  }

  return templateIds
}

/**
 * Hydrate drip steps with resolved email template ids.
 * @param {object} drip
 * @param {Record<string, string>} templateIds
 */
export function hydrateDripSteps(drip, templateIds) {
  return drip.steps.map((step) => {
    if (step.type === 'send_email' && step.templateKey) {
      return { ...step, emailTemplateId: templateIds[step.templateKey] || null }
    }
    return { ...step }
  })
}

/**
 * Activate a pre-built drip in 2 clicks — creates workflow + scheduled campaign.
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 * @param {string} dripId
 * @param {string} userId
 */
export async function activateDripTemplate(db, orgId, dripId, userId) {
  const drip = getDripTemplate(dripId)
  if (!drip) {
    const err = new Error('NOT_FOUND')
    err.detail = 'Drip template not found'
    throw err
  }

  const existing = await db.collection('automation_workflows').findOne({
    orgId,
    dripTemplateId: dripId,
    status: 'active',
  })
  if (existing) {
    return { workflow: existing, campaign: await db.collection('campaigns').findOne({ orgId, id: existing.campaignId }), alreadyActive: true }
  }

  const templateIds = await ensureDripEmailTemplates(db, orgId, drip)
  const steps = hydrateDripSteps(drip, templateIds)

  const { createWorkflow, activateWorkflow, enrollExistingLeadsForWorkflow } = await import('@/lib/automation/workflow-engine')
  const { createCampaign } = await import('@/lib/campaigns/campaigns')

  const campaignResult = await createCampaign(orgId, {
    name: drip.name,
    channel: 'multi',
    campaignType: 'drip',
    dripTemplateId: dripId,
    status: 'scheduled',
    scheduledAt: new Date().toISOString(),
    createdBy: userId,
    audience: drip.trigger?.type === 'stage_change' && drip.trigger.stage
      ? { status: drip.trigger.stage }
      : { status: 'New' },
  })

  const workflow = await createWorkflow(db, orgId, {
    name: drip.name,
    status: 'draft',
    trigger: drip.trigger,
    steps,
    dripTemplateId: dripId,
    campaignId: campaignResult.campaign.id,
    createdBy: userId,
  })

  await db.collection('campaigns').updateOne(
    { orgId, id: campaignResult.campaign.id },
    { $set: { workflowId: workflow.id, updatedAt: new Date().toISOString() } },
  )

  await activateWorkflow(db, orgId, workflow.id, userId)
  const enrolled = await enrollExistingLeadsForWorkflow(db, orgId, { ...workflow, status: 'active' })

  const activeWorkflow = await db.collection('automation_workflows').findOne({ orgId, id: workflow.id })

  return {
    workflow: activeWorkflow,
    campaign: await db.collection('campaigns').findOne({ orgId, id: campaignResult.campaign.id }),
    enrolled,
    alreadyActive: false,
  }
}
