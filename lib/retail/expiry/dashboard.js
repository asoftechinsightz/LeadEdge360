import { randomUUID } from 'crypto'
import { COLLECTIONS } from './constants.js'
import { daysUntilExpiry } from './utils.js'
import { getCriticalAlerts } from './alerts.js'

function dateRange(days) {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + days)
  return { start: start.toISOString(), end: end.toISOString() }
}

function countExpiringIn(batches, maxDays) {
  return batches.filter((b) => {
    const d = daysUntilExpiry(b.expiryDate)
    return d !== null && d >= 0 && d <= maxDays
  }).length
}

function countExpired(batches) {
  return batches.filter((b) => {
    const d = daysUntilExpiry(b.expiryDate)
    return d !== null && d < 0 && Number(b.quantityAvailable || 0) > 0
  }).length
}

export async function getExpiryDashboard(db, orgId) {
  const batches = await db.collection(COLLECTIONS.BATCHES)
    .find({ orgId, quantityAvailable: { $gt: 0 } }, { projection: { _id: 0 } })
    .toArray()

  const today = countExpiringIn(batches, 0)
  const in7 = countExpiringIn(batches, 7)
  const in30 = countExpiringIn(batches, 30)
  const in60 = countExpiringIn(batches, 60)
  const in90 = countExpiringIn(batches, 90)
  const expired = countExpired(batches)

  const estimatedLoss = batches
    .filter((b) => {
      const d = daysUntilExpiry(b.expiryDate)
      return d !== null && d <= 30
    })
    .reduce((s, b) => s + Number(b.purchasePrice || 0) * Number(b.quantityAvailable || 0), 0)

  const [returnsPending, destroyedValue, activeBatches, criticalAlerts, recentActivities] = await Promise.all([
    db.collection(COLLECTIONS.RETURNS).countDocuments({ orgId, status: 'pending' }),
    db.collection(COLLECTIONS.DISPOSALS).aggregate([
      { $match: { orgId, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$financialLoss' } } },
    ]).toArray(),
    db.collection(COLLECTIONS.BATCHES).countDocuments({ orgId, batchStatus: { $in: ['active', 'near_expiry', 'critical'] } }),
    getCriticalAlerts(db, orgId, 5),
    db.collection(COLLECTIONS.AUDIT)
      .find({ orgId }, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray(),
  ])

  const kpis = {
    totalExpired: expired,
    expiringToday: today,
    expiring7Days: in7,
    expiring30Days: in30,
    expiring60Days: in60,
    expiring90Days: in90,
    estimatedExpiryLoss: Math.round(estimatedLoss),
    returnPending: returnsPending,
    destroyedInventoryValue: Math.round(destroyedValue[0]?.total || 0),
    activeBatches,
  }

  const charts = await buildCharts(db, orgId, batches)
  const widgets = await buildWidgets(db, orgId, batches)

  return { kpis, charts, widgets, criticalAlerts, recentActivities }
}

async function buildCharts(db, orgId, batches) {
  const monthlyTrend = {}
  const byCategory = {}
  const bySupplier = {}
  const byWarehouse = {}
  const financialLoss = {}
  const nearExpiry = []
  const batchDistribution = { active: 0, near_expiry: 0, critical: 0, expired: 0, other: 0 }
  const timeline = []

  for (const b of batches) {
    const days = daysUntilExpiry(b.expiryDate)
    const month = b.expiryDate ? b.expiryDate.slice(0, 7) : 'unknown'
    monthlyTrend[month] = (monthlyTrend[month] || 0) + 1

    const cat = b.category || 'other'
    byCategory[cat] = (byCategory[cat] || 0) + Number(b.quantityAvailable || 0)

    const sup = b.supplier || 'Unknown'
    bySupplier[sup] = (bySupplier[sup] || 0) + Number(b.quantityAvailable || 0)

    const wh = b.warehouseName || 'Unknown'
    byWarehouse[wh] = (byWarehouse[wh] || 0) + Number(b.quantityAvailable || 0)

    if (days !== null && days <= 30) {
      const loss = Number(b.purchasePrice || 0) * Number(b.quantityAvailable || 0)
      financialLoss[month] = (financialLoss[month] || 0) + loss
      nearExpiry.push({ name: b.productName, days, qty: b.quantityAvailable, value: loss })
    }

    const status = b.batchStatus || 'active'
    if (batchDistribution[status] !== undefined) batchDistribution[status] += 1
    else batchDistribution.other += 1

    timeline.push({
      productName: b.productName,
      batchNumber: b.batchNumber,
      expiryDate: b.expiryDate,
      daysRemaining: days,
      quantity: b.quantityAvailable,
    })
  }

  nearExpiry.sort((a, b) => a.days - b.days)
  timeline.sort((a, b) => (a.daysRemaining ?? 999) - (b.daysRemaining ?? 999))

  return {
    monthlyExpiryTrend: Object.entries(monthlyTrend).map(([month, count]) => ({ month, count })),
    categoryWiseExpiry: Object.entries(byCategory).map(([name, value]) => ({ name, value })),
    supplierWiseExpiry: Object.entries(bySupplier).map(([name, value]) => ({ name, value })),
    warehouseWiseExpiry: Object.entries(byWarehouse).map(([name, value]) => ({ name, value })),
    financialLossTrend: Object.entries(financialLoss).map(([month, value]) => ({ month, value: Math.round(value) })),
    nearExpiryInventory: nearExpiry.slice(0, 20),
    batchDistribution: Object.entries(batchDistribution).map(([name, value]) => ({ name, value })),
    productExpiryTimeline: timeline.slice(0, 50),
  }
}

async function buildWidgets(db, orgId, batches) {
  const topExpiring = [...batches]
    .map((b) => ({ ...b, daysRemaining: daysUntilExpiry(b.expiryDate) }))
    .filter((b) => b.daysRemaining !== null && b.daysRemaining <= 90)
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .slice(0, 10)
    .map((b) => ({
      productName: b.productName,
      batchNumber: b.batchNumber,
      daysRemaining: b.daysRemaining,
      quantity: b.quantityAvailable,
      value: Number(b.purchasePrice || 0) * Number(b.quantityAvailable || 0),
    }))

  const supplierMap = {}
  for (const b of batches) {
    const s = b.supplier || 'Unknown'
    supplierMap[s] = (supplierMap[s] || 0) + 1
  }
  const topSuppliers = Object.entries(supplierMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, batchCount]) => ({ name, batchCount }))

  const catExpired = {}
  for (const b of batches) {
    const d = daysUntilExpiry(b.expiryDate)
    if (d !== null && d < 0) {
      const c = b.category || 'other'
      catExpired[c] = (catExpired[c] || 0) + Number(b.quantityAvailable || 0)
    }
  }
  const mostExpiredCategories = Object.entries(catExpired)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, quantity]) => ({ name, quantity }))

  const calendar = batches
    .filter((b) => b.expiryDate)
    .slice(0, 30)
    .map((b) => ({
      date: b.expiryDate?.slice(0, 10),
      productName: b.productName,
      batchNumber: b.batchNumber,
      quantity: b.quantityAvailable,
    }))

  return { topExpiring, topSuppliers, mostExpiredCategories, expiryCalendar: calendar }
}
