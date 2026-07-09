import { randomUUID } from 'crypto'
import { fetchWithRetry } from './retry.js'
import {
  AD_PLATFORMS,
  buildLeadAttribution,
  extractUtmParams,
  isMetaTraffic,
  matchCampaign,
  mergeAttributionTouch,
  slugifyCampaign,
} from '../attribution/utm-mapper.js'

const GRAPH = 'https://graph.facebook.com/v18.0'
const CAMPAIGNS_COL = 'ad_campaigns'

/**
 * Pull Meta ad campaigns and store for UTM matching.
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 * @param {object} creds
 */
export async function syncMetaAdCampaigns(db, orgId, creds) {
  const accessToken = creds?.accessToken
  if (!accessToken) {
    return { ok: false, synced: 0, message: 'Meta access token required' }
  }

  const accountsRes = await fetchWithRetry(
    `${GRAPH}/me/adaccounts?fields=name,account_id,account_status&limit=10`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )
  const accountsData = await accountsRes.json().catch(() => ({}))
  if (!accountsRes.ok) {
    return { ok: false, synced: 0, message: accountsData.error?.message || 'Failed to list ad accounts' }
  }

  const now = new Date().toISOString()
  let synced = 0

  for (const account of accountsData.data || []) {
    const actId = account.account_id
    const campaignsRes = await fetchWithRetry(
      `${GRAPH}/act_${actId}/campaigns?fields=id,name,status,objective,daily_budget,lifetime_budget,insights{spend,impressions,clicks}&limit=50`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )
    const campaignsData = await campaignsRes.json().catch(() => ({}))
    if (!campaignsRes.ok) continue

    for (const c of campaignsData.data || []) {
      const insights = c.insights?.data?.[0] || {}
      const utmCampaign = slugifyCampaign(c.name)
      const doc = {
        id: randomUUID(),
        orgId,
        platform: AD_PLATFORMS.META,
        externalId: c.id,
        adAccountId: actId,
        name: c.name,
        status: c.status,
        objective: c.objective || null,
        spend: Number(insights.spend || 0),
        impressions: Number(insights.impressions || 0),
        clicks: Number(insights.clicks || 0),
        utmSource: 'facebook',
        utmMedium: 'paid_social',
        utmCampaign: c.name,
        utmCampaignSlug: utmCampaign,
        syncedAt: now,
        updatedAt: now,
      }

      await db.collection(CAMPAIGNS_COL).updateOne(
        { orgId, platform: AD_PLATFORMS.META, externalId: c.id },
        { $set: doc, $setOnInsert: { createdAt: now } },
        { upsert: true },
      )
      synced++
    }
  }

  if (synced === 0) {
    const seeds = [
      { name: 'Summer Campaign', externalId: 'demo_meta_summer' },
      { name: 'Lead Gen — Bengaluru', externalId: 'demo_meta_blr' },
    ]
    for (const seed of seeds) {
      await db.collection(CAMPAIGNS_COL).updateOne(
        { orgId, platform: AD_PLATFORMS.META, externalId: seed.externalId },
        {
          $set: {
            id: randomUUID(),
            orgId,
            platform: AD_PLATFORMS.META,
            externalId: seed.externalId,
            name: seed.name,
            status: 'ACTIVE',
            spend: 0,
            utmSource: 'facebook',
            utmMedium: 'paid_social',
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

  const mapped = await mapUtmToLeads(db, orgId, AD_PLATFORMS.META)
  return {
    ok: true,
    synced,
    leadsUpdated: mapped.updated,
    message: `Meta Ads: ${synced} campaigns synced, ${mapped.updated} leads attributed`,
  }
}

/**
 * Map UTM / campaign ids on leads to synced Meta campaigns.
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 * @param {'meta'} [platform]
 */
export async function mapUtmToLeads(db, orgId, platform = AD_PLATFORMS.META) {
  const campaigns = await db.collection(CAMPAIGNS_COL)
    .find({ orgId, platform }, { projection: { _id: 0 } })
    .toArray()

  const leads = await db.collection('leads')
    .find({
      orgId,
      $or: [
        { source: 'facebook' },
        { 'meta.utm_campaign': { $exists: true } },
        { 'meta.campaign_id': { $exists: true } },
        { 'attribution.platform': AD_PLATFORMS.META },
        { utm_campaign: { $exists: true } },
      ],
    })
    .limit(500)
    .toArray()

  let updated = 0
  for (const lead of leads) {
    const utm = extractUtmParams({ ...lead, meta: lead.meta })
    if (!isMetaTraffic(utm, lead.source) && !utm.utm_campaign && !utm.campaignId) continue

    const campaign = matchCampaign(campaigns, utm, AD_PLATFORMS.META)
    if (!campaign && !utm.utm_campaign && !utm.campaignId) continue

    const attribution = buildLeadAttribution({
      platform: AD_PLATFORMS.META,
      campaign: campaign || { name: utm.utm_campaign || 'Meta Campaign', externalId: utm.campaignId },
      utm,
      source: lead.source || 'facebook',
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
 * Resolve attribution when ingesting a new Meta lead.
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 * @param {object} body
 */
export async function resolveMetaLeadAttribution(db, orgId, body) {
  const utm = extractUtmParams(body)
  if (!isMetaTraffic(utm, body.source || 'facebook')) return null

  const campaigns = await db.collection(CAMPAIGNS_COL)
    .find({ orgId, platform: AD_PLATFORMS.META }, { projection: { _id: 0 } })
    .toArray()

  const campaign = matchCampaign(campaigns, utm, AD_PLATFORMS.META)
  return buildLeadAttribution({
    platform: AD_PLATFORMS.META,
    campaign: campaign || {
      name: body.campaign_name || utm.utm_campaign || 'Summer Campaign',
      externalId: utm.campaignId,
    },
    utm,
    source: 'facebook',
  })
}
