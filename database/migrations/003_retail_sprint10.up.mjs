/** Sprint 10 — retail POS payment orders + barcode lookup indexes */
const INDEXES = [
  { collection: 'retail_payment_orders', key: { orgId: 1, razorpay_order_id: 1 }, options: { name: 'retail_pay_org_order', unique: true, sparse: true } },
  { collection: 'retail_products', key: { orgId: 1, barcode: 1 }, options: { name: 'retail_products_org_barcode', sparse: true } },
  { collection: 'retail_sales', key: { orgId: 1, createdAt: -1 }, options: { name: 'retail_sales_org_createdAt' } },
  { collection: 'lead_attachments', key: { orgId: 1, leadId: 1, createdAt: -1 }, options: { name: 'lead_attachments_org_lead_createdAt' } },
]

export async function up(db, { dryRun = false } = {}) {
  for (const { collection, key, options } of INDEXES) {
    if (dryRun) {
      console.log(`  would create ${collection} ${options.name}`)
      continue
    }
    await db.collection(collection).createIndex(key, { background: true, ...options })
    console.log(`  created ${collection}.${options.name}`)
  }
}
