import { randomUUID } from 'crypto'
import { writeAuditLog } from '@/lib/audit/service'

const COLLECTION = 'business_cards'

function slugify(text) {
  const base = String(text || 'card')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
  return base || 'card'
}

async function ensureUniqueSlug(db, base, excludeId = null) {
  let slug = base
  let n = 0
  while (true) {
    const query = { slug }
    if (excludeId) query.id = { $ne: excludeId }
    const existing = await db.collection(COLLECTION).findOne(query)
    if (!existing) return slug
    n += 1
    slug = `${base}-${n}`
  }
}

function pickProfile(body = {}) {
  return {
    businessName: String(body.businessName || '').trim(),
    tagline: String(body.tagline || '').trim(),
    description: String(body.description || '').trim(),
    phone: String(body.phone || '').trim(),
    email: String(body.email || '').trim(),
    whatsapp: String(body.whatsapp || body.phone || '').trim(),
    website: String(body.website || '').trim(),
    address: String(body.address || '').trim(),
    city: String(body.city || '').trim(),
    state: String(body.state || '').trim(),
    pincode: String(body.pincode || '').trim(),
    logoUrl: String(body.logoUrl || '').trim(),
    coverUrl: String(body.coverUrl || '').trim(),
  }
}

function validateProfile(profile) {
  if (!profile.businessName) {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'businessName is required'
    throw err
  }
  if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'Invalid email'
    throw err
  }
}

export function toPublicCard(doc) {
  if (!doc || !doc.published) return null
  return {
    slug: doc.slug,
    profile: doc.profile,
    socialLinks: doc.socialLinks || {},
    theme: doc.theme || {},
    stats: { views: doc.stats?.views || 0 },
  }
}

export async function listBusinessCards(db, orgId) {
  const items = await db.collection(COLLECTION)
    .find({ orgId }, { projection: { _id: 0 } })
    .sort({ updatedAt: -1 })
    .toArray()
  return { items }
}

export async function getBusinessCard(db, orgId, id) {
  const card = await db.collection(COLLECTION).findOne({ orgId, id }, { projection: { _id: 0 } })
  if (!card) {
    const err = new Error('NOT_FOUND')
    throw err
  }
  return card
}

export async function getBusinessCardBySlug(db, slug) {
  const card = await db.collection(COLLECTION).findOne(
    { slug, published: true },
    { projection: { _id: 0, orgId: 0, createdBy: 0, updatedBy: 0 } },
  )
  return card
}

export async function createBusinessCard(db, orgId, userId, body, meta = {}) {
  const profile = pickProfile(body.profile || body)
  validateProfile(profile)
  const now = new Date().toISOString()
  const baseSlug = slugify(body.slug || profile.businessName)
  const slug = await ensureUniqueSlug(db, baseSlug)

  const doc = {
    id: randomUUID(),
    orgId,
    slug,
    published: false,
    profile,
    socialLinks: body.socialLinks || {},
    theme: {
      primaryColor: body.theme?.primaryColor || '#FF8A3D',
      layout: body.theme?.layout || 'classic',
    },
    stats: { views: 0, clicks: 0 },
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
    updatedBy: userId,
  }

  await db.collection(COLLECTION).insertOne(doc)
  await writeAuditLog({
    orgId,
    userId,
    action: 'business_card.create',
    entity: 'business_card',
    entityId: doc.id,
    ip: meta.ip,
    ua: meta.ua,
  })

  return doc
}

export async function updateBusinessCard(db, orgId, userId, id, body, meta = {}) {
  const existing = await getBusinessCard(db, orgId, id)
  const profile = pickProfile({ ...existing.profile, ...(body.profile || body) })
  validateProfile(profile)
  const now = new Date().toISOString()

  let slug = existing.slug
  if (body.slug && body.slug !== existing.slug) {
    slug = await ensureUniqueSlug(db, slugify(body.slug), id)
  }

  const update = {
    profile,
    socialLinks: body.socialLinks ?? existing.socialLinks,
    theme: {
      ...existing.theme,
      ...(body.theme || {}),
    },
    slug,
    updatedAt: now,
    updatedBy: userId,
  }

  await db.collection(COLLECTION).updateOne({ orgId, id }, { $set: update })
  await writeAuditLog({
    orgId,
    userId,
    action: 'business_card.update',
    entity: 'business_card',
    entityId: id,
    ip: meta.ip,
    ua: meta.ua,
  })

  return { ...existing, ...update }
}

export async function deleteBusinessCard(db, orgId, userId, id, meta = {}) {
  const result = await db.collection(COLLECTION).deleteOne({ orgId, id })
  if (result.deletedCount === 0) {
    const err = new Error('NOT_FOUND')
    throw err
  }
  await writeAuditLog({
    orgId,
    userId,
    action: 'business_card.delete',
    entity: 'business_card',
    entityId: id,
    ip: meta.ip,
    ua: meta.ua,
  })
  return { ok: true }
}

export async function publishBusinessCard(db, orgId, userId, id, meta = {}) {
  const existing = await getBusinessCard(db, orgId, id)
  validateProfile(existing.profile)
  const now = new Date().toISOString()

  await db.collection(COLLECTION).updateOne(
    { orgId, id },
    { $set: { published: true, updatedAt: now, updatedBy: userId } },
  )

  await writeAuditLog({
    orgId,
    userId,
    action: 'business_card.publish',
    entity: 'business_card',
    entityId: id,
    ip: meta.ip,
    ua: meta.ua,
  })

  return { ...existing, published: true, updatedAt: now, updatedBy: userId }
}

export async function recordCardView(db, slug) {
  await db.collection(COLLECTION).updateOne(
    { slug, published: true },
    { $inc: { 'stats.views': 1 } },
  )
}

export async function recordCardClick(db, slug, channel) {
  await db.collection(COLLECTION).updateOne(
    { slug, published: true },
    { $inc: { 'stats.clicks': 1, [`stats.clicksBy.${channel}`]: 1 } },
  )
}
