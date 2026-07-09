'use client'

import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/src/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line,
} from 'recharts'

const CHART_COLORS = ['#FF8A3D', '#22C55E', '#38BDF8', '#A78BFA', '#F59E0B']

const tooltipStyle = {
  background: '#0B1220',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
}

export function AnalyticsDashboard() {
  const kpiQuery = useQuery({
    queryKey: ['analytics', 'kpis'],
    queryFn: () => apiGet('/kpis'),
  })

  const sourcesQuery = useQuery({
    queryKey: ['analytics', 'sources'],
    queryFn: () => apiGet('/analytics/sources'),
  })

  const campaignsQuery = useQuery({
    queryKey: ['analytics', 'campaigns'],
    queryFn: () => apiGet('/analytics/campaigns'),
  })

  const revenueQuery = useQuery({
    queryKey: ['analytics', 'revenue-trend'],
    queryFn: () => apiGet('/dashboard/revenue', { range: '30d' }),
  })

  const loading = kpiQuery.isLoading || sourcesQuery.isLoading || campaignsQuery.isLoading || revenueQuery.isLoading

  if (loading) {
    return <div className="py-12 text-center text-muted-foreground">Loading analytics…</div>
  }

  const funnel = (kpiQuery.data?.byStatus || []).map((item) => ({
    name: item.name,
    count: item.value,
  }))

  const sources = (sourcesQuery.data?.sources || []).map((item) => ({
    name: item._id || 'Unknown',
    count: item.count,
  }))

  const campaigns = (campaignsQuery.data?.items || []).map((item) => ({
    name: item._id || 'Campaign',
    runs: item.runs || 0,
    leads: item.leads || 0,
  }))

  const revenueSeries = (revenueQuery.data?.series || []).map((point) => ({
    date: point.date,
    revenue: point.revenue || 0,
  }))

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="bg-card/60">
        <CardContent className="p-5">
          <h3 className="font-semibold mb-4">Lead Funnel</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={funnel}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill={CHART_COLORS[0]} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/60">
        <CardContent className="p-5">
          <h3 className="font-semibold mb-4">Lead Source Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={sources}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill={CHART_COLORS[2]} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/60">
        <CardContent className="p-5">
          <h3 className="font-semibold mb-4">Campaign Performance</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={campaigns}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="runs" fill={CHART_COLORS[1]} radius={[6, 6, 0, 0]} name="Runs" />
                <Bar dataKey="leads" fill={CHART_COLORS[3]} radius={[6, 6, 0, 0]} name="Leads" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/60">
        <CardContent className="p-5">
          <h3 className="font-semibold mb-4">Revenue Trend</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={revenueSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => v?.slice(5)} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`₹${Number(v).toLocaleString()}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke={CHART_COLORS[0]} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
