import { randomUUID } from 'crypto'
import { getDb } from '@/lib/mongo'

export async function logCampaignActivity(orgId, campaignId, type, title, detail = '') {
  const db = await getDb()
  await db.collection('campaign_activities').insertOne({
    id: randomUUID(),
    orgId,
    campaignId,
    type,
    title,
    detail,
    createdAt: new Date().toISOString(),
  })
}

export async function listCampaignActivities(orgId, campaignId) {
  const db = await getDb()
  const items = await db.collection('campaign_activities')
    .find({ orgId, campaignId }, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray()
  return { success: true, items }
}
