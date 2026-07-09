/** Enterprise Expiry Management — database indexes */
import { PRODUCT_BATCHES_INDEXES } from '../schemas/product_batches.js'
import { EXPIRY_ALERTS_INDEXES } from '../schemas/expiry_alerts.js'
import { EXPIRY_RETURNS_INDEXES } from '../schemas/expiry_returns.js'
import { INVENTORY_DISPOSALS_INDEXES } from '../schemas/inventory_disposals.js'
import { EXPIRY_FORECASTS_INDEXES } from '../schemas/expiry_forecasts.js'
import { BATCH_MOVEMENTS_INDEXES } from '../schemas/batch_movements.js'
import { EXPIRY_AUDIT_LOGS_INDEXES } from '../schemas/expiry_audit_logs.js'

const COLLECTION_INDEX_MAP = [
  { collection: 'product_batches', indexes: PRODUCT_BATCHES_INDEXES },
  { collection: 'expiry_alerts', indexes: EXPIRY_ALERTS_INDEXES },
  { collection: 'expiry_returns', indexes: EXPIRY_RETURNS_INDEXES },
  { collection: 'inventory_disposals', indexes: INVENTORY_DISPOSALS_INDEXES },
  { collection: 'expiry_forecasts', indexes: EXPIRY_FORECASTS_INDEXES },
  { collection: 'batch_movements', indexes: BATCH_MOVEMENTS_INDEXES },
  { collection: 'expiry_audit_logs', indexes: EXPIRY_AUDIT_LOGS_INDEXES },
]

export async function up(db, { dryRun = false } = {}) {
  for (const { collection, indexes } of COLLECTION_INDEX_MAP) {
    for (const { key, name, unique, sparse } of indexes) {
      const options = { background: true, name }
      if (unique) options.unique = true
      if (sparse) options.sparse = true
      if (dryRun) {
        console.log(`  would create ${collection}.${name}`)
        continue
      }
      await db.collection(collection).createIndex(key, options)
      console.log(`  created ${collection}.${name}`)
    }
  }
}

export async function down(db, { dryRun = false } = {}) {
  for (const { collection, indexes } of COLLECTION_INDEX_MAP) {
    for (const { name } of indexes) {
      if (dryRun) {
        console.log(`  would drop ${collection}.${name}`)
        continue
      }
      try {
        await db.collection(collection).dropIndex(name)
        console.log(`  dropped ${collection}.${name}`)
      } catch {
        /* index may not exist */
      }
    }
  }
}
