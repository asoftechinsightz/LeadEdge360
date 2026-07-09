import { COLLECTIONS } from './constants.js'

/**
 * Phase 8 — Marketing analytics aggregation
 */
export async function getMarketingDashboard(db, orgId, { sinceDays = 30 } = {}) {
  const since = new Date(Date.now() - sinceDays * 86400000).toISOString()

  const [
    contentTotal,
    contentPublished,
    publishLog,
    leadsBySource,
    leadsTotal,
    hotLeads,
    proposals,
    meetings,
    campaigns,
  ] = await Promise.all([
    db.collection(COLLECTIONS.CONTENT).countDocuments({ orgId }),
    db.collection(COLLECTIONS.CONTENT).countDocuments({ orgId, status: 'published' }),
    db.collection(COLLECTIONS.PUBLISH_LOG).countDocuments({ orgId, publishedAt: { $gte: since } }),
    db.collection('leads').aggregate([
      { $match: { orgId, createdAt: { $gte: since } } },
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).toArray(),
    db.collection('leads').countDocuments({ orgId, createdAt: { $gte: since } }),
    db.collection('leads').countDocuments({ orgId, label: 'Hot', createdAt: { $gte: since } }),
    db.collection('proposals').countDocuments({ orgId, createdAt: { $gte: since } }),
    db.collection('follow_ups').countDocuments({
      orgId,
      createdAt: { $gte: since },
      title: { $regex: 'meeting|demo|call', $options: 'i' },
    }),
    db.collection('campaigns').countDocuments({ orgId, createdAt: { $gte: since } }),
  ])

  const revenue = await db.collection('payments').aggregate([
    { $match: { orgId, createdAt: { $gte: since } } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]).toArray()

  return {
    period: { sinceDays, since },
    content: { total: contentTotal, published: contentPublished, postsThisPeriod: publishLog },
    leads: {
      total: leadsTotal,
      hot: hotLeads,
      conversionRate: leadsTotal ? Math.round((hotLeads / leadsTotal) * 1000) / 10 : 0,
      bySource: leadsBySource.map((r) => ({ source: r._id || 'unknown', count: r.count })),
    },
    sales: {
      proposals,
      meetings,
      campaigns,
      revenue: revenue[0]?.total || 0,
    },
    social: {
      publishedThisPeriod: publishLog,
      engagement: 'connect_n8n_analytics',
    },
  }
}
