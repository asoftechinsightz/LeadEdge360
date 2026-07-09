import { randomUUID } from 'crypto'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/mongo'
import { writeAuditLog } from '@/lib/audit/service'
import { getOrgBranding } from '@/lib/branding/service'
import { createProposal, getProposalDetail } from '@/lib/proposals/service'

export function bumpDocumentVersion(current = '1.0') {
  const parts = String(current).split('.')
  const minor = parseInt(parts[1] || '0', 10) + 1
  return `${parts[0] || '1'}.${minor}`
}

export function nextDocumentNumber(prefix, seq = Date.now()) {
  return `${prefix || 'DOC'}-${seq}`
}

export async function saveDocumentVersion(db, {
  orgId,
  docType,
  docId,
  documentNumber,
  version,
  snapshot,
  userId = null,
  note = '',
}) {
  const entry = {
    id: randomUUID(),
    orgId,
    docType,
    docId: String(docId),
    documentNumber,
    version: version || '1.0',
    snapshot,
    createdBy: userId,
    note,
    createdAt: new Date().toISOString(),
  }
  await db.collection('document_versions').insertOne(entry)

  if (!['proposal', 'invoice'].includes(docType)) {
    const { emitPlatformEvent } = await import('@/lib/events/bus')
    const { PLATFORM_EVENTS } = await import('@/lib/events/types')
    await emitPlatformEvent({
      db,
      orgId,
      type: PLATFORM_EVENTS.DOCUMENT_UPLOADED,
      entity: 'document',
      entityId: String(docId),
      payload: { docType, documentNumber, leadId: snapshot?.leadId || null },
      userId,
      source: 'documents',
    })
  }

  return entry
}

export async function logDocumentAction({
  orgId,
  userId = null,
  action,
  docType,
  docId,
  detail = null,
  req = null,
}) {
  const ip = req?.headers?.get?.('x-forwarded-for')?.split(',')[0]?.trim()
    || req?.headers?.get?.('x-real-ip')
    || ''
  const ua = req?.headers?.get?.('user-agent') || ''
  return writeAuditLog({
    orgId,
    userId,
    action,
    entity: docType,
    entityId: String(docId),
    detail,
    ip,
    ua,
  })
}

export async function getDocumentHistory(orgId, docType, docId) {
  const db = await getDb()
  const id = String(docId)
  const [versions, audit] = await Promise.all([
    db.collection('document_versions')
      .find({ orgId, docType, docId: id }, { projection: { _id: 0, snapshot: 0 } })
      .sort({ createdAt: -1 })
      .limit(25)
      .toArray(),
    db.collection('audit_logs')
      .find({ orgId, entity: docType, entityId: id }, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .limit(40)
      .toArray(),
  ])
  return { versions, audit }
}

export async function duplicateProposal(orgId, proposalId, { userId = null, req = null } = {}) {
  const source = await getProposalDetail(proposalId, orgId)
  if (!source) throw new Error('Proposal not found')

  const db = await getDb()
  const branding = await getOrgBranding(db, orgId)
  const proposalNumber = nextDocumentNumber(branding.proposalPrefix || 'PROP')

  const copy = await createProposal({
    orgId,
    proposalNumber,
    opportunityId: source.opportunityId,
    leadId: source.leadId,
    clientName: source.clientName,
    company: source.company,
    clientEmail: source.clientEmail,
    clientPhone: source.clientPhone,
    clientAddress: source.clientAddress,
    subtotal: source.subtotal,
    gstPercent: source.gstPercent,
    gstAmount: source.gstAmount,
    totalAmount: source.totalAmount,
    status: 'DRAFT',
    items: source.items || [],
  })

  await db.collection('proposals').updateOne(
    { _id: copy._id, orgId },
    { $set: { version: '1.0', duplicatedFrom: String(proposalId), updatedAt: new Date() } },
  )

  const full = await getProposalDetail(copy.id, orgId)
  await saveDocumentVersion(db, {
    orgId,
    docType: 'proposal',
    docId: copy.id,
    documentNumber: full.proposalNumber,
    version: '1.0',
    snapshot: full,
    userId,
    note: `Duplicated from ${source.proposalNumber}`,
  })

  await logDocumentAction({
    orgId,
    userId,
    action: 'proposal.duplicate',
    docType: 'proposal',
    docId: copy.id,
    detail: `Duplicated from ${source.proposalNumber}`,
    req,
  })

  await logDocumentAction({
    orgId,
    userId,
    action: 'proposal.duplicated_from',
    docType: 'proposal',
    docId: proposalId,
    detail: `Copied to ${full.proposalNumber}`,
    req,
  })

  return full
}

export async function duplicateInvoice(orgId, invoiceId, { userId = null, req = null } = {}) {
  if (!ObjectId.isValid(invoiceId)) throw new Error('Invalid invoice id')

  const db = await getDb()
  const source = await db.collection('invoices').findOne({ _id: new ObjectId(invoiceId), orgId })
  if (!source) throw new Error('Invoice not found')

  const branding = await getOrgBranding(db, orgId)
  const invoiceNumber = nextDocumentNumber(branding.invoicePrefix || 'INV')

  const copy = {
    invoiceNumber,
    orgId,
    proposalId: source.proposalId || null,
    proposalNumber: source.proposalNumber || null,
    clientName: source.clientName,
    company: source.company,
    clientEmail: source.clientEmail,
    clientPhone: source.clientPhone,
    clientGstin: source.clientGstin,
    billingAddress: source.billingAddress,
    shippingAddress: source.shippingAddress,
    subtotal: source.subtotal,
    gstPercent: source.gstPercent,
    gstAmount: source.gstAmount,
    totalAmount: source.totalAmount,
    discount: source.discount || 0,
    items: source.items || [],
    status: 'UNPAID',
    amountPaid: 0,
    amountDue: source.totalAmount,
    version: '1.0',
    duplicatedFrom: String(invoiceId),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const result = await db.collection('invoices').insertOne(copy)
  const newId = String(result.insertedId)
  const full = { ...copy, _id: result.insertedId, id: newId }

  await saveDocumentVersion(db, {
    orgId,
    docType: 'invoice',
    docId: newId,
    documentNumber: full.invoiceNumber,
    version: '1.0',
    snapshot: full,
    userId,
    note: `Duplicated from ${source.invoiceNumber}`,
  })

  await logDocumentAction({
    orgId,
    userId,
    action: 'invoice.duplicate',
    docType: 'invoice',
    docId: newId,
    detail: `Duplicated from ${source.invoiceNumber}`,
    req,
  })

  return full
}

export async function snapshotProposalVersion(orgId, proposalId, { userId = null, note = 'Snapshot' } = {}) {
  const proposal = await getProposalDetail(proposalId, orgId)
  if (!proposal) return null
  const db = await getDb()
  return saveDocumentVersion(db, {
    orgId,
    docType: 'proposal',
    docId: proposalId,
    documentNumber: proposal.proposalNumber,
    version: proposal.version || '1.0',
    snapshot: proposal,
    userId,
    note,
  })
}

export async function snapshotInvoiceVersion(db, orgId, invoice, { userId = null, note = 'Snapshot' } = {}) {
  return saveDocumentVersion(db, {
    orgId,
    docType: 'invoice',
    docId: String(invoice._id),
    documentNumber: invoice.invoiceNumber,
    version: invoice.version || '1.0',
    snapshot: invoice,
    userId,
    note,
  })
}
