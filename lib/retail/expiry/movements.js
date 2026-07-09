import { randomUUID } from 'crypto'
import { COLLECTIONS } from './constants.js'

export async function recordBatchMovement(db, {
  orgId,
  batchId,
  batchNumber,
  productId,
  movementType,
  quantity,
  quantityBefore,
  quantityAfter,
  referenceType = null,
  referenceId = null,
  warehouseId = null,
  notes = null,
  userId,
}) {
  const entry = {
    id: randomUUID(),
    orgId,
    batchId,
    batchNumber,
    productId,
    movementType,
    quantity,
    quantityBefore,
    quantityAfter,
    referenceType,
    referenceId,
    warehouseId,
    notes,
    createdAt: new Date().toISOString(),
    createdBy: userId,
  }
  await db.collection(COLLECTIONS.MOVEMENTS).insertOne(entry)
  return entry
}

export async function listMovements(db, orgId, { batchId, productId, page = 1, limit = 25 } = {}) {
  const filter = { orgId }
  if (batchId) filter.batchId = batchId
  if (productId) filter.productId = productId
  const cap = Math.min(Math.max(limit, 1), 100)
  const skip = (Math.max(page, 1) - 1) * cap
  const [items, total] = await Promise.all([
    db.collection(COLLECTIONS.MOVEMENTS)
      .find(filter, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(cap)
      .toArray(),
    db.collection(COLLECTIONS.MOVEMENTS).countDocuments(filter),
  ])
  return { items, total, page, limit: cap, pages: Math.ceil(total / cap) || 1 }
}
