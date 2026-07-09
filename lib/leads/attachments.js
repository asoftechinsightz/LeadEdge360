import { randomUUID } from 'crypto'
import { findLeadById } from '@/lib/leads/service'

const COLLECTION = 'lead_attachments'

export async function listLeadAttachments(db, orgId, leadId) {
  const lead = await findLeadById(db, orgId, leadId)
  if (!lead) {
    const err = new Error('NOT_FOUND')
    err.detail = 'Lead not found'
    throw err
  }
  const items = await db.collection(COLLECTION)
    .find({ orgId, leadId: lead.id }, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .toArray()
  return { items }
}

export async function createLeadAttachment(db, orgId, leadId, meta, userId) {
  const lead = await findLeadById(db, orgId, leadId)
  if (!lead) {
    const err = new Error('NOT_FOUND')
    err.detail = 'Lead not found'
    throw err
  }
  const doc = {
    id: randomUUID(),
    orgId,
    leadId: lead.id,
    fileName: meta.fileName,
    url: meta.url,
    mimeType: meta.mimeType,
    size: meta.size,
    createdAt: new Date().toISOString(),
    createdBy: userId || null,
  }
  await db.collection(COLLECTION).insertOne(doc)
  return doc
}

export async function getLeadAttachment(db, orgId, leadId, attachmentId) {
  const lead = await findLeadById(db, orgId, leadId)
  if (!lead) {
    const err = new Error('NOT_FOUND')
    err.detail = 'Lead not found'
    throw err
  }
  const doc = await db.collection(COLLECTION).findOne(
    { orgId, leadId: lead.id, id: attachmentId },
    { projection: { _id: 0 } },
  )
  return doc
}

export async function deleteLeadAttachment(db, orgId, leadId, attachmentId) {
  const lead = await findLeadById(db, orgId, leadId)
  if (!lead) {
    const err = new Error('NOT_FOUND')
    err.detail = 'Lead not found'
    throw err
  }
  const result = await db.collection(COLLECTION).deleteOne({ orgId, leadId: lead.id, id: attachmentId })
  if (!result.deletedCount) {
    const err = new Error('NOT_FOUND')
    err.detail = 'Attachment not found'
    throw err
  }
  return { deleted: true }
}
