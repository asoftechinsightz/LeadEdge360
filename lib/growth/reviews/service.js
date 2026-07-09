import { randomBytes, randomUUID } from 'crypto'
import { writeAuditLog } from '@/lib/audit/service'

const CAMPAIGNS = 'review_campaigns'
const REQUESTS = 'review_requests'
const VALID_CHANNELS = new Set(['email', 'sms', 'whatsapp', 'link'])
const VALID_STATUSES = new Set(['draft', 'active', 'paused'])

export function publicBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
}

export function publicReviewUrl(token) {
  return `${publicBaseUrl().replace(/\/$/, '')}/review/${token}`
}

async function ensureUniqueToken(db) {
  for (let i = 0; i < 10; i++) {
    const token = randomBytes(16).toString('base64url').slice(0, 24)
    const existing = await db.collection(REQUESTS).findOne({ token })
    if (!existing) return token
  }
  const err = new Error('VALIDATION_FAILED')
  err.detail = 'Could not allocate unique review token'
  throw err
}

function pickCampaignBody(body = {}) {
  const name = String(body.name || '').trim()
  if (!name) {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'name is required'
    throw err
  }
  const channel = String(body.channel || 'link').trim().toLowerCase()
  if (!VALID_CHANNELS.has(channel)) {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'channel must be email, sms, whatsapp, or link'
    throw err
  }
  const reviewUrl = String(body.reviewUrl || body.review_url || '').trim()
  if (!reviewUrl) {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'reviewUrl is required'
    throw err
  }
  const status = String(body.status || 'active').trim().toLowerCase()
  if (!VALID_STATUSES.has(status)) {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'status must be draft, active, or paused'
    throw err
  }
  return {
    name,
    description: String(body.description || '').trim(),
    channel,
    reviewUrl,
    message: String(body.message || 'We would love your feedback! Please rate your experience.').trim(),
    status,
  }
}

function emptyStats() {
  return { sent: 0, opened: 0, completed: 0, totalRating: 0, ratingCount: 0, avgRating: 0 }
}

export async function listCampaigns(db, orgId, { page = 1, pageSize = 20 } = {}) {
  const safePage = Math.max(1, parseInt(page, 10) || 1)
  const safeSize = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 20))
  const skip = (safePage - 1) * safeSize

  const [items, total] = await Promise.all([
    db.collection(CAMPAIGNS).find({ orgId }, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeSize)
      .toArray(),
    db.collection(CAMPAIGNS).countDocuments({ orgId }),
  ])

  return {
    items,
    pagination: {
      page: safePage,
      pageSize: safeSize,
      total,
      totalPages: Math.ceil(total / safeSize) || 0,
      hasMore: skip + items.length < total,
    },
  }
}

export async function getCampaign(db, orgId, id) {
  const doc = await db.collection(CAMPAIGNS).findOne({ orgId, id }, { projection: { _id: 0 } })
  if (!doc) {
    const err = new Error('NOT_FOUND')
    throw err
  }
  return doc
}

export async function createCampaign(db, orgId, userId, body, meta = {}) {
  const picked = pickCampaignBody(body)
  const now = new Date().toISOString()
  const doc = {
    id: randomUUID(),
    orgId,
    ...picked,
    stats: emptyStats(),
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
    updatedBy: userId,
  }
  await db.collection(CAMPAIGNS).insertOne(doc)
  await writeAuditLog({
    orgId,
    userId,
    action: 'review_campaign.create',
    entity: 'review_campaign',
    entityId: doc.id,
    ip: meta.ip,
    ua: meta.ua,
  })
  return doc
}

export async function updateCampaign(db, orgId, userId, id, body, meta = {}) {
  const existing = await getCampaign(db, orgId, id)
  const now = new Date().toISOString()
  const update = {
    name: body.name != null ? String(body.name).trim() : existing.name,
    description: body.description != null ? String(body.description).trim() : existing.description,
    channel: body.channel != null ? String(body.channel).trim().toLowerCase() : existing.channel,
    reviewUrl: body.reviewUrl != null ? String(body.reviewUrl).trim() : existing.reviewUrl,
    message: body.message != null ? String(body.message).trim() : existing.message,
    status: body.status != null ? String(body.status).trim().toLowerCase() : existing.status,
    updatedAt: now,
    updatedBy: userId,
  }
  if (!update.name) {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'name cannot be empty'
    throw err
  }
  await db.collection(CAMPAIGNS).updateOne({ orgId, id }, { $set: update })
  await writeAuditLog({
    orgId,
    userId,
    action: 'review_campaign.update',
    entity: 'review_campaign',
    entityId: id,
    ip: meta.ip,
    ua: meta.ua,
  })
  return { ...existing, ...update }
}

export async function deleteCampaign(db, orgId, userId, id, meta = {}) {
  const result = await db.collection(CAMPAIGNS).deleteOne({ orgId, id })
  if (result.deletedCount === 0) {
    const err = new Error('NOT_FOUND')
    throw err
  }
  await db.collection(REQUESTS).deleteMany({ orgId, campaignId: id })
  await writeAuditLog({
    orgId,
    userId,
    action: 'review_campaign.delete',
    entity: 'review_campaign',
    entityId: id,
    ip: meta.ip,
    ua: meta.ua,
  })
  return { ok: true }
}

export async function listRequests(db, orgId, { campaignId = null, page = 1, pageSize = 20 } = {}) {
  const query = { orgId }
  if (campaignId) query.campaignId = campaignId
  const safePage = Math.max(1, parseInt(page, 10) || 1)
  const safeSize = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 20))
  const skip = (safePage - 1) * safeSize

  const [items, total] = await Promise.all([
    db.collection(REQUESTS).find(query, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeSize)
      .toArray(),
    db.collection(REQUESTS).countDocuments(query),
  ])

  return {
    items: items.map((item) => ({
      ...item,
      reviewLink: publicReviewUrl(item.token),
    })),
    pagination: {
      page: safePage,
      pageSize: safeSize,
      total,
      totalPages: Math.ceil(total / safeSize) || 0,
      hasMore: skip + items.length < total,
    },
  }
}

export async function sendReviewRequest(db, orgId, userId, campaignId, body, meta = {}) {
  const campaign = await getCampaign(db, orgId, campaignId)
  if (campaign.status !== 'active') {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'Campaign must be active to send requests'
    throw err
  }

  const customerName = String(body.customerName || body.name || '').trim()
  const customerEmail = String(body.customerEmail || body.email || '').trim()
  const customerPhone = String(body.customerPhone || body.phone || '').trim()

  if (!customerName && !customerEmail && !customerPhone) {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'customerName, customerEmail, or customerPhone is required'
    throw err
  }

  const now = new Date().toISOString()
  const token = await ensureUniqueToken(db)
  const doc = {
    id: randomUUID(),
    orgId,
    campaignId,
    token,
    customerName,
    customerEmail,
    customerPhone,
    status: 'sent',
    rating: null,
    comment: '',
    sentAt: now,
    openedAt: null,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
    updatedBy: userId,
  }

  await db.collection(REQUESTS).insertOne(doc)
  await db.collection(CAMPAIGNS).updateOne(
    { orgId, id: campaignId },
    { $inc: { 'stats.sent': 1 } },
  )

  await writeAuditLog({
    orgId,
    userId,
    action: 'review_request.send',
    entity: 'review_request',
    entityId: doc.id,
    ip: meta.ip,
    ua: meta.ua,
  })

  return { ...doc, reviewLink: publicReviewUrl(token), campaignName: campaign.name }
}

export async function getRequestByToken(db, token) {
  return db.collection(REQUESTS).findOne(
    { token },
    { projection: { _id: 0 } },
  )
}

export async function markRequestOpened(db, token) {
  const doc = await getRequestByToken(db, token)
  if (!doc || doc.status === 'completed') return doc

  if (doc.status === 'sent') {
    const now = new Date().toISOString()
    await db.collection(REQUESTS).updateOne(
      { token },
      { $set: { status: 'opened', openedAt: now, updatedAt: now } },
    )
    await db.collection(CAMPAIGNS).updateOne(
      { orgId: doc.orgId, id: doc.campaignId },
      { $inc: { 'stats.opened': 1 } },
    )
  }
  return getRequestByToken(db, token)
}

export async function recordRating(db, token, { rating, comment = '' } = {}) {
  const doc = await getRequestByToken(db, token)
  if (!doc) {
    const err = new Error('NOT_FOUND')
    throw err
  }
  if (doc.status === 'completed') {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'Review already submitted'
    throw err
  }

  const score = parseInt(rating, 10)
  if (!Number.isFinite(score) || score < 1 || score > 5) {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'rating must be between 1 and 5'
    throw err
  }

  const now = new Date().toISOString()
  await db.collection(REQUESTS).updateOne(
    { token },
    {
      $set: {
        status: 'completed',
        rating: score,
        comment: String(comment || '').trim().slice(0, 2000),
        completedAt: now,
        updatedAt: now,
        openedAt: doc.openedAt || now,
      },
    },
  )

  const campaign = await db.collection(CAMPAIGNS).findOne({ orgId: doc.orgId, id: doc.campaignId })
  if (campaign) {
    const prevCount = campaign.stats?.ratingCount || 0
    const prevTotal = campaign.stats?.totalRating || 0
    const newCount = prevCount + 1
    const newTotal = prevTotal + score
    const openedInc = doc.status === 'sent' ? 1 : 0
    await db.collection(CAMPAIGNS).updateOne(
      { orgId: doc.orgId, id: doc.campaignId },
      {
        $inc: {
          'stats.completed': 1,
          'stats.totalRating': score,
          'stats.ratingCount': 1,
          ...(openedInc ? { 'stats.opened': 1 } : {}),
        },
        $set: { 'stats.avgRating': Math.round((newTotal / newCount) * 10) / 10 },
      },
    )
  }

  return getRequestByToken(db, token)
}

export async function getReviewSummary(db, orgId) {
  const [campaigns, recentRequests, aggregate] = await Promise.all([
    db.collection(CAMPAIGNS).find({ orgId }, { projection: { _id: 0, id: 1, name: 1, stats: 1, status: 1 } })
      .sort({ 'stats.completed': -1 })
      .limit(5)
      .toArray(),
    db.collection(REQUESTS).find({ orgId }, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray(),
    db.collection(CAMPAIGNS).aggregate([
      { $match: { orgId } },
      {
        $group: {
          _id: null,
          totalCampaigns: { $sum: 1 },
          activeCampaigns: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          sent: { $sum: '$stats.sent' },
          opened: { $sum: '$stats.opened' },
          completed: { $sum: '$stats.completed' },
          totalRating: { $sum: '$stats.totalRating' },
          ratingCount: { $sum: '$stats.ratingCount' },
        },
      },
    ]).toArray(),
  ])

  const totals = aggregate[0] || {
    totalCampaigns: 0,
    activeCampaigns: 0,
    sent: 0,
    opened: 0,
    completed: 0,
    totalRating: 0,
    ratingCount: 0,
  }

  return {
    totals: {
      ...totals,
      avgRating: totals.ratingCount
        ? Math.round((totals.totalRating / totals.ratingCount) * 10) / 10
        : 0,
    },
    topCampaigns: campaigns,
    recentRequests: recentRequests.map((r) => ({
      ...r,
      reviewLink: publicReviewUrl(r.token),
    })),
  }
}

export async function getPublicReviewContext(db, token) {
  const request = await getRequestByToken(db, token)
  if (!request) return null

  const campaign = await db.collection(CAMPAIGNS).findOne(
    { orgId: request.orgId, id: request.campaignId },
    { projection: { _id: 0, name: 1, message: 1, reviewUrl: 1 } },
  )
  if (!campaign) return null

  return {
    customerName: request.customerName,
    campaignName: campaign.name,
    message: campaign.message,
    reviewUrl: campaign.reviewUrl,
    status: request.status,
    rating: request.rating,
    alreadySubmitted: request.status === 'completed',
  }
}
