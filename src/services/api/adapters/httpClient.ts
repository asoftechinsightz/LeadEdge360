import { apiGet, apiPost } from '@/src/lib/api';
import type { LeadEdgeApiClient } from '../types';

/**
 * HTTP adapter — delegates to existing backend when available.
 * Falls back gracefully; enterprise screens should set USE_MOCK_API=true until backend is ready.
 */
export const httpLeadEdgeApi: LeadEdgeApiClient = {
  async getCommandCenter() {
    const [kpis, activities] = await Promise.all([
      apiGet('/kpis').catch(() => ({})),
      apiGet('/activities', { limit: 5 }).catch(() => ({ activities: [] })),
    ]);
    return {
      kpis: {
        totalLeads: kpis?.total ?? 0,
        hotLeads: kpis?.hot ?? 0,
        pipelineValue: 0,
        conversionRate: kpis?.conversion ?? 0,
        revenueWon: 0,
        automationsActive: 0,
      },
      activityFeed: (activities?.activities || []).slice(0, 5).map((a: {
        id?: string
        title?: string
        leadName?: string
        companyName?: string
        relativeTime?: string
        text?: string
        time?: string
      }, i: number) => ({
        id: a.id || `act-${i}`,
        text: a.text || `${a.title || 'Activity'} — ${a.leadName || 'Contact'}${a.companyName && a.companyName !== '—' ? ` (${a.companyName})` : ''}`,
        time: a.relativeTime || a.time || '',
      })),
      priorityActions: [],
    };
  },

  async getAIInsights() {
    const data = await apiGet('/kpis').catch(() => null);
    if (!data) return [];
    return [
      {
        id: 'live-1',
        type: 'forecast' as const,
        title: 'Pipeline snapshot',
        summary: `${data.total ?? 0} leads · ${data.conversion ?? 0}% conversion`,
        impact: 'medium' as const,
        confidence: 75,
        createdAt: new Date().toISOString(),
      },
    ];
  },

  async getGeoLeads(params?: {
    city?: string
    state?: string
    district?: string
    pinCode?: string
    country?: string
    industry?: string
    radius?: number
    source?: string
    sources?: string[]
    qualityOnly?: boolean
    run?: boolean
  }) {
    if (params?.run) {
      const scan = await apiPost<{
        results?: Array<{
          id?: string
          company?: string
          address?: string
          city?: string
          phone?: string
          website?: string
          rating?: number
          score?: number
          label?: string
          source?: string
          quality?: string
          industry?: string
        }>
        stats?: {
          totalFound?: number
          totalStored?: number
          totalRejected?: number
          totalDuplicates?: number
          warnings?: string[]
        }
      }>('/scanner/jobs', {
        city: params.city,
        state: params.state,
        district: params.district,
        pinCode: params.pinCode,
        country: params.country,
        industry: params.industry,
        radiusKm: params.radius,
        source: params.source,
        sources: params.sources,
        qualityOnly: params.qualityOnly,
        run: true,
      })
      const mapped = (scan?.results || []).map((r, i) => ({
        id: r.id || `geo-${i}`,
        businessName: r.company || 'Business',
        category: r.industry || params.industry || 'General',
        address: r.address || '',
        city: r.city || params.city || '',
        phone: r.phone || '',
        website: r.website,
        rating: r.rating,
        score: r.score ?? 50,
        label: r.label,
        source: r.source,
        quality: r.quality,
        distanceKm: 0,
        lat: 0,
        lng: 0,
      }))
      return { items: mapped, stats: scan?.stats }
    }

    const data = await apiGet<{ items?: Array<Record<string, unknown>> }>('/scanner/results', { limit: 50 })
    return {
      items: (data?.items || []).map((r, i) => ({
        id: String(r.id || `geo-${i}`),
        businessName: String(r.company || r.name || 'Business'),
        category: String(r.category || r.industry || params?.industry || 'General'),
        address: String(r.address || ''),
        city: String(r.city || ''),
        phone: String(r.phone || ''),
        website: r.website ? String(r.website) : undefined,
        rating: typeof r.rating === 'number' ? r.rating : undefined,
        score: typeof r.score === 'number' ? r.score : 50,
        label: r.label ? String(r.label) : undefined,
        source: r.source ? String(r.source) : undefined,
        quality: r.quality ? String(r.quality) : undefined,
        distanceKm: 0,
        lat: 0,
        lng: 0,
      })),
    }
  },

  async getTerritories() {
    const data = await apiGet('/kpis').catch(() => ({ byTerritory: [] }));
    return (data?.byTerritory || []).map((t: { name: string; leads?: number; value?: number }, i: number) => ({
      id: `t-${i}`,
      name: t.name,
      region: 'India',
      manager: '—',
      leadCount: t.leads ?? 0,
      wonRevenue: t.value ?? 0,
      conversion: 0,
      agents: 0,
      status: 'active' as const,
    }));
  },

  async getGrowthAudits() {
    const data = await apiGet('/scanner/results').catch(() => ({ results: [] }));
    return (data?.results || []).slice(0, 10).map((r: { id?: string; company?: string; website?: string; score?: number }, i: number) => ({
      id: r.id || `ga-${i}`,
      company: r.company || 'Company',
      website: r.website || '',
      score: r.score ?? 0,
      grade: 'B' as const,
      issues: 0,
      scannedAt: new Date().toISOString(),
      status: 'completed' as const,
    }));
  },

  async getAutomations() {
    const data = await apiGet('/campaigns/summary').catch(() => null);
    if (!data) return [];
    return [
      {
        id: 'camp-summary',
        name: 'Campaign automations',
        trigger: 'Campaign engine',
        channel: 'Multi',
        status: 'active' as const,
        runs: data.running ?? 0,
        conversions: data.completed ?? 0,
        lastRunAt: new Date().toISOString(),
      },
    ];
  },

  async getRevenueIntelligence() {
    const data = await apiGet('/revenue/dashboard').catch(() => ({}));
    const trend = await apiGet('/dashboard/revenue', { range: '90d' }).catch(() => ({ series: [] }));
    const bySource = await apiGet('/revenue/by-source').catch(() => ({ items: [] }));
    const byTerritory = await apiGet('/revenue/by-source', { dimension: 'territory' }).catch(() => ({ items: [] }));
    return {
      totalRevenue: data?.totalRevenue ?? 0,
      forecastRevenue: data?.totalRevenue ?? 0,
      avgDealSize: data?.averageDealSize ?? 0,
      winRate: 0,
      series: (trend?.series || []).map((p: { date?: string; revenue?: number }) => ({
        month: p.date?.slice(5, 7) || '',
        revenue: p.revenue ?? 0,
        forecast: p.revenue ?? 0,
      })),
      byTerritory: (byTerritory?.items || []).map((row: { name?: string; amount?: number }) => ({
        name: row.name || 'Unknown',
        revenue: row.amount ?? 0,
      })),
      bySource: (bySource?.items || []).map((row: { name?: string; amount?: number }) => ({
        name: row.name || 'Unknown',
        revenue: row.amount ?? 0,
      })),
    };
  },

  async getLeads(params) {
    const data = await apiGet('/sales/leads', params).catch(() => apiGet('/leads', params));
    return {
      items: data?.items || data?.leads || [],
      total: data?.total ?? (data?.items?.length || 0),
      page: data?.page ?? 1,
      pages: data?.pages ?? 1,
    };
  },

  async getExecutiveDashboard() {
    const command = await this.getCommandCenter()
    return {
      kpis: command.kpis,
      activityFeed: command.activityFeed,
      priorityActions: command.priorityActions,
      pipelineHealth: command.kpis.conversionRate,
      revenueWon: command.kpis.revenueWon,
    }
  },

  async getAIWorkspace() {
    const [dashboard, priority, leadsRes, oppsRes, campaignsRes, revenueRes] = await Promise.all([
      apiGet<{ hot?: number; warm?: number; cold?: number }>('/lead-scoring/dashboard').catch(() => null),
      apiGet<{ items?: Array<Record<string, unknown>> }>('/lead-scoring/priority').catch(() => null),
      apiGet<{ items?: Array<Record<string, unknown>>; leads?: Array<Record<string, unknown>>; total?: number }>('/sales/leads', { limit: 20 }).catch(() =>
        apiGet('/leads', { limit: 20 }).catch(() => null),
      ),
      apiGet<{ items?: Array<Record<string, unknown>> }>('/opportunities').catch(() => null),
      apiGet<{ running?: number; completed?: number }>('/campaigns/summary').catch(() => null),
      apiGet<{ totalRevenue?: number }>('/revenue/dashboard').catch(() => null),
    ])

    const hot = dashboard?.hot ?? 0
    const warm = dashboard?.warm ?? 0
    const cold = dashboard?.cold ?? 0
    const scoredTotal = hot + warm + cold
    const leadItems = leadsRes?.items || leadsRes?.leads || []
    const leadTotal = leadsRes?.total ?? leadItems.length
    const oppItems = oppsRes?.items || []
    const automations = (campaignsRes?.running ?? 0) + (campaignsRes?.completed ?? 0)

    const modules = [
      { id: 'scoring', name: 'AI Lead Scoring', description: 'Real-time lead quality assessment', count: scoredTotal || leadTotal },
      { id: 'recommendations', name: 'AI Recommendations', description: 'Next-best-action suggestions', count: hot },
      { id: 'revenue', name: 'Revenue Prediction', description: 'Forecast pipeline revenue', count: revenueRes?.totalRevenue ? 1 : 0 },
      { id: 'campaign', name: 'Campaign Generator', description: 'AI-crafted campaign copy', count: automations },
      { id: 'followup', name: 'Follow-up Assistant', description: 'Smart nurture sequences', count: warm },
      { id: 'opportunity', name: 'Opportunity Intelligence', description: 'Win probability analysis', count: oppItems.length },
      { id: 'churn', name: 'Churn Risk Detection', description: 'At-risk deal alerts', count: cold },
      { id: 'forecast', name: 'Sales Forecasting', description: 'Quarterly revenue projections', count: oppItems.filter((o) => o.stage && o.stage !== 'Won' && o.stage !== 'Lost').length },
    ]

    const priorityItems = priority?.items || []
    let scoringCards = priorityItems.slice(0, 10).map((row, i) => ({
      id: String(row.leadId || row.id || `score-${i}`),
      leadName: String(row.leadName || row.name || row.company || 'Lead'),
      company: String(row.company || '—'),
      score: Number(row.score ?? 0),
      reason: Array.isArray(row.reasons) ? row.reasons.join(', ') : String(row.reason || 'Based on lead profile and engagement'),
      recommendation: String(row.recommendation || 'Review and follow up'),
      predictedRevenue: Number(row.predictedRevenue ?? row.budget ?? 0),
      confidence: Number(row.confidence ?? Math.min(95, Number(row.score ?? 50))),
      module: String(row.module || 'AI Lead Scoring'),
    }))

    if (!scoringCards.length && leadItems.length) {
      scoringCards = leadItems.slice(0, 10).map((lead, i) => ({
        id: String(lead.id || `lead-${i}`),
        leadName: String(lead.name || lead.fullName || 'Lead'),
        company: String(lead.company || '—'),
        score: Number(lead.score ?? 0),
        reason: Array.isArray(lead.reasons) ? lead.reasons.join(', ') : String(lead.message || lead.source || 'Lead captured'),
        recommendation: lead.label === 'Hot' || (lead.score ?? 0) >= 80 ? 'Prioritize outreach' : 'Nurture with follow-up',
        predictedRevenue: Number(lead.budget ?? 0),
        confidence: Math.min(95, Number(lead.score ?? 50)),
        module: 'AI Lead Scoring',
      }))
    }

    return { modules, scoringCards }
  },

  async getGrowthScores() {
    const data = await apiGet('/lead-scoring/priority').catch(() => null)
    const items = data?.items || []
    return items.map((row: { leadId?: string; company?: string; score?: number; classification?: string }, i: number) => ({
      id: row.leadId || `score-${i}`,
      company: row.company || 'Lead',
      score: row.score ?? 0,
      grade: row.classification || 'WARM',
      trend: 'stable' as const,
    }))
  },

  async getConversations() {
    const data = await apiGet('/whatsapp/threads').catch(() => ({ items: [] }))
    return (data?.items || []).map((t: {
      id?: string
      contact?: string
      channel?: string
      preview?: string
      time?: string
      unread?: boolean
      updatedAt?: string
    }, i: number) => ({
      id: t.id || `conv-${i}`,
      contact: t.contact || 'Contact',
      channel: (t.channel || 'whatsapp') as 'whatsapp',
      preview: t.preview || '',
      time: t.time || '',
      unread: Boolean(t.unread),
      updatedAt: t.updatedAt || new Date().toISOString(),
    }))
  },

  async getReports() {
    const data = await apiGet('/reports/exports').catch(() => ({ items: [] }))
    return (data?.items || data?.exports || []).map((r: { id?: string; name?: string; status?: string; createdAt?: string }, i: number) => ({
      id: r.id || `report-${i}`,
      name: r.name || 'Export',
      type: 'csv' as const,
      status: (r.status || 'ready').toLowerCase() as 'ready' | 'pending' | 'failed',
      createdAt: r.createdAt || new Date().toISOString(),
    }))
  },
};
