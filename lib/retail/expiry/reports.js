import { COLLECTIONS } from './constants.js'
import { daysUntilExpiry, buildBatchFilter } from './utils.js'

const REPORT_TYPES = [
  'expired', 'near_expiry', 'batch', 'warehouse', 'supplier',
  'category', 'product', 'financial_loss', 'return', 'disposal', 'forecast',
]

export async function generateReport(db, orgId, type, params = {}) {
  if (!REPORT_TYPES.includes(type)) {
    const err = new Error('VALIDATION_FAILED')
    err.detail = `Invalid report type. Valid: ${REPORT_TYPES.join(', ')}`
    throw err
  }

  switch (type) {
    case 'expired': return reportExpired(db, orgId, params)
    case 'near_expiry': return reportNearExpiry(db, orgId, params)
    case 'batch': return reportBatches(db, orgId, params)
    case 'warehouse': return reportByWarehouse(db, orgId, params)
    case 'supplier': return reportBySupplier(db, orgId, params)
    case 'category': return reportByCategory(db, orgId, params)
    case 'product': return reportByProduct(db, orgId, params)
    case 'financial_loss': return reportFinancialLoss(db, orgId, params)
    case 'return': return reportReturns(db, orgId, params)
    case 'disposal': return reportDisposals(db, orgId, params)
    case 'forecast': return reportForecasts(db, orgId, params)
    default: return { rows: [], summary: {} }
  }
}

async function reportExpired(db, orgId, params) {
  const batches = await fetchBatches(db, orgId, params)
  const rows = batches
    .filter((b) => daysUntilExpiry(b.expiryDate) < 0)
    .map(mapBatchRow)
  return { type: 'expired', rows, summary: { count: rows.length, totalValue: sumValue(rows) }, generatedAt: new Date().toISOString() }
}

async function reportNearExpiry(db, orgId, params) {
  const days = Number(params.days || 30)
  const batches = await fetchBatches(db, orgId, params)
  const rows = batches
    .filter((b) => {
      const d = daysUntilExpiry(b.expiryDate)
      return d !== null && d >= 0 && d <= days
    })
    .map((b) => ({ ...mapBatchRow(b), daysRemaining: daysUntilExpiry(b.expiryDate) }))
  return { type: 'near_expiry', rows, summary: { count: rows.length, days, totalValue: sumValue(rows) }, generatedAt: new Date().toISOString() }
}

async function reportBatches(db, orgId, params) {
  const filter = buildBatchFilter(orgId, params)
  const rows = await db.collection(COLLECTIONS.BATCHES).find(filter, { projection: { _id: 0 } }).sort({ expiryDate: 1 }).limit(5000).toArray()
  return { type: 'batch', rows: rows.map(mapBatchRow), summary: { count: rows.length }, generatedAt: new Date().toISOString() }
}

async function reportByWarehouse(db, orgId) {
  const rows = await db.collection(COLLECTIONS.BATCHES).aggregate([
    { $match: { orgId, quantityAvailable: { $gt: 0 } } },
    { $group: {
      _id: '$warehouseName',
      batchCount: { $sum: 1 },
      totalQty: { $sum: '$quantityAvailable' },
      totalValue: { $sum: { $multiply: ['$purchasePrice', '$quantityAvailable'] } },
    }},
    { $sort: { totalValue: -1 } },
  ]).toArray()
  return { type: 'warehouse', rows: rows.map((r) => ({ warehouse: r._id, ...r, _id: undefined })), summary: { count: rows.length }, generatedAt: new Date().toISOString() }
}

async function reportBySupplier(db, orgId) {
  const rows = await db.collection(COLLECTIONS.BATCHES).aggregate([
    { $match: { orgId, quantityAvailable: { $gt: 0 } } },
    { $group: {
      _id: '$supplier',
      batchCount: { $sum: 1 },
      totalQty: { $sum: '$quantityAvailable' },
      totalValue: { $sum: { $multiply: ['$purchasePrice', '$quantityAvailable'] } },
    }},
    { $sort: { totalValue: -1 } },
  ]).toArray()
  return { type: 'supplier', rows: rows.map((r) => ({ supplier: r._id, ...r, _id: undefined })), summary: { count: rows.length }, generatedAt: new Date().toISOString() }
}

async function reportByCategory(db, orgId) {
  const rows = await db.collection(COLLECTIONS.BATCHES).aggregate([
    { $match: { orgId, quantityAvailable: { $gt: 0 } } },
    { $group: {
      _id: '$category',
      batchCount: { $sum: 1 },
      totalQty: { $sum: '$quantityAvailable' },
      expiredQty: { $sum: { $cond: [{ $eq: ['$batchStatus', 'expired'] }, '$quantityAvailable', 0] } },
    }},
    { $sort: { expiredQty: -1 } },
  ]).toArray()
  return { type: 'category', rows: rows.map((r) => ({ category: r._id, ...r, _id: undefined })), summary: { count: rows.length }, generatedAt: new Date().toISOString() }
}

async function reportByProduct(db, orgId) {
  const rows = await db.collection(COLLECTIONS.BATCHES).aggregate([
    { $match: { orgId, quantityAvailable: { $gt: 0 } } },
    { $group: {
      _id: '$productId',
      productName: { $first: '$productName' },
      productSku: { $first: '$productSku' },
      batchCount: { $sum: 1 },
      totalQty: { $sum: '$quantityAvailable' },
      nearestExpiry: { $min: '$expiryDate' },
    }},
    { $sort: { nearestExpiry: 1 } },
    { $limit: 500 },
  ]).toArray()
  return { type: 'product', rows, summary: { count: rows.length }, generatedAt: new Date().toISOString() }
}

async function reportFinancialLoss(db, orgId) {
  const batches = await fetchBatches(db, orgId, {})
  const rows = batches
    .filter((b) => {
      const d = daysUntilExpiry(b.expiryDate)
      return d !== null && d <= 30
    })
    .map((b) => ({
      ...mapBatchRow(b),
      daysRemaining: daysUntilExpiry(b.expiryDate),
      estimatedLoss: Number(b.purchasePrice || 0) * Number(b.quantityAvailable || 0),
    }))
  return { type: 'financial_loss', rows, summary: { count: rows.length, totalLoss: rows.reduce((s, r) => s + r.estimatedLoss, 0) }, generatedAt: new Date().toISOString() }
}

async function reportReturns(db, orgId, params) {
  const filter = { orgId }
  if (params.status) filter.status = params.status
  const rows = await db.collection(COLLECTIONS.RETURNS).find(filter, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(1000).toArray()
  return { type: 'return', rows, summary: { count: rows.length }, generatedAt: new Date().toISOString() }
}

async function reportDisposals(db, orgId, params) {
  const filter = { orgId }
  if (params.status) filter.status = params.status
  const rows = await db.collection(COLLECTIONS.DISPOSALS).find(filter, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(1000).toArray()
  const totalLoss = rows.reduce((s, r) => s + Number(r.financialLoss || 0), 0)
  return { type: 'disposal', rows, summary: { count: rows.length, totalLoss }, generatedAt: new Date().toISOString() }
}

async function reportForecasts(db, orgId) {
  const rows = await db.collection(COLLECTIONS.FORECASTS)
    .find({ orgId }, { projection: { _id: 0 } })
    .sort({ confidenceScore: -1 })
    .limit(500)
    .toArray()
  return { type: 'forecast', rows, summary: { count: rows.length }, generatedAt: new Date().toISOString() }
}

async function fetchBatches(db, orgId, params) {
  const filter = buildBatchFilter(orgId, params)
  return db.collection(COLLECTIONS.BATCHES).find(filter, { projection: { _id: 0 } }).limit(10000).toArray()
}

function mapBatchRow(b) {
  return {
    batchNumber: b.batchNumber,
    productName: b.productName,
    productSku: b.productSku,
    category: b.category,
    supplier: b.supplier,
    warehouse: b.warehouseName,
    expiryDate: b.expiryDate,
    quantityAvailable: b.quantityAvailable,
    purchasePrice: b.purchasePrice,
    value: Number(b.purchasePrice || 0) * Number(b.quantityAvailable || 0),
    batchStatus: b.batchStatus,
  }
}

function sumValue(rows) {
  return Math.round(rows.reduce((s, r) => s + (r.value || 0), 0))
}

export function exportReportCsv(report) {
  if (!report.rows?.length) return 'No data'
  const headers = Object.keys(report.rows[0]).join(',')
  const lines = report.rows.map((r) => Object.values(r).map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
  return [headers, ...lines].join('\n')
}

export { REPORT_TYPES }
