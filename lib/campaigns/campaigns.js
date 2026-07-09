import { randomUUID } from 'crypto'
import { getDb } from '@/lib/mongo'
import { logCampaignActivity } from './activity'
import { mergeTemplate } from './templates'
import { getSmtpReadiness } from './smtp'
import { emitCampaignEvent } from '@/lib/events/emit-helpers'
import { PLATFORM_EVENTS } from '@/lib/events/types'

const ALLOWED_UPDATE_FIELDS = [
  'name', 'channel', 'status', 'audience', 'templateId', 'scheduledAt', 'createdBy',
  'campaignType', 'workflowId', 'dripTemplateId',
]

async function resolveAudienceLeads(db, orgId, campaign) {
  const audience = campaign.audience || {}
  if (Array.isArray(audience.leadIds) && audience.leadIds.length) {
    return db.collection('leads')
      .find({ orgId, id: { $in: audience.leadIds } }, { projection: { _id: 0 } })
      .toArray()
  }
  if (audience.label) {
    return db.collection('leads')
      .find({ orgId, label: audience.label }, { projection: { _id: 0 } })
      .toArray()
  }
  if (audience.status) {
    return db.collection('leads')
      .find({ orgId, status: audience.status }, { projection: { _id: 0 } })
      .toArray()
  }
  return db.collection('leads')
    .find({ orgId, status: { $nin: ['Lost'] } }, { projection: { _id: 0 } })
    .limit(200)
    .toArray()
}

export async function createCampaign(orgId, payload = {}) {
  const db = await getDb()

  const leadIds = payload.audience?.leadIds || payload.leadIds || []
  const campaign = {
    id: randomUUID(),
    orgId,
    name: payload.name || 'Untitled Campaign',
    channel: payload.channel || 'email',
    campaignType: payload.campaignType || 'blast',
    workflowId: payload.workflowId || null,
    dripTemplateId: payload.dripTemplateId || null,
    status: payload.status || 'draft',
    audience: {
      leadIds: Array.isArray(leadIds) ? leadIds : [],
      label: payload.audience?.label || null,
      status: payload.audience?.status || null,
    },
    templateId: payload.templateId || null,
    scheduledAt: payload.scheduledAt || null,
    createdBy: payload.createdBy || 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await db.collection('campaigns').insertOne(campaign)
  await logCampaignActivity(orgId, campaign.id, 'created', 'Campaign created', campaign.name)

  await emitCampaignEvent(db, {
    orgId,
    type: PLATFORM_EVENTS.CAMPAIGN_CREATED,
    campaignId: campaign.id,
    payload: { campaignName: campaign.name, name: campaign.name, channel: campaign.channel },
    userId: payload.createdBy,
  })

  return { success: true, campaign }
}

export async function listCampaigns(orgId, page = 1, limit = 20) {
  const db = await getDb()
  page = Math.max(parseInt(page || 1, 10), 1)
  limit = Math.min(Math.max(parseInt(limit || 20, 10), 1), 100)
  const skip = (page - 1) * limit
  const filter = { orgId }

  const [items, total] = await Promise.all([
    db.collection('campaigns').find(filter, { projection: { _id: 0 } }).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
    db.collection('campaigns').countDocuments(filter),
  ])

  return { success: true, page, limit, total, pages: Math.ceil(total / limit), items }
}

export async function getCampaign(orgId, campaignId) {
  const db = await getDb()
  const campaign = await db.collection('campaigns').findOne({ id: campaignId, orgId }, { projection: { _id: 0 } })
  return { success: true, campaign }
}

export async function updateCampaign(orgId, campaignId, payload = {}) {
  const db = await getDb()
  const update = { updatedAt: new Date().toISOString() }
  for (const key of ALLOWED_UPDATE_FIELDS) {
    if (payload[key] !== undefined) update[key] = payload[key]
  }

  await db.collection('campaigns').updateOne({ id: campaignId, orgId }, { $set: update })
  const campaign = await db.collection('campaigns').findOne({ id: campaignId, orgId }, { projection: { _id: 0 } })
  await logCampaignActivity(orgId, campaignId, 'updated', 'Campaign updated', JSON.stringify(update))
  return { success: true, campaign }
}

export async function deleteCampaign(orgId, campaignId) {
  const db = await getDb()
  const result = await db.collection('campaigns').deleteOne({ id: campaignId, orgId })
  if (result.deletedCount > 0) {
    await logCampaignActivity(orgId, campaignId, 'deleted', 'Campaign deleted')
    await db.collection('campaign_activities').deleteMany({ orgId, campaignId })
  }
  return { success: true, deleted: result.deletedCount > 0 }
}

export async function attachTemplate(orgId, campaignId, templateId) {
  const db = await getDb()
  const template = await db.collection('email_templates').findOne({ id: templateId, orgId })
  if (!template) throw new Error('Template not found')

  await db.collection('campaigns').updateOne(
    { id: campaignId, orgId },
    { $set: { templateId, updatedAt: new Date().toISOString() } }
  )
  const campaign = await db.collection('campaigns').findOne({ id: campaignId, orgId }, { projection: { _id: 0 } })
  await logCampaignActivity(orgId, campaignId, 'template_attached', 'Template attached', templateId)
  return { success: true, campaign }
}

export async function executeCampaign(orgId, campaignId) {
  const db = await getDb()
  const campaign = await db.collection('campaigns').findOne({ id: campaignId, orgId })
  if (!campaign) throw new Error('Campaign not found')

  if (campaign.campaignType === 'drip' && campaign.workflowId) {
    return startDripCampaign(db, orgId, campaign)
  }

  return runBlastCampaign(db, orgId, campaign)
}

/**
 * Schedule drip campaign — enroll audience into linked workflow (no immediate blast).
 */
async function startDripCampaign(db, orgId, campaign) {
  const { enrollLeadInWorkflow, activateWorkflow } = await import('@/lib/automation/workflow-engine')
  const now = new Date().toISOString()

  await activateWorkflow(db, orgId, campaign.workflowId, campaign.createdBy || 'system')

  const leads = await resolveAudienceLeads(db, orgId, campaign)
  let enrolled = 0
  for (const lead of leads) {
    const e = await enrollLeadInWorkflow(db, orgId, campaign.workflowId, lead.id)
    if (e) enrolled++
  }

  await db.collection('campaigns').updateOne(
    { id: campaign.id, orgId },
    { $set: { status: 'scheduled', scheduledAt: now, updatedAt: now, lastExecutedAt: now } },
  )

  await logCampaignActivity(orgId, campaign.id, 'drip_scheduled', 'Drip campaign scheduled', `${enrolled} leads enrolled`)

  return {
    success: true,
    campaignId: campaign.id,
    campaignType: 'drip',
    workflowId: campaign.workflowId,
    enrolled,
    status: 'scheduled',
  }
}

/**
 * Process due drip steps and scheduled campaigns for an org.
 */
export async function processScheduledCampaigns(orgId, { limit = 50 } = {}) {
  const db = await getDb()
  const { processDueWorkflowEnrollments, processNoReplyTriggers } = await import('@/lib/automation/workflow-engine')

  const [enrollments, noReply, dueCampaigns] = await Promise.all([
    processDueWorkflowEnrollments(db, orgId, { limit }),
    processNoReplyTriggers(db, orgId),
    db.collection('campaigns').find({
      orgId,
      campaignType: 'drip',
      status: 'scheduled',
      scheduledAt: { $lte: new Date().toISOString() },
    }).limit(20).toArray(),
  ])

  let activated = 0
  for (const campaign of dueCampaigns) {
    if (campaign.workflowId) {
      await db.collection('campaigns').updateOne(
        { orgId, id: campaign.id },
        { $set: { status: 'running', updatedAt: new Date().toISOString() } },
      )
      activated++
    }
  }

  return {
    success: true,
    enrollments,
    noReply,
    campaignsActivated: activated,
  }
}

async function runBlastCampaign(db, orgId, campaign) {
  if (!campaign.templateId) throw new Error('Campaign template not attached')
  const campaignId = campaign.id

  const template = await db.collection('email_templates').findOne({ id: campaign.templateId, orgId })
  if (!template) throw new Error('Template not found')

  const leads = await resolveAudienceLeads(db, orgId, campaign)
  if (!leads.length) throw new Error('No leads in campaign audience')

  const executionId = randomUUID()
  const smtp = getSmtpReadiness()
  const now = new Date().toISOString()

  await db.collection('campaigns').updateOne(
    { id: campaignId, orgId },
    { $set: { status: 'running', updatedAt: now, lastExecutedAt: now } }
  )

  await emitCampaignEvent(db, {
    orgId,
    type: PLATFORM_EVENTS.CAMPAIGN_STARTED,
    campaignId,
    payload: { campaignName: campaign.name, name: campaign.name, totalLeads: leads.length },
  })

  await emitCampaignEvent(db, {
    orgId,
    type: PLATFORM_EVENTS.CAMPAIGN_EXECUTED,
    campaignId,
    payload: { campaignName: campaign.name, name: campaign.name },
  })

  await db.collection('campaign_executions').insertOne({
    id: executionId,
    orgId,
    campaignId,
    templateId: template.id,
    totalLeads: leads.length,
    status: 'running',
    smtpMode: smtp.mode,
    createdAt: now,
  })

  await logCampaignActivity(orgId, campaignId, 'execution_started', 'Campaign execution started', `${leads.length} leads`)

  const { getTenantEmailFromName } = await import('@/lib/branding/tenant-defaults')
  const fromName = await getTenantEmailFromName(db, orgId)

  let generated = 0
  let sent = 0
  const leadIds = []

  for (const lead of leads) {
    leadIds.push(lead.id)
    const subject = mergeTemplate(template.subject, lead)
    const body = mergeTemplate(template.body, lead)
    let messageStatus = smtp.ready ? 'queued' : 'generated'

    if (smtp.ready && lead.email) {
      try {
        const { sendEmail } = await import('@/lib/email/send-email')
        await sendEmail({
          fromName,
          to: lead.email,
          subject,
          html: body,
        })
        messageStatus = 'sent'
        sent++
      } catch {
        messageStatus = 'failed'
      }
    }

    await db.collection('campaign_messages').insertOne({
      id: randomUUID(),
      orgId,
      executionId,
      campaignId,
      leadId: lead.id,
      email: lead.email || '',
      status: messageStatus,
      subject,
      body,
      createdAt: now,
    })
    generated++
  }

  await db.collection('leads').updateMany(
    { orgId, id: { $in: leadIds } },
    { $set: { campaignId, updatedAt: now } }
  )

  await db.collection('campaign_executions').updateOne(
    { id: executionId, orgId },
    { $set: { status: 'completed', messagesGenerated: generated, messagesSent: sent, completedAt: now } }
  )

  await db.collection('campaigns').updateOne(
    { id: campaignId, orgId },
    {
      $set: {
        status: 'completed',
        updatedAt: now,
        lastExecutedAt: now,
        lastExecutionId: executionId,
        'audience.leadIds': leadIds,
      },
    }
  )

  await logCampaignActivity(
    orgId,
    campaignId,
    'execution_completed',
    'Campaign execution completed',
    `generated=${generated} sent=${sent} mode=${smtp.mode}`
  )

  await emitCampaignEvent(db, {
    orgId,
    type: PLATFORM_EVENTS.CAMPAIGN_COMPLETED,
    campaignId,
    payload: {
      campaignName: campaign.name,
      messagesGenerated: generated,
      messagesSent: sent,
    },
  })

  return {
    success: true,
    campaignId,
    executionId,
    totalLeads: leads.length,
    messagesGenerated: generated,
    messagesSent: sent,
    smtpMode: smtp.mode,
    leadIds,
  }
}

export async function renderCampaignTemplate(orgId, { templateId, leadId, subject, body }) {
  const db = await getDb()
  let template = { subject: subject || '', body: body || '' }
  if (templateId) {
    const stored = await db.collection('email_templates').findOne({ id: templateId, orgId }, { projection: { _id: 0 } })
    if (!stored) throw new Error('Template not found')
    template = stored
  }
  let lead = {}
  if (leadId) {
    lead = await db.collection('leads').findOne({ id: leadId, orgId }, { projection: { _id: 0 } }) || {}
  }
  return {
    success: true,
    rendered: {
      subject: mergeTemplate(template.subject, lead),
      body: mergeTemplate(template.body, lead),
    },
    leadId: lead.id || null,
  }
}

export async function seedDemoCampaignsIfEmpty(db) {
  const { DEMO_ORG_ID } = await import('@/lib/tenant')
  const count = await db.collection('campaigns').countDocuments({ orgId: DEMO_ORG_ID })
  if (count > 0) return

  const templateCount = await db.collection('email_templates').countDocuments({ orgId: DEMO_ORG_ID })
  let templateId = null
  if (templateCount === 0) {
    templateId = randomUUID()
    await db.collection('email_templates').insertOne({
      id: templateId,
      orgId: DEMO_ORG_ID,
      name: 'Demo Outreach',
      subject: 'Hello {{name}} from LeadEdge360',
      body: '<p>Hi {{name}},</p><p>We would love to help {{company}} grow in {{city}}.</p>',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  } else {
    const t = await db.collection('email_templates').findOne({ orgId: DEMO_ORG_ID })
    templateId = t?.id
  }

  const leads = await db.collection('leads').find({ orgId: DEMO_ORG_ID }).limit(5).toArray()
  const leadIds = leads.map((l) => l.id)

  const campaignId = randomUUID()
  await db.collection('campaigns').insertOne({
    id: campaignId,
    orgId: DEMO_ORG_ID,
    name: 'Demo Summer Push',
    channel: 'email',
    status: 'draft',
    audience: { leadIds, label: null, status: null },
    templateId,
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  await logCampaignActivity(DEMO_ORG_ID, campaignId, 'created', 'Demo campaign seeded')
}
