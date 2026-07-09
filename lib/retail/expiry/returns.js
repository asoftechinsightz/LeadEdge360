import { randomUUID } from 'crypto'
import { COLLECTIONS } from './constants.js'
import { writeExpiryAuditLog } from './audit.js'
import { notifyReturnStatus } from './notifications.js'
import { recordBatchMovement } from './movements.js'
import { syncInventoryFromBatches } from './batches.js'

function generateReturnNumber() {
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const seq = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `RET-${d}-${seq}`
}

export async function createReturn(db, orgId, userId, body, meta = {}) {
  const batchId = String(body.batchId || '').trim()
  const quantity = Math.max(1, Number(body.quantity || 0))
  if (!batchId || !quantity) {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'batchId and quantity are required'
    throw err
  }

  const batch = await db.collection(COLLECTIONS.BATCHES).findOne({ orgId, id: batchId })
  if (!batch) {
    const err = new Error('NOT_FOUND')
    throw err
  }
  if (quantity > Number(batch.quantityAvailable || 0)) {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'Return quantity exceeds available stock'
    throw err
  }

  const now = new Date().toISOString()
  const ret = {
    id: randomUUID(),
    orgId,
    returnNumber: generateReturnNumber(),
    batchId: batch.id,
    batchNumber: batch.batchNumber,
    productId: batch.productId,
    productName: batch.productName,
    supplier: batch.supplier,
    quantity,
    reason: body.reason || 'expired',
    status: 'pending',
    replacementRequested: Boolean(body.replacementRequested),
    creditNoteAmount: null,
    refundAmount: null,
    supplierStatus: 'pending',
    challanNumber: null,
    notes: body.notes || '',
    approvedBy: null,
    approvedAt: null,
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
    updatedBy: userId,
  }

  await db.collection(COLLECTIONS.RETURNS).insertOne(ret)

  await writeExpiryAuditLog(db, {
    orgId,
    userId,
    action: 'return.create',
    entity: 'expiry_return',
    entityId: ret.id,
    newValue: { returnNumber: ret.returnNumber, quantity },
    ip: meta.ip,
    ua: meta.ua,
  })

  return { return: ret }
}

export async function listReturns(db, orgId, { status, supplier, page = 1, limit = 25 } = {}) {
  const filter = { orgId }
  if (status) filter.status = status
  if (supplier) filter.supplier = supplier
  const cap = Math.min(Math.max(limit, 1), 100)
  const skip = (Math.max(page, 1) - 1) * cap
  const [items, total] = await Promise.all([
    db.collection(COLLECTIONS.RETURNS).find(filter, { projection: { _id: 0 } }).sort({ createdAt: -1 }).skip(skip).limit(cap).toArray(),
    db.collection(COLLECTIONS.RETURNS).countDocuments(filter),
  ])
  return { items, total, page, limit: cap, pages: Math.ceil(total / cap) || 1 }
}

export async function getReturn(db, orgId, returnId) {
  const ret = await db.collection(COLLECTIONS.RETURNS).findOne({ orgId, id: returnId }, { projection: { _id: 0 } })
  if (!ret) {
    const err = new Error('NOT_FOUND')
    throw err
  }
  return { return: ret }
}

export async function updateReturnStatus(db, orgId, userId, returnId, body, meta = {}) {
  const ret = await db.collection(COLLECTIONS.RETURNS).findOne({ orgId, id: returnId })
  if (!ret) {
    const err = new Error('NOT_FOUND')
    throw err
  }

  const status = body.status
  const now = new Date().toISOString()
  const updates = { status, updatedAt: now, updatedBy: userId }

  if (status === 'approved') {
    updates.approvedBy = userId
    updates.approvedAt = now
    updates.challanNumber = body.challanNumber || `CH-${ret.returnNumber}`

    const batch = await db.collection(COLLECTIONS.BATCHES).findOne({ orgId, id: ret.batchId })
    if (batch) {
      const qtyBefore = Number(batch.quantityAvailable || 0)
      const qtyAfter = qtyBefore - ret.quantity
      await db.collection(COLLECTIONS.BATCHES).updateOne(
        { orgId, id: ret.batchId },
        {
          $inc: { quantityAvailable: -ret.quantity, quantityReturned: ret.quantity },
          $set: { updatedAt: now, updatedBy: userId },
        },
      )
      await recordBatchMovement(db, {
        orgId,
        batchId: ret.batchId,
        batchNumber: ret.batchNumber,
        productId: ret.productId,
        movementType: 'return',
        quantity: -ret.quantity,
        quantityBefore: qtyBefore,
        quantityAfter: qtyAfter,
        referenceType: 'expiry_return',
        referenceId: ret.id,
        userId,
      })
      await syncInventoryFromBatches(db, orgId, ret.productId, batch.warehouseId)
    }
  }

  if (body.creditNoteAmount !== undefined) updates.creditNoteAmount = Number(body.creditNoteAmount)
  if (body.refundAmount !== undefined) updates.refundAmount = Number(body.refundAmount)
  if (body.supplierStatus) updates.supplierStatus = body.supplierStatus
  if (body.notes) updates.notes = body.notes

  await db.collection(COLLECTIONS.RETURNS).updateOne({ orgId, id: returnId }, { $set: updates })
  const updated = { ...ret, ...updates }

  await notifyReturnStatus(db, updated, status)
  await writeExpiryAuditLog(db, {
    orgId,
    userId,
    action: `return.${status}`,
    entity: 'expiry_return',
    entityId: returnId,
    previousValue: { status: ret.status },
    newValue: updates,
    reason: body.reason,
    ip: meta.ip,
    ua: meta.ua,
  })

  return { return: updated }
}

export function generateReturnChallan(ret) {
  return {
    challanNumber: ret.challanNumber || `CH-${ret.returnNumber}`,
    returnNumber: ret.returnNumber,
    date: new Date().toISOString().slice(0, 10),
    supplier: ret.supplier,
    items: [{
      productName: ret.productName,
      batchNumber: ret.batchNumber,
      quantity: ret.quantity,
      reason: ret.reason,
    }],
  }
}
