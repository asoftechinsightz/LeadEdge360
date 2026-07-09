import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/mongo'
import { DEMO_ORG_ID } from '@/lib/tenant'
import { saveDocumentVersion } from '@/lib/documents/service'
import { getTenantProductName } from '@/lib/branding/tenant-defaults'
import { emitPlatformEvent } from '@/lib/events/bus'
import { emitProposalEvent, emitInvoiceEvent } from '@/lib/events/emit-helpers'
import { PLATFORM_EVENTS } from '@/lib/events/types'

const ALLOWED_UPDATE_FIELDS = [
  'clientName', 'company', 'subtotal', 'gstPercent', 'gstAmount', 'totalAmount', 'status', 'opportunityId', 'leadId', 'version',
]

function toProposalId(proposal) {
  return String(proposal._id)
}

export async function getProposalItems(db, proposalId, orgId = null) {
  const filter = { proposalId: String(proposalId) }
  if (orgId) filter.orgId = orgId
  return db.collection('proposal_items')
    .find(filter, { projection: { _id: 0 } })
    .toArray()
}

export async function createProposal(payload) {
  const db = await getDb()

  const proposal = {
    proposalNumber: payload.proposalNumber || `PROP-${Date.now()}`,
    orgId: payload.orgId,
    opportunityId: payload.opportunityId || null,
    leadId: payload.leadId || null,
    clientName: payload.clientName || '',
    company: payload.company || '',
    subtotal: payload.subtotal || 0,
    gstPercent: payload.gstPercent ?? 18,
    gstAmount: payload.gstAmount || 0,
    totalAmount: payload.totalAmount || 0,
    status: payload.status || 'DRAFT',
    version: payload.version || '1.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const result = await db.collection('proposals').insertOne(proposal)
  const proposalId = result.insertedId.toString()

  if (payload.items?.length) {
    await db.collection('proposal_items').insertMany(
      payload.items.map((i) => ({
        proposalId,
        orgId: payload.orgId,
        name: i.name,
        description: i.description || '',
        qty: i.qty ?? 1,
        rate: i.rate ?? 0,
        amount: i.amount ?? 0,
        createdAt: new Date(),
      }))
    )
  }

  const full = await getProposalDetail(proposalId, payload.orgId)
  await saveDocumentVersion(db, {
    orgId: payload.orgId,
    docType: 'proposal',
    docId: proposalId,
    documentNumber: full.proposalNumber,
    version: full.version || '1.0',
    snapshot: full,
    note: 'Initial version',
  })

  await emitProposalEvent(db, {
    orgId: payload.orgId,
    type: PLATFORM_EVENTS.PROPOSAL_CREATED,
    proposalId,
    payload: {
      proposalNumber: full.proposalNumber,
      clientName: full.clientName,
      leadId: full.leadId,
      totalAmount: full.totalAmount,
    },
  })

  return {
    ...proposal,
    id: proposalId,
    _id: result.insertedId,
  }
}

export async function listProposals(orgId) {
  const db = await getDb()
  const proposals = await db.collection('proposals')
    .find({ orgId })
    .sort({ createdAt: -1 })
    .toArray()

  return proposals.map((p) => ({
    ...p,
    id: toProposalId(p),
  }))
}

export async function getProposalDetail(proposalId, orgId) {
  if (!ObjectId.isValid(proposalId)) return null

  const db = await getDb()
  const proposal = await db.collection('proposals').findOne({
    _id: new ObjectId(proposalId),
    orgId,
  })

  if (!proposal) return null

  const items = await getProposalItems(db, proposalId, orgId)
  return {
    ...proposal,
    id: toProposalId(proposal),
    items,
  }
}

export async function updateProposal(orgId, proposalId, payload = {}, { userId = null } = {}) {
  if (!ObjectId.isValid(proposalId)) throw new Error('Invalid proposal id')

  const db = await getDb()
  const current = await getProposalDetail(proposalId, orgId)
  if (!current) throw new Error('Proposal not found')

  const hasFinancialChange = ['subtotal', 'gstPercent', 'gstAmount', 'totalAmount', 'status']
    .some((k) => payload[k] !== undefined && payload[k] !== current[k])

  if (hasFinancialChange) {
    await saveDocumentVersion(db, {
      orgId,
      docType: 'proposal',
      docId: proposalId,
      documentNumber: current.proposalNumber,
      version: current.version || '1.0',
      snapshot: current,
      userId,
      note: 'Before update',
    })
    payload.version = bumpDocumentVersion(current.version || '1.0')
  }

  const update = { updatedAt: new Date() }
  for (const key of ALLOWED_UPDATE_FIELDS) {
    if (payload[key] !== undefined) update[key] = payload[key]
  }

  const result = await db.collection('proposals').updateOne(
    { _id: new ObjectId(proposalId), orgId },
    { $set: update }
  )

  if (!result.matchedCount) throw new Error('Proposal not found')

  const updated = await getProposalDetail(proposalId, orgId)
  if (payload.status && payload.status !== current.status) {
    const eventMap = {
      SENT: PLATFORM_EVENTS.PROPOSAL_SENT,
      ACCEPTED: PLATFORM_EVENTS.PROPOSAL_APPROVED,
      REJECTED: PLATFORM_EVENTS.PROPOSAL_REJECTED,
    }
    const eventType = eventMap[payload.status]
    if (eventType) {
      await emitProposalEvent(db, {
        orgId,
        type: eventType,
        proposalId,
        payload: {
          proposalNumber: updated.proposalNumber,
          clientName: updated.clientName,
          totalAmount: updated.totalAmount,
          from: current.status,
          to: payload.status,
        },
        userId,
      })
    }
  }

  return updated
}

export async function deleteProposal(orgId, proposalId) {
  if (!ObjectId.isValid(proposalId)) throw new Error('Invalid proposal id')

  const db = await getDb()
  const result = await db.collection('proposals').deleteOne({
    _id: new ObjectId(proposalId),
    orgId,
  })

  if (result.deletedCount) {
    await db.collection('proposal_items').deleteMany({ proposalId: String(proposalId), orgId })
  }

  return { success: true, deleted: result.deletedCount > 0 }
}

export async function markProposalWon(orgId, proposalId) {
  const db = await getDb()
  const proposal = await getProposalDetail(proposalId, orgId)
  if (!proposal) throw new Error('Proposal not found')

  await db.collection('proposals').updateOne(
    { _id: new ObjectId(proposalId), orgId },
    { $set: { status: 'ACCEPTED', updatedAt: new Date() } }
  )

  if (proposal.opportunityId) {
    await db.collection('opportunities').updateOne(
      { id: proposal.opportunityId, orgId },
      { $set: { stage: 'WON', updatedAt: new Date().toISOString() } }
    )
  }

  const { recordForecastRevenue } = await import('@/lib/revenue/service')
  const productName = await getTenantProductName(db, orgId)
  await recordForecastRevenue(db, orgId, {
    proposalId: proposal.id,
    opportunityId: proposal.opportunityId || null,
    leadId: proposal.leadId || null,
    clientName: proposal.clientName || '',
    company: proposal.company || '',
    product: productName,
    amount: proposal.totalAmount || 0,
    status: 'FORECAST',
    source: 'proposal_accepted',
  })

  await emitPlatformEvent({
    db,
    orgId,
    type: PLATFORM_EVENTS.PROPOSAL_WON,
    entity: 'proposal',
    entityId: proposal.id,
    payload: {
      totalAmount: proposal.totalAmount,
      clientName: proposal.clientName,
      proposalNumber: proposal.proposalNumber,
      company: proposal.company,
      leadId: proposal.leadId,
    },
    source: 'proposals',
  })

  await emitProposalEvent(db, {
    orgId,
    type: PLATFORM_EVENTS.PROPOSAL_APPROVED,
    proposalId: proposal.id,
    payload: {
      proposalNumber: proposal.proposalNumber,
      totalAmount: proposal.totalAmount,
      clientName: proposal.clientName,
    },
  })

  return { success: true, proposalId: proposal.id, status: 'ACCEPTED', revenueRecognized: false }
}

export async function convertProposalToInvoice(orgId, proposalId) {
  const proposal = await getProposalDetail(proposalId, orgId)
  if (!proposal) throw new Error('Proposal not found')

  const db = await getDb()
  const existing = await db.collection('invoices').findOne({
    orgId,
    proposalId: proposal._id,
  })

  if (existing) {
    return {
      success: true,
      invoiceId: existing._id,
      invoiceNumber: existing.invoiceNumber,
      existing: true,
    }
  }

  const invoice = {
    invoiceNumber: `INV-${Date.now()}`,
    orgId,
    proposalId: proposal._id,
    proposalNumber: proposal.proposalNumber,
    clientName: proposal.clientName,
    company: proposal.company,
    subtotal: proposal.subtotal,
    gstPercent: proposal.gstPercent,
    gstAmount: proposal.gstAmount,
    totalAmount: proposal.totalAmount,
    items: Array.isArray(proposal.items) ? proposal.items : [],
    status: 'UNPAID',
    version: '1.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const result = await db.collection('invoices').insertOne(invoice)
  const invoiceId = String(result.insertedId)
  await saveDocumentVersion(db, {
    orgId,
    docType: 'invoice',
    docId: invoiceId,
    documentNumber: invoice.invoiceNumber,
    version: '1.0',
    snapshot: { ...invoice, _id: result.insertedId },
    note: `Created from proposal ${proposal.proposalNumber}`,
  })

  await emitPlatformEvent({
    db,
    orgId,
    type: PLATFORM_EVENTS.PROPOSAL_CONVERTED,
    entity: 'invoice',
    entityId: invoiceId,
    payload: {
      proposalId: proposal.id,
      proposalNumber: proposal.proposalNumber,
      invoiceNumber: invoice.invoiceNumber,
      clientName: proposal.clientName,
      company: proposal.company,
      leadId: proposal.leadId,
    },
    source: 'proposals',
  })

  await emitInvoiceEvent(db, {
    orgId,
    type: PLATFORM_EVENTS.INVOICE_CREATED,
    invoiceId,
    payload: {
      invoiceNumber: invoice.invoiceNumber,
      clientName: proposal.clientName,
      totalAmount: invoice.totalAmount,
      proposalId: proposal.id,
    },
  })

  return {
    success: true,
    invoiceId: result.insertedId,
    invoiceNumber: invoice.invoiceNumber,
    existing: false,
  }
}

export async function createProposalFromOpportunity(orgId, opportunityId) {
  const db = await getDb()
  const opp = await db.collection('opportunities').findOne({ id: opportunityId, orgId })
  if (!opp) throw new Error('Opportunity not found')

  const amount = opp.amount || 0
  const gstAmount = Math.round(amount * 0.18)
  return createProposal({
    orgId,
    opportunityId: opp.id,
    leadId: opp.leadId || null,
    clientName: opp.clientName || opp.name || '',
    company: opp.company || '',
    subtotal: amount,
    gstPercent: 18,
    gstAmount,
    totalAmount: amount + gstAmount,
  })
}

export async function autoGenerateProposalFromLead(orgId, leadId) {
  const db = await getDb()
  const lead = await db.collection('leads').findOne({ orgId, id: leadId })
  if (!lead) throw new Error('Lead not found')

  const template = await db.collection('proposal_templates').findOne({ orgId })
  const catalog = await db.collection('catalogs').find({ orgId }).limit(5).toArray()

  const productName = await getTenantProductName(db, orgId)
  const items = catalog.length
    ? catalog.map((item) => ({
        name: item.name,
        qty: 1,
        rate: item.price || 0,
        amount: item.price || 0,
      }))
    : [{ name: `${productName} Subscription`, qty: 1, rate: lead.budget || 50000, amount: lead.budget || 50000 }]

  const subtotal = items.reduce((a, b) => a + b.amount, 0)
  const gstAmount = Math.round(subtotal * 0.18)

  return createProposal({
    orgId,
    leadId: lead.id,
    clientName: lead.name,
    company: lead.company,
    items,
    subtotal,
    gstAmount,
    totalAmount: subtotal + gstAmount,
    templateName: template?.name,
  })
}

export async function seedDemoSubscriptionIfMissing(db) {
  const existing = await db.collection('subscriptions').findOne({ orgId: DEMO_ORG_ID, status: 'ACTIVE' })
  if (existing) return

  await db.collection('subscriptions').insertOne({
    orgId: DEMO_ORG_ID,
    planCode: 'BUSINESS_GROWTH',
    status: 'ACTIVE',
    activatedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  })
}

export async function seedDemoProposalsIfEmpty(db) {
  await seedDemoSubscriptionIfMissing(db)

  const count = await db.collection('proposals').countDocuments({ orgId: DEMO_ORG_ID })
  if (count > 0) return

  const templateCount = await db.collection('proposal_templates').countDocuments({ orgId: DEMO_ORG_ID })
  if (templateCount === 0) {
    await db.collection('proposal_templates').insertOne({
      orgId: DEMO_ORG_ID,
      name: 'Standard Proposal',
      body: 'Thank you for your interest in LeadEdge360.',
      createdAt: new Date(),
    })
  }

  const catalogCount = await db.collection('catalogs').countDocuments({ orgId: DEMO_ORG_ID })
  if (catalogCount === 0) {
    await db.collection('catalogs').insertMany([
      { orgId: DEMO_ORG_ID, name: 'LeadEdge360 Starter', price: 49999 },
      { orgId: DEMO_ORG_ID, name: 'Implementation', price: 25000 },
    ])
  }

  const lead = await db.collection('leads').findOne({ orgId: DEMO_ORG_ID })
  if (lead) {
    await autoGenerateProposalFromLead(DEMO_ORG_ID, lead.id)
  }
}
