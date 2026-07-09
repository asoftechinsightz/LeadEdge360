import { randomUUID } from 'crypto'
import { writeAuditLog } from '@/lib/audit/service'
import { sendWhatsApp } from '@/lib/whatsapp'
import { getWhatsAppTemplate, renderTemplateBody } from '@/lib/whatsapp/templates'
import { trackWhatsAppReplied } from '@/lib/analytics/track-whatsapp'

const THREADS = 'whatsapp_threads'
const MESSAGES = 'whatsapp_messages'

function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60_000) return 'Just now'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return d.toLocaleDateString()
}

export function mapThread(doc) {
  return {
    id: doc.id,
    contact: doc.contactName || doc.contactPhone || 'Contact',
    channel: 'whatsapp',
    preview: doc.preview || '',
    time: formatTime(doc.lastMessageAt || doc.updatedAt),
    unread: (doc.unreadCount || 0) > 0,
    updatedAt: doc.lastMessageAt || doc.updatedAt,
    contactPhone: doc.contactPhone,
    leadId: doc.leadId || '',
  }
}

export async function listThreads(db, orgId, { page = 1, pageSize = 50 } = {}) {
  const safePage = Math.max(1, parseInt(page, 10) || 1)
  const safeSize = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 50))
  const skip = (safePage - 1) * safeSize

  const [items, total] = await Promise.all([
    db.collection(THREADS).find({ orgId }, { projection: { _id: 0 } })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .skip(skip)
      .limit(safeSize)
      .toArray(),
    db.collection(THREADS).countDocuments({ orgId }),
  ])

  return {
    items: items.map(mapThread),
    pagination: {
      page: safePage,
      pageSize: safeSize,
      total,
      totalPages: Math.ceil(total / safeSize) || 0,
      hasMore: skip + items.length < total,
    },
  }
}

export async function getThread(db, orgId, id) {
  const doc = await db.collection(THREADS).findOne({ orgId, id }, { projection: { _id: 0 } })
  if (!doc) {
    const err = new Error('NOT_FOUND')
    throw err
  }
  return mapThread(doc)
}

export async function listMessages(db, orgId, threadId, { limit = 100 } = {}) {
  const thread = await getThread(db, orgId, threadId)
  const messages = await db.collection(MESSAGES)
    .find({ orgId, threadId }, { projection: { _id: 0 } })
    .sort({ createdAt: 1 })
    .limit(Math.min(200, parseInt(limit, 10) || 100))
    .toArray()

  await db.collection(THREADS).updateOne(
    { orgId, id: threadId },
    { $set: { unreadCount: 0, updatedAt: new Date().toISOString() } },
  )

  return { thread, messages }
}

async function ensureThread(db, orgId, userId, { contactName, contactPhone, leadId = '' }) {
  const phone = String(contactPhone || '').trim()
  if (!phone) {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'contactPhone is required'
    throw err
  }

  const existing = await db.collection(THREADS).findOne({ orgId, contactPhone: phone })
  if (existing) return existing

  const now = new Date().toISOString()
  const doc = {
    id: randomUUID(),
    orgId,
    contactName: String(contactName || '').trim(),
    contactPhone: phone,
    leadId: String(leadId || '').trim(),
    channel: 'whatsapp',
    preview: '',
    unreadCount: 0,
    lastMessageAt: now,
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
    updatedBy: userId,
  }
  await db.collection(THREADS).insertOne(doc)
  return doc
}

export async function sendMessage(db, orgId, userId, threadId, body, meta = {}) {
  const templateName = String(body.templateName || '').trim()
  const templateParams = Array.isArray(body.params) ? body.params : []
  let text = String(body.text || body.message || '').trim()

  if (templateName) {
    const template = getWhatsAppTemplate(templateName)
    if (!template) {
      const err = new Error('VALIDATION_FAILED')
      err.detail = 'Unknown template'
      throw err
    }
    text = renderTemplateBody(template, templateParams)
  }

  if (!text) {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'text is required'
    throw err
  }

  let thread = await db.collection(THREADS).findOne({ orgId, id: threadId })
  if (!thread && body.contactPhone) {
    thread = await ensureThread(db, orgId, userId, {
      contactName: body.contactName,
      contactPhone: body.contactPhone,
      leadId: body.leadId,
    })
    threadId = thread.id
  }
  if (!thread) {
    const err = new Error('NOT_FOUND')
    throw err
  }

  const now = new Date().toISOString()
  const message = {
    id: randomUUID(),
    orgId,
    threadId: thread.id,
    direction: 'outbound',
    body: text,
    msgType: templateName ? 'template' : 'text',
    templateName: templateName || null,
    params: templateName ? templateParams : [],
    status: 'sent',
    createdAt: now,
    createdBy: userId,
  }

  await db.collection(MESSAGES).insertOne(message)
  await db.collection(THREADS).updateOne(
    { orgId, id: thread.id },
    {
      $set: {
        preview: text.slice(0, 160),
        lastMessageAt: now,
        updatedAt: now,
        updatedBy: userId,
      },
    },
  )

  if (thread.contactPhone) {
    const waPayload = templateName
      ? { to: thread.contactPhone.replace(/^\+/, ''), templateName, params: templateParams }
      : { to: thread.contactPhone.replace(/^\+/, ''), text }
    const wa = await sendWhatsApp(waPayload)
    const patch = { status: wa.ok ? 'sent' : 'queued' }
    if (wa.waMessageId) patch.waMessageId = wa.waMessageId
    await db.collection(MESSAGES).updateOne(
      { orgId, id: message.id },
      { $set: patch },
    )
    message.waMessageId = patch.waMessageId || null
    message.status = patch.status

    if (wa.ok && wa.waMessageId) {
      const { trackWhatsAppDelivered } = await import('@/lib/analytics/track-whatsapp')
      await trackWhatsAppDelivered(db, {
        orgId,
        leadId: thread.leadId || body.leadId || '',
        threadId: thread.id,
        messageId: message.id,
        templateName: templateName || '',
        userId,
        waMessageId: wa.waMessageId,
        metadata: { providerAck: true },
      })
    }
  }

  await writeAuditLog({
    orgId,
    userId,
    action: 'whatsapp.message.send',
    entity: 'whatsapp_thread',
    entityId: thread.id,
    ip: meta.ip,
    ua: meta.ua,
  })

  return { thread: mapThread({ ...thread, preview: text, lastMessageAt: now }), message }
}

export async function recordInboundMessage(db, orgId, { contactPhone, contactName, text, leadId = '' }) {
  const thread = await ensureThread(db, orgId, 'system', { contactPhone, contactName, leadId })
  const now = new Date().toISOString()
  const message = {
    id: randomUUID(),
    orgId,
    threadId: thread.id,
    direction: 'inbound',
    body: String(text || '').trim(),
    status: 'received',
    createdAt: now,
    createdBy: 'system',
  }
  await db.collection(MESSAGES).insertOne(message)
  await db.collection(THREADS).updateOne(
    { orgId, id: thread.id },
    {
      $set: {
        preview: message.body.slice(0, 160),
        lastMessageAt: now,
        updatedAt: now,
        contactName: contactName || thread.contactName,
        leadId: leadId || thread.leadId,
      },
      $inc: { unreadCount: 1 },
    },
  )

  if (leadId) {
    await trackWhatsAppReplied(db, {
      orgId,
      leadId,
      threadId: thread.id,
      messageId: message.id,
      metadata: { inbound: true },
    })
  }

  return { thread: mapThread(thread), message }
}
