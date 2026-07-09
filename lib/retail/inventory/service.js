import { randomUUID } from 'crypto'
import { predictShelfLife } from '@/lib/retail-ai'
import { writeAuditLog } from '@/lib/audit/service'
import { createBatch } from '@/lib/retail/expiry/batches'

const STORES = 'retail_stores'
const PRODUCTS = 'retail_products'
const INVENTORY = 'retail_inventory'
const LEGACY = 'products'

function addDays(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

export function mapInventoryRow(inv, product, store) {
  return {
    id: inv.id,
    inventoryId: inv.id,
    productId: product?.id,
    storeId: store?.id,
    orgId: inv.orgId,
    name: product?.name || '',
    sku: product?.sku || '',
    category: product?.category || 'other',
    price: Number(product?.price || 0),
    stock: Number(inv.quantity || 0),
    daysOnShelf: Number(inv.daysOnShelf || 0),
    expiryDate: inv.expiryDate || null,
    store: store?.name || 'Default Store',
    predictedShelfDays: product?.predictedShelfDays,
    risk: product?.risk || 'Medium',
    recommendation: product?.recommendation || '',
    reasoning: product?.reasoning || [],
    engine: product?.engine || 'rules',
    createdAt: inv.createdAt,
    updatedAt: inv.updatedAt,
  }
}

export async function ensureDefaultStore(db, orgId, userId) {
  const existing = await db.collection(STORES).findOne({ orgId, code: 'DEFAULT' })
  if (existing) return existing

  const now = new Date().toISOString()
  const store = {
    id: randomUUID(),
    orgId,
    code: 'DEFAULT',
    name: 'Default Store',
    active: true,
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
    updatedBy: userId,
  }
  await db.collection(STORES).insertOne(store)
  return store
}

export async function findOrCreateStoreByName(db, orgId, userId, name) {
  const trimmed = String(name || '').trim()
  if (!trimmed || trimmed === 'Default Store') {
    return ensureDefaultStore(db, orgId, userId)
  }
  const existing = await db.collection(STORES).findOne({ orgId, name: trimmed })
  if (existing) return existing

  const now = new Date().toISOString()
  const code = trimmed.toUpperCase().replace(/[^A-Z0-9]+/g, '-').slice(0, 24) || `STORE-${randomUUID().slice(0, 6)}`
  const store = {
    id: randomUUID(),
    orgId,
    code,
    name: trimmed,
    active: true,
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
    updatedBy: userId,
  }
  await db.collection(STORES).insertOne(store)
  return store
}

export async function migrateLegacyProducts(db, orgId, userId) {
  const modernCount = await db.collection(INVENTORY).countDocuments({ orgId })
  if (modernCount > 0) return false

  const legacy = await db.collection(LEGACY).find({ orgId }).toArray()
  if (!legacy.length) return false

  for (const p of legacy) {
    const store = await findOrCreateStoreByName(db, orgId, userId, p.store)
    const now = new Date().toISOString()
    const productId = p.id || randomUUID()

    const product = {
      id: productId,
      orgId,
      sku: String(p.sku || productId),
      name: String(p.name || 'Product'),
      category: String(p.category || 'other').toLowerCase(),
      price: Number(p.price || 0),
      unit: 'pcs',
      active: true,
      predictedShelfDays: p.predictedShelfDays,
      risk: p.risk,
      recommendation: p.recommendation,
      reasoning: p.reasoning,
      engine: p.engine,
      createdAt: typeof p.createdAt === 'string' ? p.createdAt : now,
      updatedAt: now,
      createdBy: userId,
      updatedBy: userId,
    }
    await db.collection(PRODUCTS).updateOne({ orgId, id: productId }, { $set: product }, { upsert: true })

    await db.collection(INVENTORY).updateOne(
      { orgId, storeId: store.id, productId },
      {
        $set: {
          id: randomUUID(),
          orgId,
          storeId: store.id,
          productId,
          quantity: Number(p.stock || 0),
          reservedQty: 0,
          reorderLevel: 10,
          daysOnShelf: Number(p.daysOnShelf || 0),
          expiryDate: p.expiryDate || addDays(30),
          updatedAt: now,
          updatedBy: userId,
        },
        $setOnInsert: {
          createdAt: now,
          createdBy: userId,
        },
      },
      { upsert: true },
    )
  }
  return true
}

async function loadInventoryView(db, orgId) {
  const rows = await db.collection(INVENTORY).find({ orgId }, { projection: { _id: 0 } }).toArray()
  if (!rows.length) return []

  const productIds = [...new Set(rows.map((r) => r.productId))]
  const storeIds = [...new Set(rows.map((r) => r.storeId))]

  const [products, stores] = await Promise.all([
    db.collection(PRODUCTS).find({ orgId, id: { $in: productIds } }, { projection: { _id: 0 } }).toArray(),
    db.collection(STORES).find({ orgId, id: { $in: storeIds } }, { projection: { _id: 0 } }).toArray(),
  ])

  const productMap = Object.fromEntries(products.map((p) => [p.id, p]))
  const storeMap = Object.fromEntries(stores.map((s) => [s.id, s]))

  return rows
    .map((inv) => mapInventoryRow(inv, productMap[inv.productId], storeMap[inv.storeId]))
    .sort((a, b) => (a.predictedShelfDays || 999) - (b.predictedShelfDays || 999))
}

export async function listInventory(db, orgId, userId) {
  await migrateLegacyProducts(db, orgId, userId)
  const items = await loadInventoryView(db, orgId)
  return { items, products: items }
}

export async function getRetailKpis(db, orgId, userId) {
  const { items } = await listInventory(db, orgId, userId)
  const total = items.length
  const highRisk = items.filter((p) => p.risk === 'High').length
  const medRisk = items.filter((p) => p.risk === 'Medium').length
  const lowRisk = items.filter((p) => p.risk === 'Low').length
  const inventoryValue = items.reduce((s, p) => s + (p.price || 0) * (p.stock || 0), 0)
  const atRiskValue = items
    .filter((p) => p.risk === 'High')
    .reduce((s, p) => s + (p.price || 0) * (p.stock || 0), 0)

  const byCategory = {}
  for (const p of items) {
    byCategory[p.category] = byCategory[p.category] || { name: p.category, count: 0, value: 0 }
    byCategory[p.category].count += 1
    byCategory[p.category].value += (p.price || 0) * (p.stock || 0)
  }

  return {
    total,
    highRisk,
    medRisk,
    lowRisk,
    inventoryValue,
    atRiskValue,
    savedSoFar: Math.round(atRiskValue * 0.65),
    byRisk: [
      { name: 'High', value: highRisk },
      { name: 'Medium', value: medRisk },
      { name: 'Low', value: lowRisk },
    ],
    byCategory: Object.values(byCategory),
  }
}

export async function createSku(db, orgId, userId, body, meta = {}) {
  const name = String(body.name || '').trim()
  const sku = String(body.sku || '').trim()
  if (!name || !sku) {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'name and sku are required'
    throw err
  }

  const store = await findOrCreateStoreByName(db, orgId, userId, body.store)
  const predInput = {
    name,
    sku,
    category: (body.category || 'other').toLowerCase(),
    price: Number(body.price || 0),
    stock: Number(body.stock || 0),
    daysOnShelf: Number(body.daysOnShelf || 0),
    expiryDate: body.expiryDate,
    store: store.name,
  }
  const pred = await predictShelfLife(predInput)
  const now = new Date().toISOString()

  let product = await db.collection(PRODUCTS).findOne({ orgId, sku })
  if (!product) {
    product = {
      id: randomUUID(),
      orgId,
      sku,
      name,
      category: predInput.category,
      price: predInput.price,
      unit: body.unit || 'pcs',
      active: true,
      ...pred,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      updatedBy: userId,
    }
    await db.collection(PRODUCTS).insertOne(product)
  } else {
    await db.collection(PRODUCTS).updateOne(
      { orgId, id: product.id },
      {
        $set: {
          name,
          category: predInput.category,
          price: predInput.price,
          ...pred,
          updatedAt: now,
          updatedBy: userId,
        },
      },
    )
    product = { ...product, name, category: predInput.category, price: predInput.price, ...pred }
  }

  const invExisting = await db.collection(INVENTORY).findOne({ orgId, storeId: store.id, productId: product.id })
  let inv
  if (invExisting) {
    await db.collection(INVENTORY).updateOne(
      { orgId, id: invExisting.id },
      {
        $set: {
          quantity: Number(body.stock || 0) + Number(invExisting.quantity || 0),
          daysOnShelf: predInput.daysOnShelf,
          expiryDate: body.expiryDate || invExisting.expiryDate || addDays(30),
          updatedAt: now,
          updatedBy: userId,
        },
      },
    )
    inv = { ...invExisting, quantity: Number(body.stock || 0) + Number(invExisting.quantity || 0) }
  } else {
    inv = {
      id: randomUUID(),
      orgId,
      storeId: store.id,
      productId: product.id,
      quantity: Number(body.stock || 0),
      reservedQty: 0,
      reorderLevel: Number(body.reorderLevel || 10),
      daysOnShelf: predInput.daysOnShelf,
      expiryDate: body.expiryDate || addDays(30),
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      updatedBy: userId,
    }
    await db.collection(INVENTORY).insertOne(inv)
  }

  await writeAuditLog({
    orgId,
    userId,
    action: 'retail.sku.create',
    entity: 'retail_inventory',
    entityId: inv.id,
    ip: meta.ip,
    ua: meta.ua,
  })

  if (Number(body.stock || 0) > 0) {
    try {
      await createBatch(db, orgId, userId, {
        productId: product.id,
        warehouseId: store.id,
        supplier: body.supplier || 'Default Supplier',
        manufacturingDate: body.manufacturingDate,
        expiryDate: body.expiryDate || inv.expiryDate,
        purchaseDate: now,
        purchasePrice: predInput.price,
        sellingPrice: predInput.price,
        quantityPurchased: Number(body.stock || 0),
        shelf: body.shelf,
        barcode: body.barcode || product.barcode,
        reason: 'Auto-created from SKU purchase',
      }, meta)
    } catch {
      /* batch creation optional if duplicate batch number */
    }
  }

  const mapped = mapInventoryRow(inv, product, store)
  return { product: mapped, data: mapped }
}

export async function repredictSku(db, orgId, userId, inventoryId, meta = {}) {
  const inv = await db.collection(INVENTORY).findOne({ orgId, id: inventoryId })
  if (!inv) {
    const err = new Error('NOT_FOUND')
    throw err
  }

  const [product, store] = await Promise.all([
    db.collection(PRODUCTS).findOne({ orgId, id: inv.productId }),
    db.collection(STORES).findOne({ orgId, id: inv.storeId }),
  ])
  if (!product) {
    const err = new Error('NOT_FOUND')
    throw err
  }

  const pred = await predictShelfLife({
    ...product,
    stock: inv.quantity,
    daysOnShelf: inv.daysOnShelf,
    expiryDate: inv.expiryDate,
    store: store?.name,
  })
  const now = new Date().toISOString()

  await db.collection(PRODUCTS).updateOne(
    { orgId, id: product.id },
    { $set: { ...pred, updatedAt: now, updatedBy: userId } },
  )

  await writeAuditLog({
    orgId,
    userId,
    action: 'retail.sku.repredict',
    entity: 'retail_product',
    entityId: product.id,
    ip: meta.ip,
    ua: meta.ua,
  })

  const updated = { ...product, ...pred }
  return { product: mapInventoryRow(inv, updated, store) }
}

export async function deleteSku(db, orgId, userId, inventoryId, meta = {}) {
  const inv = await db.collection(INVENTORY).findOne({ orgId, id: inventoryId })
  if (!inv) {
    const err = new Error('NOT_FOUND')
    throw err
  }

  await db.collection(INVENTORY).deleteOne({ orgId, id: inventoryId })
  const remaining = await db.collection(INVENTORY).countDocuments({ orgId, productId: inv.productId })
  if (remaining === 0) {
    await db.collection(PRODUCTS).deleteOne({ orgId, id: inv.productId })
  }

  await writeAuditLog({
    orgId,
    userId,
    action: 'retail.sku.delete',
    entity: 'retail_inventory',
    entityId: inventoryId,
    ip: meta.ip,
    ua: meta.ua,
  })

  return { ok: true }
}

export async function listStores(db, orgId, userId) {
  await ensureDefaultStore(db, orgId, userId)
  const items = await db.collection(STORES)
    .find({ orgId }, { projection: { _id: 0 } })
    .sort({ name: 1 })
    .toArray()
  return { items }
}
