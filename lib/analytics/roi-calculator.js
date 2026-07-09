import { AD_PLATFORMS } from '../attribution/utm-mapper.js'

const RECOGNIZED = ['PAID', 'Won']

/**
 * Credit revenue to attribution channel using the selected model.
 * @param {object[]} leads
 * @param {object[]} opportunities
 * @param {'first_touch'|'last_touch'|'linear'} model
 */
export function allocateRevenueByModel(leads, opportunities, model = 'last_touch') {
  const oppByLead = Object.fromEntries(
    (opportunities || []).map((o) => [o.leadId, o]),
  )

  const channelCredits = {}

  function addCredit(channelKey, amount, leadId) {
    if (!channelCredits[channelKey]) {
      channelCredits[channelKey] = { channel: channelKey, revenue: 0, leads: new Set() }
    }
    channelCredits[channelKey].revenue += amount
    channelCredits[channelKey].leads.add(leadId)
  }

  for (const lead of leads) {
    const attr = lead.attribution
    if (!attr) continue

    const opp = oppByLead[lead.id]
    const amount = Number(
      opp?.expectedValue
      || opp?.amount
      || (RECOGNIZED.includes(lead.status) ? lead.budget : 0)
      || 0,
    )
    if (amount <= 0) continue

    const touchpoints = attr.touchpoints?.length
      ? attr.touchpoints
      : [{ channel: attr.channel || attr.platform, campaignName: attr.campaignName }]

    if (model === 'first_touch') {
      const tp = touchpoints[0]
      const key = `${tp.channel}:${tp.campaignName || 'unknown'}`
      addCredit(key, amount, lead.id)
    } else if (model === 'last_touch') {
      const tp = touchpoints[touchpoints.length - 1]
      const key = `${tp.channel}:${tp.campaignName || 'unknown'}`
      addCredit(key, amount, lead.id)
    } else {
      const share = amount / touchpoints.length
      for (const tp of touchpoints) {
        const key = `${tp.channel}:${tp.campaignName || 'unknown'}`
        addCredit(key, share, lead.id)
      }
    }
  }

  return Object.values(channelCredits).map((row) => ({
    channel: row.channel,
    revenue: Math.round(row.revenue),
    leadCount: row.leads.size,
  }))
}

/**
 * Ad spend vs revenue per channel / campaign.
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 * @param {{ model?: string, days?: number }} [options]
 */
export async function calculateChannelRoi(db, orgId, options = {}) {
  const model = options.model || 'last_touch'
  const days = options.days || 90
  const since = new Date()
  since.setDate(since.getDate() - days)

  const [campaigns, leads, opportunities] = await Promise.all([
    db.collection('ad_campaigns').find({ orgId }).toArray(),
    db.collection('leads').find({
      orgId,
      'attribution.campaignName': { $exists: true },
      createdAt: { $gte: since },
    }).toArray(),
    db.collection('opportunities').find({ orgId }).toArray(),
  ])

  const spendByChannel = {}
  for (const c of campaigns) {
    const key = `${c.platform}:${c.name}`
    if (!spendByChannel[key]) {
      spendByChannel[key] = {
        platform: c.platform,
        campaignName: c.name,
        campaignId: c.externalId,
        spend: 0,
        impressions: 0,
        clicks: 0,
        leads: 0,
        revenue: 0,
      }
    }
    spendByChannel[key].spend += Number(c.spend || 0)
    spendByChannel[key].impressions += Number(c.impressions || 0)
    spendByChannel[key].clicks += Number(c.clicks || 0)
  }

  for (const lead of leads) {
    const name = lead.attribution?.campaignName
    const platform = lead.attribution?.platform || lead.attribution?.channel
    if (!name || !platform) continue
    const key = `${platform}:${name}`
    if (!spendByChannel[key]) {
      spendByChannel[key] = {
        platform,
        campaignName: name,
        campaignId: lead.attribution?.campaignId,
        spend: 0,
        impressions: 0,
        clicks: 0,
        leads: 0,
        revenue: 0,
      }
    }
    spendByChannel[key].leads += 1
  }

  const revenueCredits = allocateRevenueByModel(leads, opportunities, model)
  for (const row of revenueCredits) {
    const [platform, ...nameParts] = row.channel.split(':')
    const campaignName = nameParts.join(':')
    const key = `${platform}:${campaignName}`
    if (!spendByChannel[key]) {
      spendByChannel[key] = {
        platform,
        campaignName,
        campaignId: null,
        spend: 0,
        impressions: 0,
        clicks: 0,
        leads: 0,
        revenue: 0,
      }
    }
    spendByChannel[key].revenue += row.revenue
  }

  const channels = Object.values(spendByChannel).map((row) => {
    const spend = Math.round(row.spend * 100) / 100
    const revenue = Math.round(row.revenue)
    const roas = spend > 0 ? Math.round((revenue / spend) * 100) / 100 : null
    const cpl = row.leads > 0 && spend > 0 ? Math.round(spend / row.leads) : null
    const platformLabel = row.platform === AD_PLATFORMS.META ? 'Meta Ads' : 'Google Ads'

    return {
      ...row,
      spend,
      revenue,
      roas,
      cpl,
      platformLabel,
      roi: spend > 0 ? Math.round(((revenue - spend) / spend) * 100) : null,
    }
  }).sort((a, b) => b.revenue - a.revenue)

  const totals = channels.reduce(
    (acc, c) => ({
      spend: acc.spend + c.spend,
      revenue: acc.revenue + c.revenue,
      leads: acc.leads + c.leads,
    }),
    { spend: 0, revenue: 0, leads: 0 },
  )

  return {
    success: true,
    model,
    periodDays: days,
    totals: {
      ...totals,
      roas: totals.spend > 0 ? Math.round((totals.revenue / totals.spend) * 100) / 100 : null,
      roi: totals.spend > 0 ? Math.round(((totals.revenue - totals.spend) / totals.spend) * 100) : null,
    },
    channels,
  }
}

/**
 * Attribution summary for reports (first / last / linear side by side).
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 */
export async function calculateAttributionSummary(db, orgId) {
  const leads = await db.collection('leads')
    .find({ orgId, 'attribution.campaignName': { $exists: true } })
    .toArray()
  const opportunities = await db.collection('opportunities').find({ orgId }).toArray()

  const models = ['first_touch', 'last_touch', 'linear']
  const byModel = {}
  for (const model of models) {
    byModel[model] = allocateRevenueByModel(leads, opportunities, model)
  }

  const campaigns = await db.collection('ad_campaigns').find({ orgId }).toArray()
  const spendByPlatform = {
    [AD_PLATFORMS.META]: campaigns.filter((c) => c.platform === AD_PLATFORMS.META).reduce((s, c) => s + Number(c.spend || 0), 0),
    [AD_PLATFORMS.GOOGLE]: campaigns.filter((c) => c.platform === AD_PLATFORMS.GOOGLE).reduce((s, c) => s + Number(c.spend || 0), 0),
  }

  return {
    success: true,
    attributedLeads: leads.length,
    spendByPlatform,
    models: byModel,
    funnel: {
      metaLeads: leads.filter((l) => l.attribution?.platform === AD_PLATFORMS.META).length,
      googleLeads: leads.filter((l) => l.attribution?.platform === AD_PLATFORMS.GOOGLE).length,
      wonLeads: leads.filter((l) => l.status === 'Won').length,
    },
  }
}
