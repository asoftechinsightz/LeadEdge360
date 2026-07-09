import { randomUUID } from 'crypto'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/mongo'
import { DEMO_ORG_ID } from '@/lib/tenant'
import { getTenantProductName } from '@/lib/branding/tenant-defaults'

/** Recognized revenue — cash collected */
export const RECOGNIZED_STATUSES = ['PAID']
/** Payment initiated, not yet recognized */
export const PENDING_STATUSES = ['PENDING']
/** Pipeline / accepted deals without payment */
export const FORECAST_STATUSES = ['FORECAST', 'WON', 'ACCEPTED']
/** Adjustments */
export const REFUND_STATUSES = ['REFUNDED']
export const VOID_STATUSES = ['CANCELLED', 'VOID']

const PROPOSAL_PLANS = ['GROWTH', 'PRO', 'BUSINESS_GROWTH', 'ENTERPRISE']

export { PROPOSAL_PLANS as REVENUE_PLANS }

function periodStart(period) {
  const now = new Date()
  if (period === 'month') return new Date(now.getFullYear(), now.getMonth(), 1)
  if (period === 'quarter') {
    const q = Math.floor(now.getMonth() / 3) * 3
    return new Date(now.getFullYear(), q, 1)
  }
  if (period === 'year') return new Date(now.getFullYear(), 0, 1)
  return null
}

function signedAmount(doc) {
  const amt = Number(doc.amount || 0)
  if (REFUND_STATUSES.includes(doc.status)) return -Math.abs(amt)
  return amt
}

function isRecognized(doc) {
  return RECOGNIZED_STATUSES.includes(doc.status)
}

function isForecast(doc) {
  return FORECAST_STATUSES.includes(doc.status)
}

function isPending(doc) {
  return PENDING_STATUSES.includes(doc.status)
}

export async function recordForecastRevenue(db, orgId, payload) {
  const filter = {
    orgId,
    source: payload.source,
    ...(payload.opportunityId ? { opportunityId: payload.opportunityId } : {}),
    ...(payload.proposalId ? { proposalId: payload.proposalId } : {}),
  }
  const existing = await db.collection('revenue').findOne(filter)
  if (existing) return existing

  const doc = {
    id: randomUUID(),
    orgId,
    ...payload,
    status: payload.status || 'FORECAST',
    createdAt: payload.createdAt || new Date(),
  }
  await db.collection('revenue').insertOne(doc)
  return doc
}

export async function applyInvoicePayment(orgId, invoice, { amount, paymentId = null } = {}) {
  const db = await getDb()
  const payAmount = Number(amount ?? invoice.totalAmount ?? 0)
  if (payAmount <= 0) {
    return { success: false, error: 'VALIDATION_FAILED', message: 'Payment amount must be greater than zero' }
  }

  if (['DRAFT', 'CANCELLED', 'VOID'].includes(invoice.status)) {
    return { success: true, recognized: false, reason: 'invalid_invoice_status' }
  }

  const total = Number(invoice.totalAmount || 0)
  const currentPaid = Number(invoice.amountPaid || 0)
  const newPaid = Math.min(currentPaid + payAmount, total || currentPaid + payAmount)
  const remaining = Math.max(0, total - newPaid)
  const newStatus = total > 0 && newPaid >= total ? 'PAID' : (newPaid > 0 ? 'PARTIAL' : invoice.status)

  const doc = {
    id: randomUUID(),
    orgId,
    invoiceId: String(invoice._id),
    invoiceNumber: invoice.invoiceNumber,
    proposalId: invoice.proposalId ? String(invoice.proposalId) : null,
    clientName: invoice.clientName || '',
    company: invoice.company || '',
    product: invoice.product || (await getTenantProductName(db, orgId)),
    territory: invoice.territory || null,
    source: 'invoice_payment',
    paymentId,
    amount: payAmount,
    status: newStatus === 'PAID' ? 'PAID' : 'PENDING',
    createdAt: new Date(),
  }

  await db.collection('revenue').insertOne(doc)
  await db.collection('invoices').updateOne(
    { _id: invoice._id, orgId },
    {
      $set: {
        amountPaid: newPaid,
        amountDue: remaining,
        status: newStatus,
        ...(newStatus === 'PAID' ? { paidAt: new Date() } : {}),
        updatedAt: new Date(),
      },
    },
  )

  return {
    success: true,
    recognized: true,
    revenue: doc,
    amountPaid: newPaid,
    amountDue: remaining,
    status: newStatus,
  }
}

export async function recognizeInvoicePayment(orgId, invoice, { paymentId = null, amount = null } = {}) {
  return applyInvoicePayment(orgId, invoice, { paymentId, amount: amount ?? invoice.totalAmount })
}

export async function recordPendingPayment(orgId, invoice) {
  const db = await getDb()
  const invoiceId = String(invoice._id)
  const existing = await db.collection('revenue').findOne({ orgId, invoiceId, status: 'PENDING' })
  if (existing) return existing

  const doc = {
    id: randomUUID(),
    orgId,
    invoiceId,
    invoiceNumber: invoice.invoiceNumber,
    clientName: invoice.clientName || '',
    amount: invoice.totalAmount || 0,
    status: 'PENDING',
    source: 'invoice_payment',
    createdAt: new Date(),
  }
  await db.collection('revenue').insertOne(doc)
  return doc
}

export async function recordRefund(orgId, { invoiceId, amount, reason = '' }) {
  const db = await getDb()
  const doc = {
    id: randomUUID(),
    orgId,
    invoiceId,
    amount: Math.abs(Number(amount)),
    status: 'REFUNDED',
    source: 'refund',
    reason,
    createdAt: new Date(),
  }
  await db.collection('revenue').insertOne(doc)
  return doc
}

export async function getRevenueRecords(orgId, filter = {}) {
  const db = await getDb()
  return db.collection('revenue').find({ orgId, ...filter }).toArray()
}

export async function getRevenueSummary(orgId, { period = null } = {}) {
  const db = await getDb()
  const match = { orgId }
  const start = period ? periodStart(period) : null
  if (start) match.createdAt = { $gte: start }

  const rows = await db.collection('revenue').find(match).toArray()

  let recognizedRevenue = 0
  let pendingRevenue = 0
  let forecastRevenue = 0
  let refundTotal = 0

  for (const row of rows) {
    if (isRecognized(row)) recognizedRevenue += signedAmount(row)
    else if (isPending(row)) pendingRevenue += signedAmount(row)
    else if (isForecast(row)) forecastRevenue += signedAmount(row)
    else if (REFUND_STATUSES.includes(row.status)) refundTotal += Math.abs(Number(row.amount || 0))
  }

  const netRevenue = recognizedRevenue

  return {
    success: true,
    totalRevenue: netRevenue,
    recognizedRevenue: netRevenue,
    paidRevenue: netRevenue,
    pendingRevenue,
    forecastRevenue,
    refundTotal,
    recordCount: rows.length,
    period: period || 'all',
  }
}

export async function getRevenueDashboard(orgId) {
  const db = await getDb()
  const [summary, proposals, invoices, payments] = await Promise.all([
    getRevenueSummary(orgId),
    db.collection('proposals').countDocuments({ orgId }),
    db.collection('invoices').countDocuments({ orgId }),
    db.collection('payments').countDocuments({ orgId }),
  ])

  const rows = await db.collection('revenue').find({ orgId }).toArray()
  const recognized = rows.filter(isRecognized)
  const averageDealSize = recognized.length
    ? Math.round(recognized.reduce((s, r) => s + signedAmount(r), 0) / recognized.length)
    : 0

  const monthly = await getRevenueSummary(orgId, { period: 'month' })
  const quarterly = await getRevenueSummary(orgId, { period: 'quarter' })
  const annual = await getRevenueSummary(orgId, { period: 'year' })

  return {
    success: true,
    ...summary,
    monthlyRevenue: monthly.totalRevenue,
    quarterlyRevenue: quarterly.totalRevenue,
    annualRevenue: annual.totalRevenue,
    proposalCount: proposals,
    invoiceCount: invoices,
    paymentCount: payments,
    averageDealSize,
  }
}

export async function getRevenueTrends(orgId, { months = 6 } = {}) {
  const db = await getDb()
  const start = new Date()
  start.setMonth(start.getMonth() - (months - 1))
  start.setDate(1)
  start.setHours(0, 0, 0, 0)

  const rows = await db.collection('revenue').aggregate([
    { $match: { orgId, status: 'PAID', createdAt: { $gte: start } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        amount: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]).toArray()

  return { success: true, trends: rows.map((r) => ({ month: r._id, amount: r.amount, count: r.count })) }
}

async function groupByField(orgId, field) {
  const db = await getDb()
  const rows = await db.collection('revenue').aggregate([
    { $match: { orgId, status: 'PAID' } },
    {
      $group: {
        _id: `$${field}`,
        amount: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { amount: -1 } },
    { $limit: 20 },
  ]).toArray()

  return rows.map((r) => ({ name: r._id || 'Unknown', amount: r.amount, count: r.count }))
}

export async function getRevenueByProduct(orgId) {
  const items = await groupByField(orgId, 'product')
  return { success: true, items }
}

export async function getRevenueByCustomer(orgId) {
  const items = await groupByField(orgId, 'clientName')
  return { success: true, items }
}

export async function getRevenueBySource(orgId) {
  const items = await groupByField(orgId, 'source')
  return { success: true, items }
}

export async function getRevenueByTerritory(orgId) {
  const items = await groupByField(orgId, 'territory')
  return { success: true, items }
}

export async function getRevenueForecast(orgId) {
  const db = await getDb()

  const [forecastRows, openOpps, openProposals] = await Promise.all([
    db.collection('revenue').find({ orgId, status: { $in: FORECAST_STATUSES } }).toArray(),
    db.collection('opportunities').find({ orgId, stage: { $nin: ['WON', 'LOST'] } }).toArray(),
    db.collection('proposals').find({ orgId, status: { $in: ['DRAFT', 'SENT'] } }).toArray(),
  ])

  const pipelineForecast = openOpps.reduce((s, o) => s + Number(o.expectedValue || o.amount || 0), 0)
  const weightedForecast = openOpps.reduce((s, o) => {
    const prob = Number(o.probability || 50) / 100
    return s + Number(o.expectedValue || o.amount || 0) * prob
  }, 0)
  const proposalForecast = openProposals.reduce((s, p) => s + Number(p.totalAmount || 0), 0)
  const recordedForecast = forecastRows.reduce((s, r) => s + Number(r.amount || 0), 0)

  return {
    success: true,
    pipelineForecast,
    weightedForecast: Math.round(weightedForecast),
    proposalForecast,
    recordedForecast,
    totalForecast: Math.round(recordedForecast + weightedForecast * 0.5 + proposalForecast * 0.3),
  }
}

export async function getRevenueMetrics(orgId) {
  const db = await getDb()
  const summary = await getRevenueSummary(orgId)
  const trends = await getRevenueTrends(orgId, { months: 2 })

  const current = trends.trends.at(-1)?.amount || 0
  const previous = trends.trends.at(-2)?.amount || 0
  const growthPercent = previous
    ? Number((((current - previous) / previous) * 100).toFixed(2))
    : 0

  const recognized = await db.collection('revenue').find({ orgId, status: 'PAID' }).toArray()
  const customers = new Set(recognized.map((r) => r.clientName).filter(Boolean))
  const clv = customers.size
    ? Math.round(recognized.reduce((s, r) => s + signedAmount(r), 0) / customers.size)
    : 0

  const wonOpps = await db.collection('opportunities').countDocuments({ orgId, stage: 'WON' })
  const totalOpps = await db.collection('opportunities').countDocuments({ orgId })
  const winRate = totalOpps ? Number(((wonOpps / totalOpps) * 100).toFixed(2)) : 0

  const subs = await db.collection('subscriptions').find({ orgId, status: 'ACTIVE' }).toArray()
  const mrr = subs.reduce((s, sub) => {
    const amt = Number(sub.amount || sub.monthlyAmount || 0)
    if (sub.billingCycle === 'annual') return s + amt / 12
    if (sub.billingCycle === 'quarterly') return s + amt / 3
    return s + amt
  }, 0)

  return {
    success: true,
    ...summary,
    growthPercent,
    customerLifetimeValue: clv,
    averageDealSize: summary.recordCount
      ? Math.round(summary.totalRevenue / Math.max(recognized.length, 1))
      : 0,
    winRate,
    mrr: Math.round(mrr),
    arr: Math.round(mrr * 12),
    activeSubscriptions: subs.length,
    expiredSubscriptions: await db.collection('subscriptions').countDocuments({ orgId, status: { $in: ['EXPIRED', 'CANCELLED'] } }),
  }
}

export async function exportRevenueCsv(orgId, { period = null } = {}) {
  const match = { orgId }
  const start = period ? periodStart(period) : null
  if (start) match.createdAt = { $gte: start }

  const db = await getDb()
  const rows = await db.collection('revenue').find(match).sort({ createdAt: -1 }).toArray()

  const header = 'id,status,amount,clientName,company,source,invoiceNumber,createdAt'
  const lines = rows.map((r) => [
    r.id || r._id,
    r.status,
    r.amount,
    `"${(r.clientName || '').replace(/"/g, '""')}"`,
    `"${(r.company || '').replace(/"/g, '""')}"`,
    r.source || '',
    r.invoiceNumber || '',
    r.createdAt ? new Date(r.createdAt).toISOString() : '',
  ].join(','))

  const csv = [header, ...lines].join('\n')
  const totalRecognized = rows.filter(isRecognized).reduce((s, r) => s + signedAmount(r), 0)

  return { success: true, csv, rowCount: rows.length, totalRecognized }
}

export async function seedDemoRevenueIfEmpty(db) {
  const count = await db.collection('revenue').countDocuments({ orgId: DEMO_ORG_ID, status: 'PAID' })
  if (count > 0) return

  await db.collection('revenue').insertOne({
    id: randomUUID(),
    orgId: DEMO_ORG_ID,
    clientName: 'Sahil Khan',
    company: 'Trinity Auto',
    product: 'LeadEdge360',
    territory: 'Bengaluru',
    source: 'invoice_payment',
    amount: 59000,
    status: 'PAID',
    createdAt: new Date(),
  })

  await db.collection('revenue').insertOne({
    id: randomUUID(),
    orgId: DEMO_ORG_ID,
    clientName: 'Rahul Verma',
    company: 'Acme Pharma',
    product: 'LeadEdge360',
    territory: 'Bengaluru',
    source: 'opportunity_won',
    amount: 250000,
    status: 'FORECAST',
    createdAt: new Date(),
  })
}
