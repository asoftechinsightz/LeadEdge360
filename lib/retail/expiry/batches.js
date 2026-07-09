import { randomUUID } from 'crypto'
import { COLLECTIONS } from './constants.js'
import {
  daysUntilExpiry,
  computeShelfLife,
  deriveBatchStatus,
  generateBatchNumber,
  buildBatchFilter,
  buildListResponse,
} from './utils.js'
import { writeExpiryAuditLog } from './audit.js'
import { recordBatchMovement } from './movements.js'

const PRODUCTS = 'retail_products'
const STORES = 'retail_stores'
const INVENTORY = 'retail_inventory'

function enrichBatch(batch) {
  const days = daysUntilExpiry(batch.expiryDate)
  return {
    ...batch,
    daysRemaining: days,
    expiryColor: days < 0 ? 'red' : days <= 7 ? 'orange' : days <= 30 ? 'yellow' : 'green',
    batchStatus: deriveBatchStatus(batch.expiryDate, batch.quantityAvailable, batch.batchStatus),
  }
}

async function resolveProduct(db, orgId, productId) {
  return db.collection(PRODUCTS).findOne({ orgId, id: productId }, { projection: { _id: 0 } })
}

async function resolveWarehouse(db, orgId, warehouseId) {
  if (!warehouseId) return null
  return db.collection(STORES).findOne({ orgId, id: warehouseId }, { projection: { _id: 0 } })
}

async function syncInventoryFromBatches(db, orgId, productId, warehouseId) {
  const batches = await db.collection(COLLECTIONS.BATCHES)
    .find({ orgId, productId, warehouseId, batchStatus: { $nin: ['recalled', 'blocked'] } })
    .toArray()
  const totalQty = batches.reduce((s, b) => s + Math.max(0, Number(b.quantityAvailable || 0)), 0)
  const nearestExpiry = batches
    .filter((b) => b.quantityAvailable > 0 && b.expiryDate)
    .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))[0]

  const now = new Date().toISOString()
  await db.collection(INVENTORY).updateOne(
    { orgId, storeId: warehouseId, productId },
    {
      $set: {
        quantity: totalQty,
        expiryDate: nearestExpiry?.expiryDate || null,
        updatedAt: now,
      },
      $setOnInsert: {
        id: randomUUID(),
        orgId,
        storeId: warehouseId,
        productId,
        reservedQty: 0,
        reorderLevel: 10,
        daysOnShelf: 0,
        createdAt: now,
      },
    },
    { upsert: true },
  )
  return totalQty
}

export async function createBatch(db, orgId, userId, body, meta = {}) {
  const productId = String(body.productId || '').trim()
  if (!productId) {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'productId is required'
    throw err
  }

  const product = await resolveProduct(db, orgId, productId)
  if (!product) {
    const err = new Error('NOT_FOUND')
    err.detail = 'Product not found'
    throw err
  }

  const warehouseId = body.warehouseId || body.storeId
  const warehouse = warehouseId
    ? await resolveWarehouse(db, orgId, warehouseId)
    : await db.collection(STORES).findOne({ orgId, code: 'DEFAULT' })

  if (!warehouse) {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'Warehouse not found'
    throw err
  }

  const qty = Math.max(0, Number(body.quantityPurchased ?? body.quantity ?? 0))
  const expiryDate = body.expiryDate || null
  const mfgDate = body.manufacturingDate || null
  const now = new Date().toISOString()

  const batch = {
    id: randomUUID(),
    orgId,
    batchNumber: body.batchNumber || generateBatchNumber(orgId, productId),
    productId: product.id,
    productName: product.name,
    productSku: product.sku,
    category: product.category || 'other',
    warehouseId: warehouse.id,
    warehouseName: warehouse.name,
    supplier: String(body.supplier || 'Unknown').trim(),
    manufacturingDate: mfgDate,
    expiryDate,
    shelfLifeDays: computeShelfLife(mfgDate, expiryDate),
    purchaseDate: body.purchaseDate || now,
    purchasePrice: Number(body.purchasePrice ?? product.price ?? 0),
    sellingPrice: Number(body.sellingPrice ?? product.price ?? 0),
    quantityPurchased: qty,
    quantityAvailable: qty,
    quantitySold: 0,
    quantityReturned: 0,
    quantityDamaged: 0,
    quantityDestroyed: 0,
    batchStatus: 'active',
    shelf: body.shelf || null,
    barcode: body.barcode || product.barcode || null,
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
    updatedBy: userId,
  }
  batch.batchStatus = deriveBatchStatus(batch.expiryDate, batch.quantityAvailable, batch.batchStatus)

  await db.collection(COLLECTIONS.BATCHES).insertOne(batch)

  await recordBatchMovement(db, {
    orgId,
    batchId: batch.id,
    batchNumber: batch.batchNumber,
    productId: batch.productId,
    movementType: 'purchase',
    quantity: qty,
    quantityBefore: 0,
    quantityAfter: qty,
    warehouseId: warehouse.id,
    notes: 'Batch created via purchase',
    userId,
  })

  await syncInventoryFromBatches(db, orgId, product.id, warehouse.id)

  await writeExpiryAuditLog(db, {
    orgId,
    userId,
    action: 'batch.create',
    entity: 'product_batch',
    entityId: batch.id,
    newValue: { batchNumber: batch.batchNumber, quantityPurchased: qty },
    reason: body.reason || 'Stock purchase',
    ip: meta.ip,
    ua: meta.ua,
  })

  return { batch: enrichBatch(batch) }
}

export async function listBatches(db, orgId, params = {}) {
  const filter = buildBatchFilter(orgId, params)
  const page = Math.max(1, Number(params.page || 1))
  const limit = Math.min(100, Math.max(1, Number(params.limit || 25)))
  const sort = params.sort || 'expiryDate'
  const order = params.order === 'desc' ? -1 : 1
  const skip = (page - 1) * limit

  const [items, total] = await Promise.all([
    db.collection(COLLECTIONS.BATCHES)
      .find(filter, { projection: { _id: 0 } })
      .sort({ [sort]: order })
      .skip(skip)
      .limit(limit)
      .toArray(),
    db.collection(COLLECTIONS.BATCHES).countDocuments(filter),
  ])

  return buildListResponse(items.map(enrichBatch), total, page, limit)
}

export async function getBatch(db, orgId, batchId) {
  const batch = await db.collection(COLLECTIONS.BATCHES).findOne(
    { orgId, id: batchId },
    { projection: { _id: 0 } },
  )
  if (!batch) {
    const err = new Error('NOT_FOUND')
    throw err
  }
  return { batch: enrichBatch(batch) }
}

export async function updateBatch(db, orgId, userId, batchId, body, meta = {}) {
  const existing = await db.collection(COLLECTIONS.BATCHES).findOne({ orgId, id: batchId })
  if (!existing) {
    const err = new Error('NOT_FOUND')
    throw err
  }

  const allowed = ['supplier', 'manufacturingDate', 'expiryDate', 'purchasePrice', 'sellingPrice',
    'shelf', 'batchStatus', 'quantityDamaged']
  const updates = {}
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key]
  }
  if (updates.expiryDate || updates.manufacturingDate) {
    updates.shelfLifeDays = computeShelfLife(
      updates.manufacturingDate ?? existing.manufacturingDate,
      updates.expiryDate ?? existing.expiryDate,
    )
  }
  updates.updatedAt = new Date().toISOString()
  updates.updatedBy = userId
  updates.batchStatus = deriveBatchStatus(
    updates.expiryDate ?? existing.expiryDate,
    existing.quantityAvailable,
    updates.batchStatus ?? existing.batchStatus,
  )

  await db.collection(COLLECTIONS.BATCHES).updateOne({ orgId, id: batchId }, { $set: updates })

  await writeExpiryAuditLog(db, {
    orgId,
    userId,
    action: 'batch.update',
    entity: 'product_batch',
    entityId: batchId,
    previousValue: existing,
    newValue: updates,
    reason: body.reason || null,
    ip: meta.ip,
    ua: meta.ua,
  })

  return getBatch(db, orgId, batchId)
}

export async function deleteBatch(db, orgId, userId, batchId, meta = {}) {
  const existing = await db.collection(COLLECTIONS.BATCHES).findOne({ orgId, id: batchId })
  if (!existing) {
    const err = new Error('NOT_FOUND')
    throw err
  }
  if (Number(existing.quantitySold || 0) > 0) {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'Cannot delete batch with sales history'
    throw err
  }

  await db.collection(COLLECTIONS.BATCHES).deleteOne({ orgId, id: batchId })
  await syncInventoryFromBatches(db, orgId, existing.productId, existing.warehouseId)

  await writeExpiryAuditLog(db, {
    orgId,
    userId,
    action: 'batch.delete',
    entity: 'product_batch',
    entityId: batchId,
    previousValue: existing,
    ip: meta.ip,
    ua: meta.ua,
  })

  return { ok: true }
}

export async function bulkImportBatches(db, orgId, userId, rows, meta = {}) {
  const results = { created: 0, errors: [] }
  for (let i = 0; i < rows.length; i++) {
    try {
      await createBatch(db, orgId, userId, rows[i], meta)
      results.created += 1
    } catch (e) {
      results.errors.push({ row: i + 1, message: e.detail || e.message })
    }
  }
  return results
}

export async function bulkUpdateBatches(db, orgId, userId, ids, updates, meta = {}) {
  const results = { updated: 0, errors: [] }
  for (const id of ids) {
    try {
      await updateBatch(db, orgId, userId, id, updates, meta)
      results.updated += 1
    } catch (e) {
      results.errors.push({ id, message: e.detail || e.message })
    }
  }
  return results
}

export async function bulkDeleteBatches(db, orgId, userId, ids, meta = {}) {
  const results = { deleted: 0, errors: [] }
  for (const id of ids) {
    try {
      await deleteBatch(db, orgId, userId, id, meta)
      results.deleted += 1
    } catch (e) {
      results.errors.push({ id, message: e.detail || e.message })
    }
  }
  return results
}

export async function exportBatches(db, orgId, params = {}) {
  const filter = buildBatchFilter(orgId, params)
  const items = await db.collection(COLLECTIONS.BATCHES)
    .find(filter, { projection: { _id: 0 } })
    .sort({ expiryDate: 1 })
    .limit(10000)
    .toArray()
  return items.map(enrichBatch)
}

export async function scannerLookup(db, orgId, code) {
  const trimmed = String(code || '').trim()
  if (!trimmed) {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'Barcode or batch number required'
    throw err
  }

  let batch = await db.collection(COLLECTIONS.BATCHES).findOne(
    { orgId, $or: [{ barcode: trimmed }, { batchNumber: trimmed }] },
    { projection: { _id: 0 } },
  )

  if (!batch) {
    const product = await db.collection(PRODUCTS).findOne(
      { orgId, $or: [{ barcode: trimmed }, { sku: trimmed }] },
      { projection: { _id: 0 } },
    )
    if (product) {
      const batches = await db.collection(COLLECTIONS.BATCHES)
        .find({ orgId, productId: product.id, quantityAvailable: { $gt: 0 } })
        .sort({ expiryDate: 1 })
        .limit(1)
        .toArray()
      batch = batches[0] || null
    }
  }

  if (!batch) {
    const err = new Error('NOT_FOUND')
    err.detail = 'No batch found for scanned code'
    throw err
  }

  return { batch: enrichBatch(batch) }
}

export { syncInventoryFromBatches, enrichBatch }
