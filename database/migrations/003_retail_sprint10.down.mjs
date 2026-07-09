const NAMES = [
  { collection: 'retail_payment_orders', name: 'retail_pay_org_order' },
  { collection: 'retail_products', name: 'retail_products_org_barcode' },
  { collection: 'retail_sales', name: 'retail_sales_org_createdAt' },
  { collection: 'lead_attachments', name: 'lead_attachments_org_lead_createdAt' },
]

export async function down(db) {
  for (const { collection, name } of NAMES) {
    try {
      await db.collection(collection).dropIndex(name)
      console.log(`  dropped ${collection}.${name}`)
    } catch {
      /* ok */
    }
  }
}
