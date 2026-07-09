import crypto from 'crypto'

export function computeAuditIntegrityHash(previousHash, entry) {
  const payload = JSON.stringify({
    previousHash: previousHash || '',
    id: entry.id,
    orgId: entry.orgId,
    action: entry.action,
    entity: entry.entity,
    entityId: entry.entityId,
    createdAt: entry.createdAt,
  })
  return crypto.createHash('sha256').update(payload).digest('hex')
}

export async function appendAuditIntegrity(db, orgId, entry) {
  const col = db.collection('audit_log_chain')
  const prev = await col.findOne({ orgId }, { sort: { seq: -1 } })
  const seq = (prev?.seq || 0) + 1
  const previousHash = prev?.integrityHash || ''
  const integrityHash = computeAuditIntegrityHash(previousHash, entry)
  await col.insertOne({
    orgId,
    auditId: entry.id,
    seq,
    previousHash,
    integrityHash,
    createdAt: entry.createdAt,
  })
  return integrityHash
}
