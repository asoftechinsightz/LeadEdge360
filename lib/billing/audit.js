import { v4 as uuid } from 'uuid'

export async function writeAuditLog(db, { orgId, userId, action, entity, entityId, diff, request }) {
  await db.collection('audit_logs').insertOne({
    id: uuid(),
    orgId,
    userId: userId || null,
    action,
    entity,
    entityId,
    diff: diff || {},
    ip: request?.headers?.get('x-forwarded-for') || '',
    userAgent: request?.headers?.get('user-agent') || '',
    createdAt: new Date().toISOString(),
  })
}
