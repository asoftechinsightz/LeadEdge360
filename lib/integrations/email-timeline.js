import { randomUUID } from 'crypto'

/**
 * Find a lead by email address (case-insensitive).
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 * @param {string} email
 */
export async function findLeadByEmail(db, orgId, email) {
  const normalized = String(email || '').trim().toLowerCase()
  if (!normalized) return null
  return db.collection('leads').findOne(
    { orgId, email: normalized },
    { projection: { _id: 0, id: 1, name: 1, email: 1 } },
  )
}

/**
 * Extract email from "Name <addr@domain.com>" or plain address.
 * @param {string} raw
 */
export function parseEmailAddress(raw) {
  const s = String(raw || '').trim()
  const angle = s.match(/<([^>]+)>/)
  if (angle) return angle[1].trim().toLowerCase()
  if (s.includes('@')) return s.toLowerCase()
  return ''
}

/**
 * Log an email to lead timeline + email_logs (idempotent by externalMessageId).
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 * @param {object} input
 */
export async function logEmailToLeadTimeline(db, orgId, input) {
  const {
    leadId,
    direction = 'inbound',
    subject = '',
    from = '',
    to = '',
    bodyPreview = '',
    provider = 'email',
    externalMessageId = '',
    threadId = '',
  } = input

  if (!leadId) return { skipped: true, reason: 'no_lead' }

  if (externalMessageId) {
    const exists = await db.collection('email_logs').findOne({ orgId, externalMessageId, provider })
    if (exists) return { skipped: true, reason: 'duplicate', id: exists.id }
  }

  const now = new Date().toISOString()
  const logId = randomUUID()

  await db.collection('email_logs').insertOne({
    id: logId,
    orgId,
    leadId,
    direction,
    subject: String(subject).slice(0, 500),
    from: parseEmailAddress(from) || from,
    to: parseEmailAddress(to) || to,
    bodyPreview: String(bodyPreview).slice(0, 1000),
    provider,
    externalMessageId: externalMessageId || null,
    threadId: threadId || null,
    syncedAt: now,
    createdAt: now,
  })

  await db.collection('lead_timeline').insertOne({
    id: randomUUID(),
    orgId,
    leadId,
    type: direction === 'outbound' ? 'email_sent' : 'email_received',
    payload: {
      subject: String(subject).slice(0, 200),
      from: parseEmailAddress(from) || from,
      to: parseEmailAddress(to) || to,
      provider,
      externalMessageId: externalMessageId || null,
      preview: String(bodyPreview).slice(0, 280),
    },
    actorType: 'integration',
    actorName: provider === 'gmail' ? 'Gmail Sync' : provider === 'outlook' ? 'Outlook Sync' : 'Email Sync',
    createdAt: now,
  })

  await db.collection('leads').updateOne(
    { orgId, id: leadId },
    { $set: { lastEmailSyncAt: now, updatedAt: now } },
  )

  return { logged: true, id: logId, leadId }
}

/**
 * Resolve lead id from from/to based on direction.
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 * @param {{ direction?: string, from?: string, to?: string }} msg
 */
export async function resolveLeadForEmail(db, orgId, msg) {
  const counterparty = msg.direction === 'outbound'
    ? parseEmailAddress(msg.to)
    : parseEmailAddress(msg.from)
  if (!counterparty) return null
  const lead = await findLeadByEmail(db, orgId, counterparty)
  return lead?.id || null
}
