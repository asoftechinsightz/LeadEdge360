import { getOrgBranding } from '@/lib/branding/service'
import { ACTIVITY_CATEGORIES } from '@/lib/activities/registry'
import { formatActivityResponse } from '@/lib/activities/format'
import { projectFromPlatformEvent, projectFromTimelineRow } from '@/lib/activities/projector'

const brandingCache = new Map()
const BRANDING_TTL_MS = 60_000

async function getCachedBranding(db, orgId) {
  const key = orgId
  const hit = brandingCache.get(key)
  if (hit && Date.now() - hit.at < BRANDING_TTL_MS) return hit.branding
  const branding = await getOrgBranding(db, orgId)
  brandingCache.set(key, { branding, at: Date.now() })
  return branding
}

export async function syncActivitySources(db, orgId, { timelineLimit = 100, eventLimit = 100 } = {}) {
  const [timelineRows, events] = await Promise.all([
    db.collection('lead_timeline')
      .find({ orgId }, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .limit(timelineLimit)
      .toArray(),
    db.collection('platform_events')
      .find({ orgId }, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .limit(eventLimit)
      .toArray(),
  ])

  await Promise.all([
    ...timelineRows.map((row) => projectFromTimelineRow(row, db)),
    ...events.map((event) => projectFromPlatformEvent(event, db)),
  ])
}

function buildListFilter(orgId, {
  category = ACTIVITY_CATEGORIES.ALL,
  userId = null,
  search = '',
}) {
  const filter = { orgId }

  if (category === ACTIVITY_CATEGORIES.AI) {
    filter.actorType = 'agent'
  } else if (category === ACTIVITY_CATEGORIES.SYSTEM) {
    filter.actorType = 'system'
  } else if (category === ACTIVITY_CATEGORIES.MINE && userId) {
    filter.userId = userId
  } else if (category && category !== ACTIVITY_CATEGORIES.ALL) {
    filter.category = category
  }

  if (search?.trim()) {
    const q = search.trim().toLowerCase()
    filter.searchText = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
  }

  return filter
}

export async function listActivities(dbIn, orgId, options = {}) {
  const db = dbIn
  const {
    limit = 20,
    cursor = null,
    category = ACTIVITY_CATEGORIES.ALL,
    search = '',
    userId = null,
    syncLegacy = true,
  } = options

  const cap = Math.min(Math.max(Number(limit) || 20, 1), 50)

  if (syncLegacy) {
    await syncActivitySources(db, orgId, { timelineLimit: 50, eventLimit: 50 })
  }

  const filter = buildListFilter(orgId, { category, userId, search })

  if (cursor) {
    try {
      const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'))
      if (parsed.createdAt && parsed.id) {
        filter.$or = [
          { createdAt: { $lt: parsed.createdAt } },
          { createdAt: parsed.createdAt, id: { $lt: parsed.id } },
        ]
      }
    } catch {
      // ignore invalid cursor
    }
  }

  const [rows, org, branding] = await Promise.all([
    db.collection('org_activities')
      .find(filter, { projection: { _id: 0, searchText: 0 } })
      .sort({ createdAt: -1, id: -1 })
      .limit(cap + 1)
      .toArray(),
    db.collection('orgs').findOne({ id: orgId }, { projection: { _id: 0, name: 1 } }),
    getCachedBranding(db, orgId),
  ])

  const hasMore = rows.length > cap
  const page = hasMore ? rows.slice(0, cap) : rows
  const last = page[page.length - 1]
  const nextCursor = hasMore && last
    ? Buffer.from(JSON.stringify({ createdAt: last.createdAt, id: last.id })).toString('base64url')
    : null

  const orgName = org?.name || branding.companyName || ''
  const activities = page.map((row) => formatActivityResponse(row, {
    orgName,
    branding: {
      primaryColor: branding.primaryColor || '#0066FF',
      secondaryColor: branding.secondaryColor || '#00C6FF',
      companyName: branding.companyName || orgName,
    },
  }))

  return {
    success: true,
    count: activities.length,
    activities,
    nextCursor,
    hasMore,
    branding: {
      primaryColor: branding.primaryColor || '#0066FF',
      secondaryColor: branding.secondaryColor || '#00C6FF',
      companyName: branding.companyName || orgName,
    },
    filters: category,
  }
}
