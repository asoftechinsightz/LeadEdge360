/**
 * Shared UTM parsing and campaign matching for ad attribution.
 */

export const AD_PLATFORMS = {
  META: 'meta',
  GOOGLE: 'google',
}

/**
 * @param {string} name
 */
export function slugifyCampaign(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

/**
 * Extract UTM params from a lead body / meta object.
 * @param {object} input
 */
export function extractUtmParams(input = {}) {
  const src = input.meta && typeof input.meta === 'object' ? { ...input.meta, ...input } : input
  return {
    utm_source: String(src.utm_source || src.utmSource || '').trim().toLowerCase(),
    utm_medium: String(src.utm_medium || src.utmMedium || '').trim().toLowerCase(),
    utm_campaign: String(src.utm_campaign || src.utmCampaign || src.campaign || src.campaign_id || '').trim().toLowerCase(),
    utm_content: String(src.utm_content || src.utmContent || '').trim().toLowerCase(),
    utm_term: String(src.utm_term || src.utmTerm || '').trim().toLowerCase(),
    gclid: String(src.gclid || src.gcl_id || '').trim(),
    fbclid: String(src.fbclid || '').trim(),
    campaignId: String(src.campaign_id || src.campaignId || src.ad_campaign_id || '').trim(),
    adSetId: String(src.adset_id || src.adSetId || '').trim(),
    formId: String(src.form_id || src.leadgen_form_id || '').trim(),
  }
}

/**
 * @param {object} utm
 */
export function isMetaTraffic(utm, source = '') {
  const s = String(source || '').toLowerCase()
  if (s === 'facebook' || s.includes('meta') || s.includes('instagram')) return true
  return ['facebook', 'fb', 'instagram', 'meta'].includes(utm.utm_source)
    || Boolean(utm.fbclid)
    || Boolean(utm.formId)
}

/**
 * @param {object} utm
 */
export function isGoogleTraffic(utm, source = '') {
  const s = String(source || '').toLowerCase()
  if (s === 'google') return true
  return ['google', 'google_ads', 'adwords', 'gclid'].includes(utm.utm_source)
    || Boolean(utm.gclid)
}

/**
 * Match a synced ad campaign record to UTM / ids.
 * @param {object[]} campaigns
 * @param {object} utm
 * @param {'meta'|'google'} platform
 */
export function matchCampaign(campaigns, utm, platform) {
  const list = (campaigns || []).filter((c) => c.platform === platform)
  if (!list.length) return null

  if (utm.campaignId) {
    const byId = list.find((c) => c.externalId === utm.campaignId || c.id === utm.campaignId)
    if (byId) return byId
  }

  if (utm.utm_campaign) {
    const slug = slugifyCampaign(utm.utm_campaign)
    const bySlug = list.find((c) =>
      c.utmCampaign === utm.utm_campaign
      || c.utmCampaignSlug === slug
      || slugifyCampaign(c.name) === slug)
    if (bySlug) return bySlug
  }

  if (utm.formId && platform === AD_PLATFORMS.META) {
    const byForm = list.find((c) => c.formId === utm.formId)
    if (byForm) return byForm
  }

  return null
}

/**
 * Human-readable label for lead detail UI.
 * @param {object} attribution
 */
export function formatAttributionLabel(attribution) {
  if (!attribution?.campaignName) return null
  if (attribution.platform === AD_PLATFORMS.META || attribution.channel === 'meta') {
    return `Came from Meta Ad: ${attribution.campaignName}`
  }
  if (attribution.platform === AD_PLATFORMS.GOOGLE || attribution.channel === 'google') {
    return `Came from Google Ad: ${attribution.campaignName}`
  }
  return `Came from ${attribution.campaignName}`
}

/**
 * Build attribution object for a lead.
 * @param {object} params
 */
export function buildLeadAttribution({ platform, campaign, utm, source, touchType = 'first' }) {
  const now = new Date().toISOString()
  const touchpoint = {
    platform,
    channel: platform,
    campaignId: campaign?.externalId || campaign?.id || utm.campaignId || null,
    campaignName: campaign?.name || utm.utm_campaign || null,
    utm_source: utm.utm_source || null,
    utm_medium: utm.utm_medium || null,
    utm_campaign: utm.utm_campaign || null,
    touchedAt: now,
    type: touchType,
  }

  const attribution = {
    platform,
    channel: platform,
    campaignId: touchpoint.campaignId,
    campaignName: touchpoint.campaignName,
    adSetName: campaign?.adSetName || null,
    utm_source: utm.utm_source || (platform === AD_PLATFORMS.META ? 'facebook' : 'google'),
    utm_medium: utm.utm_medium || 'cpc',
    utm_campaign: utm.utm_campaign || campaign?.utmCampaign || null,
    utm_content: utm.utm_content || null,
    utm_term: utm.utm_term || null,
    gclid: utm.gclid || null,
    fbclid: utm.fbclid || null,
    source: source || (platform === AD_PLATFORMS.META ? 'facebook' : 'google'),
    touchpoints: [touchpoint],
    firstTouchAt: now,
    lastTouchAt: now,
    displayLabel: null,
  }

  attribution.displayLabel = formatAttributionLabel(attribution)
  return attribution
}

/**
 * Merge a new touchpoint into existing attribution (last-touch update).
 * @param {object|null} existing
 * @param {object} incoming
 */
export function mergeAttributionTouch(existing, incoming) {
  if (!existing) return incoming
  const touchpoints = [...(existing.touchpoints || []), ...(incoming.touchpoints || [])]
  return {
    ...existing,
    ...incoming,
    touchpoints,
    firstTouchAt: existing.firstTouchAt || incoming.firstTouchAt,
    lastTouchAt: incoming.lastTouchAt || existing.lastTouchAt,
    displayLabel: incoming.displayLabel || existing.displayLabel,
  }
}
