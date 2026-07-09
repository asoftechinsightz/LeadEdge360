import { randomBytes, randomUUID } from 'crypto'
import { writeAuditLog } from '@/lib/audit/service'
import { qrImageUrl } from './generate'
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, QR_TYPE_SET, normalizeQrType } from './constants'

const COLLECTION = 'qr_codes'

function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '')
}

function normalizeUrl(url, base) {
  const trimmed = String(url || '').trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
  const root = base.replace(/\/$/, '')
  return `${root}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`
}

export function publicBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
}

export function publicScanUrl(code) {
  return `${publicBaseUrl().replace(/\/$/, '')}/q/${code}`
}

async function ensureUniqueCode(db) {
  for (let i = 0; i < 10; i++) {
    const code = randomBytes(5).toString('base64url').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toLowerCase()
    const existing = await db.collection(COLLECTION).findOne({ code })
    if (!existing) return code
  }
  const err = new Error('VALIDATION_FAILED')
  err.detail = 'Could not allocate unique QR code'
  throw err
}

function pickBody(body = {}) {
  const type = normalizeQrType(body.type)
  if (!QR_TYPE_SET.has(type)) {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'type must be business_card, whatsapp, review, website, lead_form, or custom_url'
    throw err
  }
  return {
    type,
    targetId: String(body.targetId || '').trim(),
    label: String(body.label || '').trim(),
    payload: body.payload && typeof body.payload === 'object' ? body.payload : {},
    active: body.active !== false,
  }
}

async function validateTarget(db, orgId, type, targetId, payload) {
  if (type === 'business_card') {
    if (!targetId) {
      const err = new Error('VALIDATION_FAILED')
      err.detail = 'targetId (business card id) is required'
      throw err
    }
    const card = await db.collection('business_cards').findOne({ orgId, id: targetId })
    if (!card) {
      const err = new Error('NOT_FOUND')
      err.detail = 'Business card not found'
      throw err
    }
    if (!card.published) {
      const err = new Error('VALIDATION_FAILED')
      err.detail = 'Publish the business card before creating a QR code'
      throw err
    }
    return
  }
  if (type === 'whatsapp') {
    const phone = digitsOnly(payload.phone || payload.whatsapp)
    if (!phone) {
      const err = new Error('VALIDATION_FAILED')
      err.detail = 'payload.phone is required for whatsapp QR'
      throw err
    }
    return
  }
  if (type === 'review' || type === 'website' || type === 'custom_url') {
    const url = String(payload.url || '').trim()
    if (!url) {
      const err = new Error('VALIDATION_FAILED')
      err.detail = `payload.url is required for ${type} QR`
      throw err
    }
    return
  }
  if (type === 'lead_form') {
    const path = String(payload.path || payload.url || '/contact').trim()
    if (!path) {
      const err = new Error('VALIDATION_FAILED')
      err.detail = 'payload.path is required for lead_form QR'
      throw err
    }
  }
}

export async function resolveRedirectUrl(db, orgId, doc) {
  if (!doc || !doc.active) return null
  const base = publicBaseUrl()

  if (doc.type === 'business_card') {
    const card = await db.collection('business_cards').findOne(
      { orgId, id: doc.targetId, published: true },
      { projection: { slug: 1 } },
    )
    if (!card?.slug) return null
    return `${base.replace(/\/$/, '')}/c/${card.slug}`
  }

  if (doc.type === 'whatsapp') {
    const phone = digitsOnly(doc.payload?.phone || doc.payload?.whatsapp)
    if (!phone) return null
    const text = doc.payload?.message ? `?text=${encodeURIComponent(doc.payload.message)}` : ''
    return `https://wa.me/${phone}${text}`
  }

  if (doc.type === 'review' || doc.type === 'website' || doc.type === 'custom_url') {
    return normalizeUrl(doc.payload?.url, base)
  }

  if (doc.type === 'lead_form') {
    const path = String(doc.payload?.path || doc.payload?.url || '/contact').trim()
    const url = normalizeUrl(path, base)
    const sep = url.includes('?') ? '&' : '?'
    return `${url}${sep}ref=qr_${doc.code}`
  }

  return null
}

function mapQrItem(item) {
  return {
    ...item,
    scanUrl: publicScanUrl(item.code),
    imageUrl: qrImageUrl(item.code),
  }
}

export async function listQrCodes(db, orgId, {
  targetId = null,
  type = null,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
} = {}) {
  const query = { orgId }
  if (targetId) query.targetId = targetId
  if (type) query.type = normalizeQrType(type)

  const safePage = Math.max(1, parseInt(page, 10) || 1)
  const safeSize = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(pageSize, 10) || DEFAULT_PAGE_SIZE))
  const skip = (safePage - 1) * safeSize

  const col = db.collection(COLLECTION)
  const [items, total] = await Promise.all([
    col.find(query, { projection: { _id: 0 } })
      .sort({ createdAt: -1, updatedAt: -1 })
      .skip(skip)
      .limit(safeSize)
      .toArray(),
    col.countDocuments(query),
  ])

  return {
    items: items.map(mapQrItem),
    pagination: {
      page: safePage,
      pageSize: safeSize,
      total,
      totalPages: Math.ceil(total / safeSize) || 0,
      hasMore: skip + items.length < total,
    },
  }
}

export async function getQrCode(db, orgId, id) {
  const doc = await db.collection(COLLECTION).findOne({ orgId, id }, { projection: { _id: 0 } })
  if (!doc) {
    const err = new Error('NOT_FOUND')
    throw err
  }
  return mapQrItem(doc)
}

export async function getQrCodeByCode(db, code) {
  return db.collection(COLLECTION).findOne(
    { code, active: true },
    { projection: { _id: 0 } },
  )
}

export async function createQrCode(db, orgId, userId, body, meta = {}) {
  const picked = pickBody(body)
  await validateTarget(db, orgId, picked.type, picked.targetId, picked.payload)
  const now = new Date().toISOString()
  const code = await ensureUniqueCode(db)

  const doc = {
    id: randomUUID(),
    orgId,
    code,
    type: picked.type,
    targetId: picked.targetId,
    payload: picked.payload,
    label: picked.label || `${picked.type.replace('_', ' ')} QR`,
    active: picked.active,
    stats: { scans: 0, clicks: 0, conversions: 0 },
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
    updatedBy: userId,
  }

  await db.collection(COLLECTION).insertOne(doc)
  await writeAuditLog({
    orgId,
    userId,
    action: 'qr_code.create',
    entity: 'qr_code',
    entityId: doc.id,
    ip: meta.ip,
    ua: meta.ua,
  })

  return mapQrItem(doc)
}

export async function updateQrCode(db, orgId, userId, id, body, meta = {}) {
  const existing = await getQrCode(db, orgId, id)
  const now = new Date().toISOString()

  const update = {
    label: body.label != null ? String(body.label).trim() : existing.label,
    active: body.active != null ? !!body.active : existing.active,
    payload: body.payload != null ? body.payload : existing.payload,
    updatedAt: now,
    updatedBy: userId,
  }

  if (body.targetId && body.targetId !== existing.targetId) {
    await validateTarget(db, orgId, existing.type, body.targetId, update.payload)
    update.targetId = body.targetId
  }

  if (body.type && normalizeQrType(body.type) !== existing.type) {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'QR type cannot be changed after creation'
    throw err
  }

  await validateTarget(db, orgId, existing.type, update.targetId || existing.targetId, update.payload)
  await db.collection(COLLECTION).updateOne({ orgId, id }, { $set: update })
  await writeAuditLog({
    orgId,
    userId,
    action: 'qr_code.update',
    entity: 'qr_code',
    entityId: id,
    ip: meta.ip,
    ua: meta.ua,
  })

  return { ...existing, ...update, scanUrl: publicScanUrl(existing.code), imageUrl: qrImageUrl(existing.code) }
}

export async function deleteQrCode(db, orgId, userId, id, meta = {}) {
  const result = await db.collection(COLLECTION).deleteOne({ orgId, id })
  if (result.deletedCount === 0) {
    const err = new Error('NOT_FOUND')
    throw err
  }
  await writeAuditLog({
    orgId,
    userId,
    action: 'qr_code.delete',
    entity: 'qr_code',
    entityId: id,
    ip: meta.ip,
    ua: meta.ua,
  })
  return { ok: true }
}

export async function recordQrScan(db, code, metadata = {}) {
  const doc = await getQrCodeByCode(db, code)
  if (!doc) return null

  await db.collection(COLLECTION).updateOne(
    { code },
    { $inc: { 'stats.scans': 1 } },
  )

  const { recordQrEvent } = await import('./track')
  const { visitorKey } = await import('./metadata')
  await recordQrEvent(db, {
    orgId: doc.orgId,
    qrCodeId: doc.id,
    eventType: 'scan',
    metadata: { ...metadata, visitorKey: visitorKey(metadata) },
  })

  return doc
}

export async function recordQrClick(db, code, metadata = {}) {
  const doc = await getQrCodeByCode(db, code)
  if (!doc) return null

  await db.collection(COLLECTION).updateOne(
    { code },
    { $inc: { 'stats.clicks': 1 } },
  )

  const { recordQrEvent } = await import('./track')
  const { visitorKey } = await import('./metadata')
  await recordQrEvent(db, {
    orgId: doc.orgId,
    qrCodeId: doc.id,
    eventType: 'click',
    metadata: { ...metadata, visitorKey: visitorKey(metadata) },
  })

  return doc
}

export async function recordQrConversion(db, code, {
  conversionType = 'generic',
  value = null,
  metadata = {},
  userId = 'system',
} = {}) {
  const doc = await getQrCodeByCode(db, code)
  if (!doc) return null

  await db.collection(COLLECTION).updateOne(
    { code },
    { $inc: { 'stats.conversions': 1 } },
  )

  const { recordQrConversion: persistConversion } = await import('./track')
  await persistConversion(db, {
    orgId: doc.orgId,
    qrCodeId: doc.id,
    conversionType,
    value,
    metadata: { ...metadata, userId },
  })

  return doc
}

export { getOrgQrSummary } from './track'
