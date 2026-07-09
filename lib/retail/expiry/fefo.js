import { COLLECTIONS, WARNING_THRESHOLDS } from './constants.js'
import { daysUntilExpiry, canPerformAction } from './utils.js'
import { recordBatchMovement } from './movements.js'
import { syncInventoryFromBatches } from './batches.js'
import { writeExpiryAuditLog } from './audit.js'

/**
 * FEFO (First Expired First Out) allocation for POS checkout.
 * Returns allocations and warnings; throws on blocked/expired without override.
 */
export async function allocateFefo(db, orgId, userId, { productId, quantity, overrideWarnings = false }, meta = {}) {
  const qty = Math.max(1, Number(quantity || 1))
  const batches = await db.collection(COLLECTIONS.BATCHES)
    .find({
      orgId,
      productId,
      quantityAvailable: { $gt: 0 },
      batchStatus: { $nin: ['recalled', 'blocked', 'expired'] },
    })
    .sort({ expiryDate: 1 })
    .toArray()

  if (!batches.length) {
    const expiredBatch = await db.collection(COLLECTIONS.BATCHES).findOne({
      orgId,
      productId,
      batchStatus: 'expired',
      quantityAvailable: { $gt: 0 },
    })
    if (expiredBatch) {
      const err = new Error('VALIDATION_FAILED')
      err.detail = 'Product is expired and cannot be sold'
      err.code = 'EXPIRED_PRODUCT'
      throw err
    }
    const err = new Error('NOT_FOUND')
    err.detail = 'No available batches for product'
    throw err
  }

  const warnings = []
  let remaining = qty
  const allocations = []

  for (const batch of batches) {
    if (remaining <= 0) break
    const days = daysUntilExpiry(batch.expiryDate)

    if (days !== null && days < 0) continue

    if (['recalled', 'blocked'].includes(batch.batchStatus)) {
      const err = new Error('VALIDATION_FAILED')
      err.detail = `Batch ${batch.batchNumber} is ${batch.batchStatus}`
      err.code = 'BLOCKED_BATCH'
      throw err
    }

    for (const threshold of WARNING_THRESHOLDS) {
      if (days !== null && days >= 0 && days <= threshold) {
        warnings.push({
          batchId: batch.id,
          batchNumber: batch.batchNumber,
          daysRemaining: days,
          threshold,
          message: `Expires in ${days} days (within ${threshold}-day warning)`,
        })
        break
      }
    }

    const take = Math.min(remaining, Number(batch.quantityAvailable || 0))
    if (take <= 0) continue

    allocations.push({
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      expiryDate: batch.expiryDate,
      daysRemaining: days,
      quantity: take,
      unitPrice: Number(batch.sellingPrice || 0),
    })
    remaining -= take
  }

  if (remaining > 0) {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'Insufficient batch stock'
    throw err
  }

  if (warnings.length && !overrideWarnings) {
    const canOverride = canPerformAction({ role: meta.userRole }, 'override_warning')
    return { allocations, warnings, requiresOverride: true, canOverride }
  }

  return { allocations, warnings, requiresOverride: false }
}

export async function applyFefoAllocations(db, orgId, userId, allocations, referenceId, meta = {}) {
  const now = new Date().toISOString()
  const results = []

  for (const alloc of allocations) {
    const batch = await db.collection(COLLECTIONS.BATCHES).findOne({ orgId, id: alloc.batchId })
    if (!batch) continue

    const qtyBefore = Number(batch.quantityAvailable || 0)
    const qtyAfter = qtyBefore - alloc.quantity

    await db.collection(COLLECTIONS.BATCHES).updateOne(
      { orgId, id: alloc.batchId },
      {
        $inc: {
          quantityAvailable: -alloc.quantity,
          quantitySold: alloc.quantity,
        },
        $set: {
          updatedAt: now,
          updatedBy: userId,
          batchStatus: qtyAfter <= 0 ? 'depleted' : batch.batchStatus,
        },
      },
    )

    await recordBatchMovement(db, {
      orgId,
      batchId: alloc.batchId,
      batchNumber: alloc.batchNumber,
      productId: batch.productId,
      movementType: 'sale',
      quantity: -alloc.quantity,
      quantityBefore: qtyBefore,
      quantityAfter: qtyAfter,
      referenceType: 'retail_sale',
      referenceId,
      warehouseId: batch.warehouseId,
      notes: meta.overrideWarnings ? 'Sale with expiry warning override' : 'FEFO POS sale',
      userId,
    })

    results.push({ batchId: alloc.batchId, quantity: alloc.quantity })
  }

  if (results.length) {
    const firstBatch = await db.collection(COLLECTIONS.BATCHES).findOne({ orgId, id: results[0].batchId })
    if (firstBatch) {
      await syncInventoryFromBatches(db, orgId, firstBatch.productId, firstBatch.warehouseId)
    }
  }

  if (meta.overrideWarnings) {
    await writeExpiryAuditLog(db, {
      orgId,
      userId,
      action: 'sale.override_expiry_warning',
      entity: 'retail_sale',
      entityId: referenceId,
      newValue: { allocations: results },
      reason: meta.reason || 'Authorized override',
      ip: meta.ip,
      ua: meta.ua,
    })
  }

  return { allocations: results }
}

export async function lookupProductForPos(db, orgId, sku) {
  const code = String(sku || '').trim()
  const PRODUCTS = 'retail_products'
  const product = await db.collection(PRODUCTS).findOne({
    orgId,
    $or: [{ sku: code }, { barcode: code }],
  }, { projection: { _id: 0 } })

  if (!product) {
    const err = new Error('NOT_FOUND')
    err.detail = 'SKU not found'
    throw err
  }

  const batches = await db.collection(COLLECTIONS.BATCHES)
    .find({ orgId, productId: product.id, quantityAvailable: { $gt: 0 } })
    .sort({ expiryDate: 1 })
    .toArray()

  const nearest = batches[0]
  const days = nearest ? daysUntilExpiry(nearest.expiryDate) : null

  return {
    product: {
      id: product.id,
      sku: product.sku,
      name: product.name,
      price: Number(nearest?.sellingPrice ?? product.price ?? 0),
      category: product.category,
      batchId: nearest?.id,
      batchNumber: nearest?.batchNumber,
      expiryDate: nearest?.expiryDate,
      daysRemaining: days,
      stock: batches.reduce((s, b) => s + Number(b.quantityAvailable || 0), 0),
      expiryColor: days < 0 ? 'red' : days <= 7 ? 'orange' : days <= 30 ? 'yellow' : 'green',
    },
    batches: batches.map((b) => ({
      id: b.id,
      batchNumber: b.batchNumber,
      expiryDate: b.expiryDate,
      daysRemaining: daysUntilExpiry(b.expiryDate),
      quantityAvailable: b.quantityAvailable,
    })),
  }
}
