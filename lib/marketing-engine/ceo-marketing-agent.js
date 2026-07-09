import { randomUUID } from 'crypto'
import { BRAND, COLLECTIONS } from './constants.js'
import { getMarketingDashboard } from './analytics.js'
import { generateMarketingCopy } from './llm.js'

/**
 * CEO Marketing Agent — daily executive report + publishing queue summary
 */
export async function runCeoMarketingAgent(db, orgId, { date = new Date(), skipLlm = false } = {}) {
  const day = date.toISOString().slice(0, 10)
  const existing = await db.collection(COLLECTIONS.REPORTS).findOne(
    { orgId, day, type: 'daily' },
    { projection: { _id: 0, id: 1, title: 1, day: 1 } },
  )
  if (existing) return { skipped: true, day, reportId: existing.id, title: existing.title }

  const dashboard = await getMarketingDashboard(db, orgId)
  const pendingApproval = await db.collection(COLLECTIONS.CONTENT).countDocuments({
    orgId,
    status: { $in: ['draft', 'scheduled'] },
  })
  const publishedToday = await db.collection(COLLECTIONS.PUBLISH_LOG).countDocuments({
    orgId,
    publishedAt: { $gte: `${day}T00:00:00.000Z`, $lte: `${day}T23:59:59.999Z` },
  })

  const fallback = {
    title: `Daily Marketing Report — ${BRAND.company} — ${day}`,
    executiveSummary: `Leads (30d): ${dashboard.leads.total}. Hot: ${dashboard.leads.hot}. Content published today: ${publishedToday}. Pending queue: ${pendingApproval}.`,
    highlights: [
      `${dashboard.leads.total} leads in last 30 days`,
      `${dashboard.content.published} total content pieces published`,
      `${pendingApproval} items in publishing queue`,
    ],
    recommendations: [
      'Review hot leads in LeadEdge360 before EOD',
      'Approve scheduled posts in Marketing Engine if needed',
      'Share top LinkedIn post with sales team',
    ],
    kpis: dashboard,
  }

  const { text, engine } = await generateMarketingCopy({
    system: `CEO Marketing Agent for ${BRAND.company}. Write a concise daily marketing briefing for the founder. Factual only — use provided metrics. Include action items.`,
    user: JSON.stringify({ day, dashboard, pendingApproval, publishedToday }),
    fallback: fallback.executiveSummary,
    temperature: 0.4,
    skipLlm,
  })

  const report = {
    id: randomUUID(),
    orgId,
    day,
    type: 'daily',
    agentId: 'ceo-marketing-agent',
    title: fallback.title,
    body: text,
    highlights: fallback.highlights,
    recommendations: fallback.recommendations,
    kpis: dashboard,
    pendingApproval,
    publishedToday,
    engine,
    createdAt: new Date().toISOString(),
  }

  await db.collection(COLLECTIONS.REPORTS).insertOne(report)
  return { skipped: false, day, reportId: report.id, title: report.title, engine }
}

export async function getLatestDailyReport(db, orgId) {
  return db.collection(COLLECTIONS.REPORTS)
    .findOne({ orgId, type: 'daily' }, { sort: { day: -1 }, projection: { _id: 0 } })
}
