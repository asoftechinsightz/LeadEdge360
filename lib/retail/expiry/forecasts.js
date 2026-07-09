import { randomUUID } from 'crypto'
import { predictShelfLife } from '@/lib/retail-ai'
import { COLLECTIONS } from './constants.js'
import { daysUntilExpiry } from './utils.js'
import { notifyForecast } from './notifications.js'

const RECOMMENDATION_TYPES = ['discount', 'bundle', 'promotion', 'flash_sale', 'return_supplier', 'dispose']

function buildRecommendation(days, qty, price, risk) {
  if (days < 0) {
    return {
      type: 'dispose',
      recommendation: 'Product expired — initiate disposal or supplier return immediately.',
      confidence: 0.95,
    }
  }
  if (days <= 7 || risk === 'High') {
    return {
      type: 'flash_sale',
      recommendation: `Apply 30-50% discount on ${qty} units. Feature in POS and WhatsApp blast.`,
      confidence: 0.88,
    }
  }
  if (days <= 15) {
    return {
      type: 'discount',
      recommendation: `Offer 20% discount. Bundle with fast-moving complementary products.`,
      confidence: 0.82,
    }
  }
  if (days <= 30) {
    return {
      type: 'promotion',
      recommendation: 'Create end-of-aisle promotion. Cross-sell at checkout.',
      confidence: 0.75,
    }
  }
  if (days <= 60) {
    return {
      type: 'bundle',
      recommendation: 'Bundle with popular items to accelerate turnover.',
      confidence: 0.65,
    }
  }
  return {
    type: 'promotion',
    recommendation: 'Monitor weekly. Reduce next purchase order quantity.',
    confidence: 0.55,
  }
}

export async function runForecastEngine(db, orgId) {
  const batches = await db.collection(COLLECTIONS.BATCHES)
    .find({
      orgId,
      quantityAvailable: { $gt: 0 },
      batchStatus: { $nin: ['recalled', 'blocked', 'depleted'] },
    })
    .toArray()

  const now = new Date().toISOString()
  const forecasts = []

  for (const batch of batches) {
    const days = daysUntilExpiry(batch.expiryDate)
    if (days === null || days > 90) continue

    const aiInput = {
      name: batch.productName,
      sku: batch.productSku,
      category: batch.category,
      price: batch.sellingPrice,
      stock: batch.quantityAvailable,
      daysOnShelf: batch.shelfLifeDays ? batch.shelfLifeDays - (days || 0) : 0,
      expiryDate: batch.expiryDate,
    }

    let aiResult
    try {
      aiResult = await predictShelfLife(aiInput)
    } catch {
      aiResult = { risk: 'Medium', engine: 'rules' }
    }

    const rec = buildRecommendation(days, batch.quantityAvailable, batch.purchasePrice, aiResult.risk)
    const predictedLoss = Number(batch.purchasePrice || 0) * Number(batch.quantityAvailable || 0) * (days <= 7 ? 0.8 : days <= 30 ? 0.4 : 0.15)
    const predictedWaste = days <= 7 ? Math.round(batch.quantityAvailable * 0.3) : days <= 30 ? Math.round(batch.quantityAvailable * 0.1) : 0

    const forecast = {
      id: randomUUID(),
      orgId,
      productId: batch.productId,
      productName: batch.productName,
      batchId: batch.id,
      recommendationType: rec.type,
      recommendation: rec.recommendation,
      predictedLoss: Math.round(predictedLoss),
      predictedWaste,
      confidenceScore: rec.confidence,
      daysToExpiry: days,
      quantityAtRisk: batch.quantityAvailable,
      engine: aiResult.engine || 'rules',
      createdAt: now,
      updatedAt: now,
    }

    await db.collection(COLLECTIONS.FORECASTS).insertOne(forecast)
    await notifyForecast(db, forecast)
    forecasts.push(forecast)
  }

  return { forecasts, count: forecasts.length }
}

export async function listForecasts(db, orgId, { page = 1, limit = 25 } = {}) {
  const cap = Math.min(Math.max(limit, 1), 100)
  const skip = (Math.max(page, 1) - 1) * cap
  const [items, total] = await Promise.all([
    db.collection(COLLECTIONS.FORECASTS)
      .find({ orgId }, { projection: { _id: 0 } })
      .sort({ confidenceScore: -1, createdAt: -1 })
      .skip(skip)
      .limit(cap)
      .toArray(),
    db.collection(COLLECTIONS.FORECASTS).countDocuments({ orgId }),
  ])
  return { items, total, page, limit: cap, pages: Math.ceil(total / cap) || 1 }
}

export { RECOMMENDATION_TYPES }
