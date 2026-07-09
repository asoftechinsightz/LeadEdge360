const NAMES = [
  { collection: 'auth_otp_rate_limits', name: 'auth_otp_rate_key' },
  { collection: 'auth_login_attempts', name: 'auth_login_attempt_type_value' },
  { collection: 'auth_login_anomalies', name: 'auth_login_anomalies_createdAt' },
  { collection: 'audit_log_chain', name: 'audit_log_chain_org_seq' },
]

export async function down(db) {
  for (const { collection, name } of NAMES) {
    try {
      await db.collection(collection).dropIndex(name)
    } catch {
      /* ok */
    }
  }
}
