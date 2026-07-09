import { randomUUID } from 'crypto'
import { getDb } from '@/lib/mongo'

const COLLECTION = 'integration_audit_logs'

export async function ensureAuditIndexes(db) {
  await db.collection(COLLECTION).createIndex(
    { orgId: 1, integrationId: 1, createdAt: -1 },
    { name: 'integration_audit_org_integration_created' },
  )
  await db.collection(COLLECTION).createIndex(
    { orgId: 1, createdAt: -1 },
    { name: 'integration_audit_org_created' },
  )
}

export async function logIntegrationAudit(db, {
  orgId,
  integrationId,
  action,
  userId = null,
  userEmail = null,
  detail = null,
  ip = null,
}) {
  const entry = {
    id: randomUUID(),
    orgId,
    integrationId,
    action,
    userId,
    userEmail,
    detail,
    ip,
    createdAt: new Date().toISOString(),
  }
  await db.collection(COLLECTION).insertOne(entry)
  return entry
}

export async function listIntegrationAudit(db, orgId, { integrationId, limit = 50 } = {}) {
  const filter = { orgId }
  if (integrationId) filter.integrationId = integrationId
  return db.collection(COLLECTION)
    .find(filter, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .limit(Math.min(limit, 200))
    .toArray()
}
