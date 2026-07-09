import { randomUUID } from 'crypto'
import { mapInventoryRow } from '@/lib/retail/inventory/service'
import { allocateFefo, applyFefoAllocations, lookupProductForPos } from '@/lib/retail/expiry/fefo'
import { calcRetailGst } from '@/lib/retail/pos/gst'

const SALES = 'retail_sales'
const INVENTORY = 'retail_inventory'
const PRODUCTS = 'retail_products'
const STORES = 'retail_stores'
const BATCHES = 'product_batches'

export async function lookupSku(db, orgId, sku) {
  const code = String(sku || '').trim()
  if (!code) {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'SKU or barcode required'
    throw err
  }

  const batchCount = await db.collection(BATCHES).countDocuments({ orgId })
  if (batchCount > 0) {
    try {
      const { product, batches } = await lookupProductForPos(db, orgId, code)
      return {
        product: {
          ...product,
          inventoryId: product.batchId,
          id: product.batchId,
          stock: product.stock,
          expiryDate: product.expiryDate,
          daysRemaining: product.daysRemaining,
          expiryColor: product.expiryColor,
          batches,
        },
      }
    } catch (e) {
      if (e.message !== 'NOT_FOUND') throw e
    }
  }

  const product = await db.collection(PRODUCTS).findOne({
    orgId,
    $or: [{ sku: code }, { barcode: code }],
  })
  if (!product) {
    const err = new Error('NOT_FOUND')
    err.detail = 'SKU not found'
    throw err
  }

  const inv = await db.collection(INVENTORY).findOne({ orgId, productId: product.id })
  if (!inv) {
    const err = new Error('NOT_FOUND')
    err.detail = 'Inventory row not found'
    throw err
  }

  const store = inv.storeId
    ? await db.collection(STORES).findOne({ orgId, id: inv.storeId })
    : null

  return { product: mapInventoryRow(inv, product, store) }
}

export async function checkout(db, orgId, userId, payload = {}, meta = {}) {
  const items = Array.isArray(payload.items) ? payload.items : []
  if (!items.length) {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'Cart is empty'
    throw err
  }

  const batchCount = await db.collection(BATCHES).countDocuments({ orgId })
  const lineItems = []
  let total = 0
  const fefoAllocations = []

  for (const line of items) {
    const qty = Math.max(1, Number(line.qty || 1))

    if (batchCount > 0 && (line.productId || line.inventoryId)) {
      let productId = line.productId
      if (!productId && line.inventoryId) {
        const inv = await db.collection(INVENTORY).findOne({ orgId, id: line.inventoryId })
        productId = inv?.productId
      }
      if (productId) {
        const fefo = await allocateFefo(db, orgId, userId, {
          productId,
          quantity: qty,
          overrideWarnings: Boolean(payload.overrideWarnings),
        }, { ...meta, userRole: meta.userRole })

        if (fefo.requiresOverride) {
          const err = new Error('VALIDATION_FAILED')
          err.detail = 'Expiry warning — override required'
          err.code = 'EXPIRY_WARNING'
          err.warnings = fefo.warnings
          err.canOverride = fefo.canOverride
          throw err
        }

        const product = await db.collection(PRODUCTS).findOne({ orgId, id: productId })
        const unitPrice = Number(line.unitPrice ?? fefo.allocations[0]?.unitPrice ?? product?.price ?? 0)
        const amount = unitPrice * qty
        total += amount
        lineItems.push({
          inventoryId: line.inventoryId || null,
          productId,
          sku: product?.sku || '',
          name: product?.name || line.name || 'Item',
          qty,
          unitPrice,
          amount,
          fefoAllocations: fefo.allocations,
        })
        fefoAllocations.push(...fefo.allocations.map((a) => ({ ...a, productId, saleQty: qty })))
        continue
      }
    }

    const inv = await db.collection(INVENTORY).findOne({ orgId, id: line.inventoryId || line.id })
    if (!inv) {
      const err = new Error('NOT_FOUND')
      err.detail = `Inventory ${line.inventoryId || line.id} not found`
      throw err
    }
    if (Number(inv.quantity || 0) < qty) {
      const err = new Error('VALIDATION_FAILED')
      err.detail = 'Insufficient stock'
      throw err
    }
    const product = await db.collection(PRODUCTS).findOne({ orgId, id: inv.productId })
    const unitPrice = Number(line.unitPrice ?? product?.price ?? 0)
    const amount = unitPrice * qty
    total += amount
    lineItems.push({
      inventoryId: inv.id,
      productId: product?.id,
      sku: product?.sku || '',
      name: product?.name || line.name || 'Item',
      qty,
      unitPrice,
      amount,
    })
  }

  const gstRate = Number(payload.gstRate ?? 5)
  const gst = calcRetailGst(total, gstRate)

  const now = new Date().toISOString()
  const sale = {
    id: randomUUID(),
    orgId,
    items: lineItems,
    subtotal: gst.subtotal,
    cgst: gst.cgst,
    sgst: gst.sgst,
    gstRate: gst.gstRate,
    totalAmount: gst.totalAmount,
    paymentMethod: payload.paymentMethod || 'cash',
    razorpayOrderId: payload.razorpayOrderId || null,
    razorpayPaymentId: payload.razorpayPaymentId || null,
    storeId: payload.storeId || null,
    status: 'completed',
    fefoApplied: batchCount > 0,
    createdAt: now,
    createdBy: userId,
  }

  await db.collection(SALES).insertOne(sale)

  if (batchCount > 0) {
    for (const line of lineItems) {
      if (line.fefoAllocations?.length) {
        await applyFefoAllocations(db, orgId, userId, line.fefoAllocations, sale.id, {
          overrideWarnings: Boolean(payload.overrideWarnings),
          reason: payload.overrideReason,
          ip: meta.ip,
          ua: meta.ua,
        })
      }
    }
  } else {
    for (const line of lineItems) {
      if (line.inventoryId) {
        await db.collection(INVENTORY).updateOne(
          { orgId, id: line.inventoryId },
          { $inc: { quantity: -line.qty }, $set: { updatedAt: now } },
        )
      }
    }
  }

  return {
    sale,
    saleId: sale.id,
    subtotal: sale.subtotal,
    cgst: sale.cgst,
    sgst: sale.sgst,
    gstRate: sale.gstRate,
    totalAmount: sale.totalAmount,
  }
}

export async function listSales(db, orgId, { limit = 50 } = {}) {
  const items = await db.collection(SALES)
    .find({ orgId }, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .limit(Math.min(limit, 100))
    .toArray()
  return { items, total: items.length }
}
