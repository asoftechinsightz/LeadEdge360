import { KIRANA_TEMPLATE_SKUS } from '@/lib/retail/kirana-template'
import { createSku, findOrCreateStoreByName } from '@/lib/retail/inventory/service'

/**
 * 10-minute dukaan setup: org profile, store, SKU seed, payment prefs, progress=100.
 */
export async function runRetailQuickSetup(db, orgId, userId, body, meta = {}) {
  const shopName = String(body.shopName || body.name || '').trim()
  const city = String(body.city || '').trim()
  const phone = String(body.phone || '').trim()
  const gstin = String(body.gstin || '').trim() || null

  if (!shopName || !city || !phone) {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'shopName, city, and phone are required'
    throw err
  }

  const useTemplate = body.seedKiranaTemplate === true || body.useKiranaTemplate === true
  const scanned = Array.isArray(body.scannedBarcodes) ? body.scannedBarcodes : []
  const cashOnly = body.cashOnly === true
  const upiId = String(body.upiId || '').trim() || null

  if (!useTemplate && scanned.length === 0) {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'Select kirana template or scan at least one barcode'
    throw err
  }

  if (!cashOnly && !upiId) {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'UPI ID is required when cash-only is disabled'
    throw err
  }

  const now = new Date().toISOString()

  await db.collection('orgs').updateOne(
    { id: orgId },
    {
      $set: {
        name: shopName,
        city,
        phone,
        gstin,
        retailEnabled: true,
        updatedAt: now,
      },
    },
  )

  await db.collection('onboarding_profiles').updateOne(
    { orgId },
    {
      $set: {
        orgId,
        companyName: shopName,
        city,
        phone,
        gstin,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true },
  )

  const store = await findOrCreateStoreByName(db, orgId, userId, shopName)
  if (city && store.name === shopName) {
    await db.collection('retail_stores').updateOne(
      { orgId, id: store.id },
      { $set: { city, updatedAt: now } },
    )
  }

  await db.collection('retail_settings').updateOne(
    { orgId },
    {
      $set: {
        orgId,
        upiId: cashOnly ? null : upiId,
        cashOnly,
        paymentMethods: cashOnly ? ['cash'] : ['cash', 'upi'],
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true },
  )

  const existingCount = await db.collection('retail_inventory').countDocuments({ orgId })
  let seeded = 0

  if (existingCount === 0) {
    if (useTemplate) {
      for (const item of KIRANA_TEMPLATE_SKUS) {
        await createSku(db, orgId, userId, {
          name: item.name,
          sku: item.sku,
          category: item.category,
          price: item.price,
          stock: item.stock,
          daysOnShelf: item.daysOnShelf,
          store: shopName,
        }, meta)
        seeded += 1
      }
    } else {
      for (const raw of scanned.slice(0, 3)) {
        const barcode = String(raw?.barcode || raw?.sku || raw || '').trim()
        if (!barcode) continue
        const label = String(raw?.name || '').trim() || `सामान ${barcode}`
        await createSku(db, orgId, userId, {
          name: label,
          sku: barcode,
          category: 'other',
          price: Number(raw?.price) || 10,
          stock: Number(raw?.stock) || 20,
          daysOnShelf: 30,
          store: shopName,
        }, meta)
        seeded += 1
      }
    }
  }

  await db.collection('onboarding_progress').updateOne(
    { orgId },
    {
      $set: {
        orgId,
        retailQuickSetup: true,
        retailQuickSetupAt: now,
        shopName,
        city,
        phone,
        completedPercent: 100,
        updatedAt: now,
      },
    },
    { upsert: true },
  )

  return {
    success: true,
    storeId: store.id,
    skuCount: seeded,
    seeded,
  }
}
