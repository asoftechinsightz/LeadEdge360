import { randomUUID } from 'crypto'
import { getDb } from '@/lib/mongo'
import { parseDeviceFromUa } from '@/lib/events/correlation'
import { appendAuditIntegrity } from '@/lib/audit/integrity'

/**
 * Enterprise audit log — BFSI / Government / Healthcare compliance ready.
 */
export async function writeAuditLog({
  orgId,
  userId = null,
  action,
  entity = null,
  entityId = null,
  detail = null,
  previousValue = null,
  newValue = null,
  ip = '',
  ua = '',
  actorType = 'user',
  agentId = null,
  confidence = null,
  explanation = null,
  requestId = null,
  correlationId = null,
  sessionId = null,
}) {
  const db = await getDb()
  const entry = {
    id: randomUUID(),
    orgId,
    userId,
    actorType,
    agentId,
    confidence,
    explanation,
    action,
    entity,
    entityId,
    detail,
    previousValue,
    newValue,
    ip,
    ua,
    browser: parseBrowser(ua),
    device: parseDeviceFromUa(ua),
    requestId,
    correlationId,
    sessionId,
    createdAt: new Date().toISOString(),
  }
  await db.collection('audit_logs').insertOne(entry)
  try {
    entry.integrityHash = await appendAuditIntegrity(db, orgId, entry)
    await db.collection('audit_logs').updateOne({ id: entry.id }, { $set: { integrityHash: entry.integrityHash } })
  } catch {
    /* chain optional in dev */
  }
  return entry
}

function parseBrowser(ua = '') {
  const s = String(ua)
  if (/edg\//i.test(s)) return 'Edge'
  if (/chrome/i.test(s)) return 'Chrome'
  if (/firefox/i.test(s)) return 'Firefox'
  if (/safari/i.test(s)) return 'Safari'
  return 'Unknown'
}

export async function writeAgentAuditLog({
  orgId,
  agentId,
  action,
  entity = null,
  entityId = null,
  detail = null,
  previousValue = null,
  newValue = null,
  confidence = null,
  explanation = null,
  userId = null,
  correlationId = null,
  requestId = null,
}) {
  return writeAuditLog({
    orgId,
    userId,
    action,
    entity,
    entityId,
    detail,
    previousValue,
    newValue,
    actorType: 'agent',
    agentId,
    confidence,
    explanation,
    correlationId,
    requestId,
  })
}

export async function listAuditLogs(orgId, {
  limit = 50,
  entity = null,
  actorType = null,
  correlationId = null,
} = {}) {
  const db = await getDb()
  const filter = { orgId }
  if (entity) filter.entity = entity
  if (actorType) filter.actorType = actorType
  if (correlationId) filter.correlationId = correlationId
  const cap = Math.min(Math.max(Number(limit) || 50, 1), 200)
  const items = await db.collection('audit_logs')
    .find(filter, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .limit(cap)
    .toArray()
  return { success: true, items }
}

export async function getAuditTrailByCorrelation(db, orgId, correlationId) {
  const [events, audits] = await Promise.all([
    db.collection('platform_events')
      .find({ orgId, correlationId }, { projection: { _id: 0 } })
      .sort({ createdAt: 1 })
      .toArray(),
    db.collection('audit_logs')
      .find({ orgId, correlationId }, { projection: { _id: 0 } })
      .sort({ createdAt: 1 })
      .toArray(),
  ])
  return { correlationId, events, audits }
}
