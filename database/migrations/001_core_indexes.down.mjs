/**
 * Rollback: drop named indexes created by 001 (non-destructive to data).
 */
const INDEX_NAMES = [
  'users_email_unique', 'users_orgId', 'leads_orgId_id', 'leads_orgId_createdAt',
  'leads_orgId_status', 'opportunities_orgId_id', 'customers_orgId_id',
  'audit_logs_orgId_createdAt', 'auth_refresh_tokens_tokenHash_unique',
]

export async function down(db) {
  const collections = await db.listCollections().toArray()
  const names = new Set(collections.map((c) => c.name))
  for (const coll of names) {
    const indexes = await db.collection(coll).indexes()
    for (const idx of indexes) {
      if (INDEX_NAMES.includes(idx.name)) {
        await db.collection(coll).dropIndex(idx.name)
        console.log(`  dropped ${coll}.${idx.name}`)
      }
    }
  }
}
