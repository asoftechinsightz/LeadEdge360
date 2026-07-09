import { randomUUID } from 'crypto'
import { fetchWithRetry } from './retry.js'
import { refreshGoogleTokens } from './oauth-google.js'
import { ensureFreshOAuthTokens } from './connectors/base.js'
import {
  AD_PLATFORMS,
  buildLeadAttribution,
  extractUtmParams,
  isGoogleTraffic,
  matchCampaign,
  mergeAttributionTouch,
  slugifyCampaign,
} from '../attribution/utm-mapper.js'

const CAMPAIGNS_COL = 'ad_campaigns'
const DEV_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN || ''

/**
 * @param {object} creds
 */
async function resolveTokens(creds) {
  return ensureFreshOAuthTokens(creds, refreshGoogleTokens)
}

/**
 * Pull Google Ads campaigns via REST (when developer token + customer id configured).
 * Falls back to indexing CRM google leads with UTM mapping.
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 * @param {object} creds
 * @param {{ customerId?: string }} [options]
 */
export async function syncGoogleAdCampaigns(db, orgId, creds, options = {}) {
  const tokens = await resolveTokens(creds)
  const now = new Date().toISOString()
  let synced = 0
  let customerId = options.customerId || creds.customerId

  if (DEV_TOKEN && tokens.accessToken) {
    if (!customerId) {
      const listRes = await fetchWithRetry(
        'https://googleads.googleapis.com/v16/customers:listAccessibleCustomers',
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
            'developer-token': DEV_TOKEN,
          },
        },
      )
      const listData = await listRes.json().catch(() => ({}))
      const resource = listData.resourceNames?.[0]
      if (resource) customerId = resource.replace('customers/', '')
    }

    if (customerId) {
      const query = encodeURIComponent(
        'SELECT campaign.id, campaign.name, campaign.status, metrics.cost_micros, metrics.impressions, metrics.clicks FROM campaign WHERE campaign.status != "REMOVED" LIMIT 50',
      )
      const gaRes = await fetchWithRetry(
        `https://googleads.googleapis.com/v16/customers/${customerId}/googleAds:searchStream`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
            'developer-token': DEV_TOKEN,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: decodeURIComponent(query) }),
        },
      )

      if (gaRes.ok) {
        const text = await gaRes.text()
        const chunks = text.split('\n').filter(Boolean).map((line) => {
          try { return JSON.parse(line) } catch { return null }
        }).filter(Boolean)

        for (const chunk of chunks) {
          for (const row of chunk.results || []) {
            const c = row.campaign || {}
            const m = row.metrics || {}
            const doc = {
              id: randomUUID(),
              orgId,
              platform: AD_PLATFORMS.GOOGLE,
              externalId: String(c.id),
              customerId,
              name: c.name,
              status: c.status,
              spend: Number(m.costMicros || 0) / 1_000_000,
              impressions: Number(m.impressions || 0),
              clicks: Number(m.clicks || 0),
              utmSource: 'google',
              utmMedium: 'cpc',
              utmCampaign: c.name,
              utmCampaignSlug: slugifyCampaign(c.name),
              syncedAt: now,
              updatedAt: now,
            }
            await db.collection(CAMPAIGNS_COL).updateOne(
              { orgId, platform: AD_PLATFORMS.GOOGLE, externalId: doc.externalId },
              { $set: doc, $setOnInsert: { createdAt: now } },
              { upsert: true },
            )
            synced++
          }
        }
      }
    }
  }

  // Seed demo campaigns when API unavailable so UTM mapping still works
  if (synced === 0) {
    const seeds = [
      { name: 'Summer Campaign', externalId: 'demo_google_summer' },
      { name: 'Brand Search', externalId: 'demo_google_brand' },
    ]
    for (const seed of seeds) {
      await db.collection(CAMPAIGNS_COL).updateOne(
        { orgId, platform: AD_PLATFORMS.GOOGLE, externalId: seed.externalId },
        {
          $set: {
            id: randomUUID(),
            orgId,
            platform: AD_PLATFORMS.GOOGLE,
            externalId: seed.externalId,
            name: seed.name,
            status: 'ENABLED',
            spend: 0,
            utmSource: 'google',
            utmMedium: 'cpc',
            utmCampaign: seed.name,
            utmCampaignSlug: slugifyCampaign(seed.name),
            syncedAt: now,
            updatedAt: now,
            demo: true,
          },
          $setOnInsert: { createdAt: now },
        },
        { upsert: true },
      )
      synced++
    }
  }

  const mapped = await mapUtmToLeads(db, orgId)
  return {
    ok: true,
    synced,
    leadsUpdated: mapped.updated,
    refreshedCredentials: tokens,
    message: `Google Ads: ${synced} campaigns indexed, ${mapped.updated} leads attributed`,
  }
}

/**
 * Map UTM / gclid on leads to synced Google campaigns.
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 */
export async function mapUtmToLeads(db, orgId) {
  const campaigns = await db.collection(CAMPAIGNS_COL)
    .find({ orgId, platform: AD_PLATFORMS.GOOGLE }, { projection: { _id: 0 } })
    .toArray()

  const leads = await db.collection('leads')
    .find({
      orgId,
      $or: [
        { source: 'google' },
        { 'meta.gcl_id': { $exists: true } },
        { 'meta.utm_campaign': { $exists: true } },
        { 'attribution.platform': AD_PLATFORMS.GOOGLE },
        { utm_campaign: { $exists: true } },
      ],
    })
    .limit(500)
    .toArray()

  let updated = 0
  for (const lead of leads) {
    const utm = extractUtmParams({ ...lead, meta: lead.meta })
    if (!isGoogleTraffic(utm, lead.source) && !utm.utm_campaign && !utm.gclid) continue

    const campaign = matchCampaign(campaigns, utm, AD_PLATFORMS.GOOGLE)
    if (!campaign && !utm.utm_campaign && !utm.gclid) continue

    const attribution = buildLeadAttribution({
      platform: AD_PLATFORMS.GOOGLE,
      campaign: campaign || { name: utm.utm_campaign || 'Google Campaign', externalId: utm.campaignId },
      utm,
      source: lead.source || 'google',
    })

    const merged = mergeAttributionTouch(lead.attribution, attribution)
    await db.collection('leads').updateOne(
      { _id: lead._id },
      {
        $set: {
          attribution: merged,
          utm_source: merged.utm_source,
          utm_medium: merged.utm_medium,
          utm_campaign: merged.utm_campaign,
          updatedAt: new Date().toISOString(),
        },
      },
    )
    updated++
  }

  return { updated }
}

/**
 * Resolve attribution when ingesting a Google lead.
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 * @param {object} body
 */
export async function resolveGoogleLeadAttribution(db, orgId, body) {
  const utm = extractUtmParams(body)
  if (!isGoogleTraffic(utm, body.source || 'google')) return null

  const campaigns = await db.collection(CAMPAIGNS_COL)
    .find({ orgId, platform: AD_PLATFORMS.GOOGLE }, { projection: { _id: 0 } })
    .toArray()

  const campaign = matchCampaign(campaigns, utm, AD_PLATFORMS.GOOGLE)
  return buildLeadAttribution({
    platform: AD_PLATFORMS.GOOGLE,
    campaign: campaign || {
      name: body.campaign_name || utm.utm_campaign || 'Google Campaign',
      externalId: utm.campaignId,
    },
    utm,
    source: 'google',
  })
}
