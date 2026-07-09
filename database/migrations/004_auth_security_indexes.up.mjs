/** RC2 — auth rate limit + audit chain indexes */
const INDEXES = [
  { collection: 'auth_otp_rate_limits', key: { key: 1 }, options: { name: 'auth_otp_rate_key' } },
  { collection: 'auth_login_attempts', key: { type: 1, value: 1 }, options: { name: 'auth_login_attempt_type_value' } },
  { collection: 'auth_login_anomalies', key: { createdAt: -1 }, options: { name: 'auth_login_anomalies_createdAt' } },
  { collection: 'audit_log_chain', key: { orgId: 1, seq: -1 }, options: { name: 'audit_log_chain_org_seq' } },
]

export async function up(db, { dryRun = false } = {}) {
  for (const { collection, key, options } of INDEXES) {
    if (dryRun) {
      console.log(`  would create ${collection}.${options.name}`)
      continue
    }
    await db.collection(collection).createIndex(key, { background: true, ...options })
  }
}
