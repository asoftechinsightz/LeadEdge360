import { ObjectId } from 'mongodb'
import { writeAuditLog } from '@/lib/audit/service'
import { emitPlatformEvent } from '@/lib/events/bus'
import { emitLeadLifecycleEvent } from '@/lib/events/emit-helpers'
import { PLATFORM_EVENTS } from '@/lib/events/types'
import { getLeadLinkId } from '@/lib/leads/ids'

export { getLeadLinkId }

const VALID_STATUSES = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost']

export const ACTIVE_LEAD_FILTER = {
  $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
}

export function applyActiveLeadFilter(filter = {}) {
  return { ...filter, ...ACTIVE_LEAD_FILTER }
}

/** Build a Mongo filter that matches canonical `id` or legacy `_id`. */
export function buildLeadIdQuery(orgId, leadId) {
  const id = String(leadId || '').trim()
  if (!id) return applyActiveLeadFilter({ orgId, id: '__missing__' })

  const clauses = [{ id }]
  if (ObjectId.isValid(id) && String(new ObjectId(id)) === id) {
    clauses.push({ _id: new ObjectId(id) })
  }
  return {
    $and: [
      { orgId },
      { $or: clauses },
      ACTIVE_LEAD_FILTER,
    ],
  }
}

/** Ensure every lead exposed to the UI has a stable string `id`. */
export function normalizeLeadDoc(doc) {
  if (!doc) return null
  const mongoId = doc._id ? String(doc._id) : null
  const id = doc.id || mongoId
  if (!id) return null
  const { _id, ...rest } = doc
  return { ...rest, id }
}


export async function findLeadById(db, orgId, leadId, { includeDeleted = false } = {}) {
  const id = String(leadId || '').trim()
  const clauses = [{ id }]
  if (ObjectId.isValid(id) && String(new ObjectId(id)) === id) {
    clauses.push({ _id: new ObjectId(id) })
  }

  const filter = includeDeleted
    ? { orgId, $or: clauses }
    : buildLeadIdQuery(orgId, leadId)

  const raw = await db.collection('leads').findOne(filter)
  if (!raw) return null

  const lead = normalizeLeadDoc(raw)
  if (lead && !raw.id && raw._id) {
    await db.collection('leads').updateOne(
      { _id: raw._id },
      { $set: { id: lead.id, updatedAt: new Date().toISOString() } },
    )
  }
  return lead
}

export async function resolveLeadIds(db, orgId, leadId) {
  const lead = await findLeadById(db, orgId, leadId)
  if (!lead) return null
  return [...new Set([lead.id, String(leadId)])]
}

export async function getLeadDetail(db, orgId, leadId) {
  const lead = await findLeadById(db, orgId, leadId)
  if (!lead) {
    const err = new Error('NOT_FOUND')
    err.detail = { leadId, orgId }
    throw err
  }

  const leadIds = [...new Set([lead.id, String(leadId)])]

  const [timeline, notes, tasks, followups, assignments, attachments] = await Promise.all([
    db.collection('lead_timeline')
      .find({ orgId, leadId: { $in: leadIds } }, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray(),
    db.collection('lead_notes')
      .find({ orgId, leadId: { $in: leadIds } }, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .toArray(),
    db.collection('lead_tasks')
      .find({ orgId, leadId: { $in: leadIds } }, { projection: { _id: 0 } })
      .sort({ dueAt: 1 })
      .toArray(),
    db.collection('follow_ups')
      .find({ orgId, leadId: { $in: leadIds } }, { projection: { _id: 0 } })
      .sort({ dueAt: 1 })
      .toArray(),
    db.collection('lead_assignments')
      .find({ orgId, leadId: { $in: leadIds } }, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .toArray(),
    db.collection('lead_attachments')
      .find({ orgId, leadId: { $in: leadIds } }, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .toArray(),
  ])

  return { lead, timeline, notes, tasks, followups, assignments, attachments }
}

export async function softDeleteLead(db, orgId, userId, leadId, meta = {}) {
  const existing = await findLeadById(db, orgId, leadId)
  if (!existing) {
    throw new Error('NOT_FOUND')
  }
  const now = new Date().toISOString()
  await db.collection('leads').updateOne(
    buildLeadIdQuery(orgId, existing.id),
    { $set: { deletedAt: now, deletedBy: userId, updatedAt: now } },
  )
  await writeAuditLog({
    orgId,
    userId,
    action: 'lead.soft_delete',
    entity: 'lead',
    entityId: existing.id,
    ip: meta.ip,
    ua: meta.ua,
  })
  await emitPlatformEvent({
    db,
    orgId,
    type: PLATFORM_EVENTS.LEAD_DELETED,
    entity: 'lead',
    entityId: existing.id,
    userId,
    source: 'api',
  })
  return { ok: true, deletedAt: now }
}

export async function restoreLead(db, orgId, userId, leadId, meta = {}) {
  const filter = { orgId, $or: buildLeadIdQuery(orgId, leadId).$or, deletedAt: { $exists: true, $ne: null } }
  const existing = await db.collection('leads').findOne(filter)
  if (!existing) {
    throw new Error('NOT_FOUND')
  }
  const canonicalId = normalizeLeadDoc(existing)?.id || leadId
  const now = new Date().toISOString()
  await db.collection('leads').updateOne(
    { orgId, id: canonicalId },
    { $unset: { deletedAt: '', deletedBy: '' }, $set: { restoredAt: now, restoredBy: userId, updatedAt: now } },
  )
  await writeAuditLog({
    orgId,
    userId,
    action: 'lead.restore',
    entity: 'lead',
    entityId: canonicalId,
    ip: meta.ip,
    ua: meta.ua,
  })
  await emitPlatformEvent({
    db,
    orgId,
    type: PLATFORM_EVENTS.LEAD_RESTORED,
    entity: 'lead',
    entityId: canonicalId,
    userId,
    source: 'api',
  })
  return { ok: true }
}

export async function patchLead(db, orgId, userId, leadId, body, meta = {}) {
  const existing = await findLeadById(db, orgId, leadId)
  if (!existing) {
    throw new Error('NOT_FOUND')
  }

  const id = existing.id
  const update = { updatedAt: new Date().toISOString() }
  const now = new Date()

  if (body.name) update.name = body.name
  if (body.email !== undefined) update.email = body.email
  if (body.phone) update.phone = body.phone
  if (body.company !== undefined) update.company = body.company
  if (body.territory !== undefined) update.territory = body.territory
  if (body.message !== undefined) update.message = body.message
  if (body.budget !== undefined) update.budget = Number(body.budget || 0)

  if (body.status && VALID_STATUSES.includes(body.status)) {
    update.status = body.status
    if (body.status !== existing.status) {
      await db.collection('lead_timeline').insertOne({
        id: crypto.randomUUID(),
        orgId,
        leadId: id,
        type: 'status_change',
        payload: { from: existing.status, to: body.status, reason: body.reason || 'Updated via PATCH' },
        createdAt: now,
      })
      await db.collection('lead_status_history').insertOne({
        id: crypto.randomUUID(),
        orgId,
        leadId: id,
        fromStatus: existing.status,
        toStatus: body.status,
        reason: body.reason || 'Updated via PATCH',
        createdAt: now,
      })
    }
  }

  const raw = await db.collection('leads').findOneAndUpdate(
    { id, orgId },
    { $set: update },
    { returnDocument: 'after', projection: { _id: 0 } },
  )
  const updated = normalizeLeadDoc(raw?.value ?? raw)
  if (!updated) {
    throw new Error('NOT_FOUND')
  }

  const changedFields = Object.keys(update).filter((k) => k !== 'updatedAt')
  if (changedFields.length) {
    await emitLeadLifecycleEvent(db, {
      orgId,
      type: PLATFORM_EVENTS.LEAD_UPDATED,
      leadId: id,
      payload: { fields: changedFields, from: existing, to: updated },
      userId,
      source: meta.source || 'api',
    })
  }

  if (body.status && body.status !== existing.status) {
    try {
      const { handleWorkflowTrigger, WORKFLOW_TRIGGERS } = await import('@/lib/automation/workflow-engine')
      await handleWorkflowTrigger(db, orgId, WORKFLOW_TRIGGERS.STAGE_CHANGE, {
        leadId: id,
        lead: updated,
        fromStage: existing.status,
        toStage: body.status,
      })
    } catch (e) {
      console.warn('[leads] workflow trigger skipped:', e.message)
    }
    if (body.status === 'Qualified') {
      await emitLeadLifecycleEvent(db, {
        orgId,
        type: PLATFORM_EVENTS.LEAD_QUALIFIED,
        leadId: id,
        payload: { from: existing.status, to: body.status, score: updated.score },
        userId,
        source: meta.source || 'api',
      })
    }
    if (['Won', 'Proposal'].includes(body.status)) {
      await emitLeadLifecycleEvent(db, {
        orgId,
        type: PLATFORM_EVENTS.LEAD_CONVERTED,
        leadId: id,
        payload: { from: existing.status, to: body.status },
        userId,
        source: meta.source || 'api',
      })
    }
    if (body.status === 'Lost') {
      await emitLeadLifecycleEvent(db, {
        orgId,
        type: PLATFORM_EVENTS.LEAD_LOST,
        leadId: id,
        payload: { from: existing.status, to: body.status, reason: body.reason },
        userId,
        source: meta.source || 'api',
      })
    }
  }

  return { lead: updated }
}
