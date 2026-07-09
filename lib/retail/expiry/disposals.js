import { randomUUID } from 'crypto'
import { COLLECTIONS } from './constants.js'
import { writeExpiryAuditLog } from './audit.js'
import { notifyDisposalStatus } from './notifications.js'
import { recordBatchMovement } from './movements.js'
import { syncInventoryFromBatches } from './batches.js'

function generateDisposalNumber() {
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const seq = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `DSP-${d}-${seq}`
}

export async function createDisposal(db, orgId, userId, body, meta = {}) {
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
    err.detail = 'Disposal quantity exceeds available stock'
    throw err
  }

  const now = new Date().toISOString()
  const financialLoss = Number(batch.purchasePrice || 0) * quantity

  const disposal = {
    id: randomUUID(),
    orgId,
    disposalNumber: generateDisposalNumber(),
    batchId: batch.id,
    batchNumber: batch.batchNumber,
    productId: batch.productId,
    productName: batch.productName,
    quantity,
    reason: body.reason || 'expired',
    status: 'pending',
    disposalMethod: body.disposalMethod || null,
    disposalDate: null,
    financialLoss,
    images: Array.isArray(body.images) ? body.images : [],
    notes: body.notes || '',
    approvedBy: null,
    approvedAt: null,
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
    updatedBy: userId,
  }

  await db.collection(COLLECTIONS.DISPOSALS).insertOne(disposal)

  await writeExpiryAuditLog(db, {
    orgId,
    userId,
    action: 'disposal.create',
    entity: 'inventory_disposal',
    entityId: disposal.id,
    newValue: { disposalNumber: disposal.disposalNumber, quantity, financialLoss },
    ip: meta.ip,
    ua: meta.ua,
  })

  return { disposal }
}

export async function listDisposals(db, orgId, { status, reason, page = 1, limit = 25 } = {}) {
  const filter = { orgId }
  if (status) filter.status = status
  if (reason) filter.reason = reason
  const cap = Math.min(Math.max(limit, 1), 100)
  const skip = (Math.max(page, 1) - 1) * cap
  const [items, total] = await Promise.all([
    db.collection(COLLECTIONS.DISPOSALS).find(filter, { projection: { _id: 0 } }).sort({ createdAt: -1 }).skip(skip).limit(cap).toArray(),
    db.collection(COLLECTIONS.DISPOSALS).countDocuments(filter),
  ])
  return { items, total, page, limit: cap, pages: Math.ceil(total / cap) || 1 }
}

export async function getDisposal(db, orgId, disposalId) {
  const disposal = await db.collection(COLLECTIONS.DISPOSALS).findOne({ orgId, id: disposalId }, { projection: { _id: 0 } })
  if (!disposal) {
    const err = new Error('NOT_FOUND')
    throw err
  }
  return { disposal }
}

export async function updateDisposalStatus(db, orgId, userId, disposalId, body, meta = {}) {
  const disposal = await db.collection(COLLECTIONS.DISPOSALS).findOne({ orgId, id: disposalId })
  if (!disposal) {
    const err = new Error('NOT_FOUND')
    throw err
  }

  const status = body.status
  const now = new Date().toISOString()
  const updates = { status, updatedAt: now, updatedBy: userId }

  if (status === 'approved') {
    updates.approvedBy = userId
    updates.approvedAt = now
  }

  if (status === 'completed') {
    updates.disposalDate = body.disposalDate || now
    updates.disposalMethod = body.disposalMethod || disposal.disposalMethod || 'incineration'

    const batch = await db.collection(COLLECTIONS.BATCHES).findOne({ orgId, id: disposal.batchId })
    if (batch) {
      const qtyBefore = Number(batch.quantityAvailable || 0)
      const qtyAfter = qtyBefore - disposal.quantity
      await db.collection(COLLECTIONS.BATCHES).updateOne(
        { orgId, id: disposal.batchId },
        {
          $inc: { quantityAvailable: -disposal.quantity, quantityDestroyed: disposal.quantity },
          $set: {
            updatedAt: now,
            updatedBy: userId,
            batchStatus: qtyAfter <= 0 ? 'depleted' : batch.batchStatus,
          },
        },
      )
      await recordBatchMovement(db, {
        orgId,
        batchId: disposal.batchId,
        batchNumber: disposal.batchNumber,
        productId: disposal.productId,
        movementType: 'disposal',
        quantity: -disposal.quantity,
        quantityBefore: qtyBefore,
        quantityAfter: qtyAfter,
        referenceType: 'inventory_disposal',
        referenceId: disposal.id,
        userId,
      })
      await syncInventoryFromBatches(db, orgId, disposal.productId, batch.warehouseId)
    }
  }

  if (body.notes) updates.notes = body.notes
  if (body.images) updates.images = body.images

  await db.collection(COLLECTIONS.DISPOSALS).updateOne({ orgId, id: disposalId }, { $set: updates })
  const updated = { ...disposal, ...updates }

  await notifyDisposalStatus(db, updated, status)
  await writeExpiryAuditLog(db, {
    orgId,
    userId,
    action: `disposal.${status}`,
    entity: 'inventory_disposal',
    entityId: disposalId,
    previousValue: { status: disposal.status },
    newValue: updates,
    reason: body.reason,
    ip: meta.ip,
    ua: meta.ua,
  })

  return { disposal: updated }
}
