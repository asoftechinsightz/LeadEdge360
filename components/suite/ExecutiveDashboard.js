'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/src/lib/api'
import { PageHeader, SectionHeader } from '@/components/design-system/core/PageHeader'
import { KPICard } from '@/components/design-system/core/KPICard'
import { Card, CardContent } from '@/components/design-system/core/Card'
import { LoadingState } from '@/components/design-system/core/LoadingState'
import { EmptyState } from '@/components/design-system/core/EmptyState'
import { Button } from '@/components/design-system/core/Button'
import { RecentActivityFeed } from '@/components/suite/RecentActivityFeed'
import {
  Users, Target, TrendingUp, Flame, CalendarClock, IndianRupee, FileText, Receipt, ArrowRight,
} from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'

function sumStats(stats = [], field = 'count') {
  return stats.reduce((acc, row) => acc + Number(row[field] || 0), 0)
}

export function ExecutiveDashboard() {
  const kpisQuery = useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: () => apiGet('/dashboard/kpis'),
  })

  const followupsQuery = useQuery({
    queryKey: ['dashboard', 'followups-due'],
    queryFn: () => apiGet('/dashboard/followups-due'),
  })

  const revenueQuery = useQuery({
    queryKey: ['dashboard', 'revenue', '30d'],
    queryFn: () => apiGet('/dashboard/revenue', { range: '30d' }),
  })

  const salesQuery = useQuery({
    queryKey: ['dashboard', 'sales-performance'],
    queryFn: () => apiGet('/dashboard/sales-performance'),
  })

  const activitiesQuery = useQuery({
    queryKey: ['activities', 'dashboard'],
    queryFn: () => apiGet('/activities', { limit: 8 }),
  })

  const proposalsQuery = useQuery({
    queryKey: ['dashboard', 'proposals'],
    queryFn: () => apiGet('/dashboard/proposals'),
  })

  const invoicesQuery = useQuery({
    queryKey: ['dashboard', 'invoices'],
    queryFn: () => apiGet('/dashboard/invoices'),
  })

  const kpis = kpisQuery.data
  const followups = followupsQuery.data
  const revenue = revenueQuery.data
  const sales = salesQuery.data
  const activities = activitiesQuery.data?.activities || []
  const proposalStats = proposalsQuery.data?.stats || []
  const invoiceStats = invoicesQuery.data?.stats || []

  const isLoading = kpisQuery.isLoading || revenueQuery.isLoading

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Executive Command Center" description="Cross-product growth, revenue, and pipeline intelligence." />
        <LoadingState label="Loading executive dashboard…" rows={5} />
      </div>
    )
  }

  const revenueSeries = (revenue?.series || []).map((point) => ({
    ...point,
    label: point.date?.slice(5) || point.date,
  }))

  const agentChart = (sales?.byAgent || []).slice(0, 6)

  return (
    <div className="space-y-8">
      <PageHeader
        title="Executive Command Center"
        description="Unified view of leads, revenue, follow-ups, and CRM health."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">LeadEdge360 <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard label="Total leads" value={kpis?.totalLeads ?? '—'} icon={<Users className="size-5" />} />
        <KPICard label="Qualified" value={kpis?.qualifiedLeads ?? '—'} icon={<Target className="size-5" />} />
        <KPICard label="Conversion" value={kpis?.conversion != null ? `${kpis.conversion}%` : '—'} icon={<TrendingUp className="size-5" />} trend="up" />
        <KPICard label="Hot leads" value={kpis?.hotLeads ?? '—'} icon={<Flame className="size-5" />} />
        <KPICard
          label="Revenue (30d)"
          value={revenue?.total != null ? `₹${Number(revenue.total).toLocaleString()}` : '—'}
          icon={<IndianRupee className="size-5" />}
        />
        <KPICard
          label="Follow-ups due"
          value={followups?.dueWithin24h ?? '—'}
          change={followups?.overdue ? `${followups.overdue} overdue` : undefined}
          trend={followups?.overdue ? 'down' : 'neutral'}
          icon={<CalendarClock className="size-5" />}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card variant="glass" className="lg:col-span-2">
          <CardContent className="p-5">
            <SectionHeader title="Revenue trend" description="Won deal value · last 30 days" />
            <div className="h-64">
              {revenueSeries.length === 0 ? (
                <EmptyState title="No revenue data yet" description="Won leads will populate this chart." className="py-8" />
              ) : (
                <ResponsiveContainer>
                  <LineChart data={revenueSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: '#071B4D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }} />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(var(--brand-orange))" strokeWidth={2.5} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-5">
            <SectionHeader title="CRM snapshot" />
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border/60 p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-sm font-medium">Proposals</div>
                    <div className="text-xs text-muted-foreground">{sumStats(proposalStats)} total</div>
                  </div>
                </div>
                <Button asChild size="sm" variant="ghost"><Link href="/proposals">View</Link></Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/60 p-4">
                <div className="flex items-center gap-3">
                  <Receipt className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-sm font-medium">Invoices</div>
                    <div className="text-xs text-muted-foreground">{sumStats(invoiceStats)} total</div>
                  </div>
                </div>
                <Button asChild size="sm" variant="ghost"><Link href="/invoices">View</Link></Button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-muted/40 p-3">
                  <div className="text-muted-foreground text-xs">Open leads</div>
                  <div className="text-xl font-bold mt-1">{kpis?.openLeads ?? '—'}</div>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <div className="text-muted-foreground text-xs">Won leads</div>
                  <div className="text-xl font-bold mt-1">{kpis?.wonLeads ?? '—'}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card variant="glass">
          <CardContent className="p-5">
            <SectionHeader title="Sales performance" description="Top agents by revenue" />
            <div className="h-64">
              {agentChart.length === 0 ? (
                <EmptyState title="No agent data" className="py-8" />
              ) : (
                <ResponsiveContainer>
                  <BarChart data={agentChart} layout="vertical" margin={{ left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                    <YAxis type="category" dataKey="name" width={90} stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ background: '#071B4D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }} />
                    <Bar dataKey="revenue" fill="hsl(var(--brand-electric))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-5">
            <SectionHeader title="Recent activity" description="Latest CRM events with business context" />
            <div className="max-h-80 overflow-y-auto pr-1">
              <RecentActivityFeed
                activities={activities}
                limit={8}
                compact
                showControls={false}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {(followups?.followups?.length > 0) && (
        <Card variant="glass">
          <CardContent className="p-5">
            <SectionHeader title="Follow-ups due within 24h" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {followups.followups.slice(0, 6).map((f) => (
                <div key={f.id} className="rounded-lg border border-border/60 p-4 text-sm">
                  <div className="font-medium">{f.title || 'Follow-up'}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Due {f.dueAt ? new Date(f.dueAt).toLocaleString() : '—'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
