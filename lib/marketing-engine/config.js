import { COLLECTIONS, PUBLISH_SLOTS_IST } from './constants.js'

const DEFAULT_CONFIG = {
  enabled: true,
  autopilot: {
    plannerDay: 0,
    plannerHourUtc: 18,
    publisherIntervalMinutes: 60,
    leadIngestIntervalMinutes: 30,
    followUpHourUtc: 6,
  },
  platforms: {
    linkedin: { enabled: true },
    facebook: { enabled: true },
    instagram: { enabled: true },
    twitter: { enabled: true },
    youtube_shorts: { enabled: true },
    google_business: { enabled: true },
  },
  publishSlots: PUBLISH_SLOTS_IST,
  proposalAutoThreshold: 80,
  products: ['leadedge360', 'retailedge360'],
}

export async function getMarketingConfig(db, orgId) {
  const doc = await db.collection(COLLECTIONS.CONFIG).findOne({ orgId }, { projection: { _id: 0 } })
  return { ...DEFAULT_CONFIG, ...doc, orgId }
}

export async function updateMarketingConfig(db, orgId, patch = {}) {
  const now = new Date().toISOString()
  await db.collection(COLLECTIONS.CONFIG).updateOne(
    { orgId },
    { $set: { ...patch, orgId, updatedAt: now }, $setOnInsert: { createdAt: now } },
    { upsert: true },
  )
  return getMarketingConfig(db, orgId)
}
