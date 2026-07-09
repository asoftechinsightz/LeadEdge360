import { randomUUID } from 'crypto'
import { v4 as uuid } from 'uuid'
import { getDb } from '@/lib/mongo'
import {
  LEAD_STATUS_TO_STAGE,
  STAGE_TO_LEAD_STATUS,
  STAGES,
} from './stages'
import { emitOpportunityEvent } from '@/lib/events/emit-helpers'
import { PLATFORM_EVENTS } from '@/lib/events/types'

const LEAD_STATUSES = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost']

export async function logOpportunityActivity(db, orgId, opportunityId, title, notes = '') {
  await db.collection('opportunity_activities').insertOne({
    id: randomUUID(),
    orgId,
    opportunityId,
    title,
    notes,
    createdAt: new Date().toISOString(),
  })
}

async function recordLeadStatusChange(db, orgId, leadId, fromStatus, toStatus, reason = '') {
  const now = new Date()
  await db.collection('lead_timeline').insertOne({
    id: uuid(),
    orgId,
    leadId,
    type: 'status_change',
    payload: { from: fromStatus, to: toStatus, reason },
    createdAt: now,
  })
  await db.collection('lead_status_history').insertOne({
    id: uuid(),
    orgId,
    leadId,
    fromStatus,
    toStatus,
    reason,
    createdAt: now,
  })
}

import { getTenantProductName } from '@/lib/branding/tenant-defaults'

async function syncRevenueOnWon(db, orgId, opportunity, lead) {
  const { recordForecastRevenue } = await import('@/lib/revenue/service')
  const productName = await getTenantProductName(db, orgId)
  return recordForecastRevenue(db, orgId, {
    opportunityId: opportunity.id,
    leadId: lead?.id || opportunity.leadId,
    clientName: lead?.name || opportunity.name || '',
    company: lead?.company || opportunity.company || '',
    territory: lead?.territory || opportunity.territory || null,
    product: productName,
    amount: Number(opportunity.expectedValue || lead?.budget || 0),
    status: 'FORECAST',
    source: 'opportunity_won',
  })
}

export async function ensureOpportunityForLead(db, orgId, lead) {
  if (!lead?.id) return null

  let opp = await db.collection('opportunities').findOne({ orgId, leadId: lead.id }, { projection: { _id: 0 } })
  if (opp) {
    if (!lead.opportunityId) {
      await db.collection('leads').updateOne(
        { id: lead.id, orgId },
        { $set: { opportunityId: opp.id, updatedAt: new Date().toISOString() } }
      )
    }
    return opp
  }

  const stage = LEAD_STATUS_TO_STAGE[lead.status] || 'NEW'
  opp = {
    id: randomUUID(),
    orgId,
    leadId: lead.id,
    name: lead.name,
    company: lead.company || lead.name,
    owner: lead.assignedTo || '',
    stage,
    leadStatus: lead.status,
    expectedValue: Number(lead.budget || 0),
    probability: STAGES[stage] ?? 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await db.collection('opportunities').insertOne(opp)
  await db.collection('leads').updateOne(
    { id: lead.id, orgId },
    { $set: { opportunityId: opp.id, updatedAt: new Date().toISOString() } }
  )
  await logOpportunityActivity(db, orgId, opp.id, 'Opportunity created', `Auto-linked to lead ${lead.name}`)
  await emitOpportunityEvent(db, {
    orgId,
    type: PLATFORM_EVENTS.OPPORTUNITY_CREATED,
    opportunityId: opp.id,
    payload: { name: opp.name, leadId: lead.id, amount: opp.expectedValue, stage: opp.stage },
  })
  return opp
}

export async function listOpportunities(orgId, { status, stage } = {}) {
  const db = await getDb()
  const filter = { orgId }
  if (stage) filter.stage = stage
  if (status) filter.leadStatus = status

  const items = await db.collection('opportunities')
    .find(filter, { projection: { _id: 0 } })
    .sort({ updatedAt: -1 })
    .toArray()

  return items
}

export async function getOpportunity(orgId, id) {
  const db = await getDb()
  const opp = await db.collection('opportunities').findOne({ orgId, id }, { projection: { _id: 0 } })
  if (!opp) return null

  const activities = await db.collection('opportunity_activities')
    .find({ orgId, opportunityId: id }, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray()

  let lead = null
  if (opp.leadId) {
    lead = await db.collection('leads').findOne({ orgId, id: opp.leadId }, { projection: { _id: 0 } })
  }

  return { opportunity: opp, activities, lead }
}

export async function createOpportunityRecord({ orgId, leadId, company, name, owner, expectedValue = 0 }) {
  const db = await getDb()

  if (leadId) {
    const lead = await db.collection('leads').findOne({ orgId, id: leadId }, { projection: { _id: 0 } })
    if (!lead) throw new Error('Lead not found')
    return ensureOpportunityForLead(db, orgId, lead)
  }

  const existing = await db.collection('opportunities').findOne({ orgId, company, name: name || company })
  if (existing) return existing

  const item = {
    id: randomUUID(),
    orgId,
    leadId: leadId || null,
    name: name || company,
    company: company || name,
    owner: owner || '',
    stage: 'NEW',
    leadStatus: 'New',
    expectedValue: Number(expectedValue || 0),
    probability: STAGES.NEW,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await db.collection('opportunities').insertOne(item)
  await logOpportunityActivity(db, orgId, item.id, 'Opportunity created', 'Manual create')
  await emitOpportunityEvent(db, {
    orgId,
    type: PLATFORM_EVENTS.OPPORTUNITY_CREATED,
    opportunityId: item.id,
    payload: {
      name: item.name,
      leadId: item.leadId,
      amount: item.expectedValue,
      stage: item.stage,
    },
  })
  return item
}

export async function updateOpportunityRecord(orgId, id, patch) {
  const db = await getDb()
  const existing = await db.collection('opportunities').findOne({ orgId, id }, { projection: { _id: 0 } })
  if (!existing) throw new Error('Opportunity not found')

  const update = { updatedAt: new Date().toISOString() }
  if (patch.company !== undefined) update.company = patch.company
  if (patch.name !== undefined) update.name = patch.name
  if (patch.owner !== undefined) update.owner = patch.owner
  if (patch.expectedValue !== undefined) update.expectedValue = Number(patch.expectedValue || 0)
  if (patch.stage && STAGES[patch.stage] !== undefined) {
    update.stage = patch.stage
    update.probability = STAGES[patch.stage]
    update.leadStatus = STAGE_TO_LEAD_STATUS[patch.stage] || existing.leadStatus
  }

  await db.collection('opportunities').updateOne({ orgId, id }, { $set: update })
  await logOpportunityActivity(db, orgId, id, 'Opportunity updated', JSON.stringify(update))

  const updated = await db.collection('opportunities').findOne({ orgId, id }, { projection: { _id: 0 } })

  if (patch.stage && patch.stage !== existing.stage) {
    await emitOpportunityEvent(db, {
      orgId,
      type: PLATFORM_EVENTS.OPPORTUNITY_STAGE_CHANGED,
      opportunityId: id,
      payload: { from: existing.stage, to: patch.stage, opportunityId: id },
    })
    if (patch.stage === 'WON') {
      await emitOpportunityEvent(db, {
        orgId,
        type: PLATFORM_EVENTS.OPPORTUNITY_WON,
        opportunityId: id,
        payload: { amount: updated.expectedValue, name: updated.name },
      })
    }
    if (patch.stage === 'LOST') {
      await emitOpportunityEvent(db, {
        orgId,
        type: PLATFORM_EVENTS.OPPORTUNITY_LOST,
        opportunityId: id,
        payload: { name: updated.name },
      })
    }
  }

  return updated
}

export async function deleteOpportunityRecord(orgId, id) {
  const db = await getDb()
  const existing = await db.collection('opportunities').findOne({ orgId, id })
  if (!existing) throw new Error('Opportunity not found')

  await db.collection('opportunities').deleteOne({ orgId, id })
  await db.collection('opportunity_activities').deleteMany({ orgId, opportunityId: id })

  if (existing.leadId) {
    await db.collection('leads').updateOne(
      { orgId, id: existing.leadId },
      { $unset: { opportunityId: '' }, $set: { updatedAt: new Date().toISOString() } }
    )
  }

  return { ok: true }
}

export async function getPipelineItems(orgId) {
  const db = await getDb()
  const leads = await db.collection('leads')
    .find({ orgId, status: { $ne: 'New' } }, { projection: { _id: 0 } })
    .sort({ score: -1, updatedAt: -1 })
    .toArray()

  const items = []
  for (const lead of leads) {
    const opp = await ensureOpportunityForLead(db, orgId, lead)
    items.push({
      id: lead.id,
      opportunityId: opp?.id,
      name: lead.name,
      company: lead.company,
      phone: lead.phone,
      status: lead.status,
      label: lead.label,
      budget: lead.budget,
      expectedValue: opp?.expectedValue ?? lead.budget,
      stage: opp?.stage,
      probability: opp?.probability,
      owner: opp?.owner || lead.assignedTo,
    })
  }

  return items
}

export async function movePipelineStage(orgId, leadId, toStatus, { reason = '' } = {}) {
  if (!LEAD_STATUSES.includes(toStatus)) {
    throw new Error('Invalid status')
  }

  const db = await getDb()
  const lead = await db.collection('leads').findOne({ orgId, id: leadId }, { projection: { _id: 0 } })
  if (!lead) throw new Error('Lead not found')

  const fromStatus = lead.status || 'New'
  const opp = await ensureOpportunityForLead(db, orgId, lead)
  const toStage = LEAD_STATUS_TO_STAGE[toStatus] || 'NEW'
  const now = new Date().toISOString()

  await db.collection('leads').updateOne(
    { orgId, id: leadId },
    { $set: { status: toStatus, updatedAt: now } }
  )

  if (fromStatus !== toStatus) {
    await recordLeadStatusChange(db, orgId, leadId, fromStatus, toStatus, reason)
  }

  await db.collection('opportunities').updateOne(
    { orgId, id: opp.id },
    {
      $set: {
        stage: toStage,
        leadStatus: toStatus,
        probability: STAGES[toStage] ?? opp.probability,
        expectedValue: Number(opp.expectedValue || lead.budget || 0),
        updatedAt: now,
      },
    }
  )

  const updatedOpp = await db.collection('opportunities').findOne({ orgId, id: opp.id }, { projection: { _id: 0 } })
  await logOpportunityActivity(
    db,
    orgId,
    opp.id,
    `Stage moved to ${toStatus}`,
    reason || `Pipeline drag: ${fromStatus} → ${toStatus}`
  )

  if (fromStatus !== toStatus) {
    await emitOpportunityEvent(db, {
      orgId,
      type: PLATFORM_EVENTS.OPPORTUNITY_STAGE_CHANGED,
      opportunityId: opp.id,
      payload: { from: fromStatus, to: toStatus, leadId, opportunityId: opp.id },
    })
    if (toStatus === 'Won') {
      await emitOpportunityEvent(db, {
        orgId,
        type: PLATFORM_EVENTS.OPPORTUNITY_WON,
        opportunityId: opp.id,
        payload: { amount: updatedOpp.expectedValue, leadId, name: updatedOpp.name },
      })
    }
    if (toStatus === 'Lost') {
      await emitOpportunityEvent(db, {
        orgId,
        type: PLATFORM_EVENTS.OPPORTUNITY_LOST,
        opportunityId: opp.id,
        payload: { leadId, name: updatedOpp.name },
      })
    }
  }

  let revenue = null
  if (toStatus === 'Won') {
    revenue = await syncRevenueOnWon(db, orgId, updatedOpp, { ...lead, status: toStatus })
  }

  return {
    lead: { ...lead, status: toStatus, opportunityId: opp.id },
    opportunity: updatedOpp,
    revenue,
  }
}

export async function getOpportunityDashboard(orgId) {
  const db = await getDb()
  const opportunities = db.collection('opportunities')
  const filter = { orgId }

  const [total, won, lost, pipelineValue] = await Promise.all([
    opportunities.countDocuments(filter),
    opportunities.countDocuments({ ...filter, stage: 'WON' }),
    opportunities.countDocuments({ ...filter, stage: 'LOST' }),
    opportunities
      .aggregate([
        { $match: { ...filter, stage: { $nin: ['WON', 'LOST'] } } },
        { $group: { _id: null, value: { $sum: '$expectedValue' } } },
      ])
      .toArray(),
  ])

  const byStage = await opportunities
    .aggregate([
      { $match: filter },
      { $group: { _id: '$stage', count: { $sum: 1 }, value: { $sum: '$expectedValue' } } },
      { $sort: { _id: 1 } },
    ])
    .toArray()

  return {
    total,
    won,
    lost,
    pipelineValue: pipelineValue[0]?.value || 0,
    byStage,
  }
}

export async function seedDemoOpportunitiesIfEmpty(db) {
  const { DEMO_ORG_ID } = await import('@/lib/tenant')
  const count = await db.collection('opportunities').countDocuments({ orgId: DEMO_ORG_ID })
  if (count > 0) return

  const leads = await db.collection('leads')
    .find({ orgId: DEMO_ORG_ID, status: { $ne: 'New' } })
    .toArray()

  for (const lead of leads) {
    await ensureOpportunityForLead(db, DEMO_ORG_ID, lead)
  }
}
