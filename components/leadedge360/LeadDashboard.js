'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { LEADS_LIST_PATH } from '@/lib/leads/paths'
import { apiGet } from '@/src/lib/api'
import { PageHeader } from '@/components/design-system/core/PageHeader'
import { KPICard } from '@/components/design-system/core/KPICard'
import { Card, CardContent } from '@/components/design-system/core/Card'
import { Button } from '@/components/design-system/core/Button'
import { LoadingState } from '@/components/design-system/core/LoadingState'
import { LeadAnalytics } from './LeadAnalytics'
import { LeadFilterBar } from './LeadFilterBar'
import { LeadCaptureDialog } from './LeadCaptureDialog'
import {
  Users, Target, TrendingUp, Flame, Plus, Sparkles, Bot, ArrowRight, BriefcaseBusiness, Megaphone,
} from 'lucide-react'
import { AIInsightsPanel } from './enterprise/AIInsightsPanel'

export function LeadDashboard() {
  const [role, setRole] = useState('admin')
  const [filterTerr, setFilterTerr] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [captureOpen, setCaptureOpen] = useState(false)

  const queryParams = useMemo(() => {
    const params = {}
    if (filterTerr !== 'all') params.territory = filterTerr
    if (filterStatus !== 'all') params.status = filterStatus
    if (role !== 'admin') params.role = role
    return params
  }, [role, filterTerr, filterStatus])

  const leadsQuery = useQuery({
    queryKey: ['leadedge360', 'leads', queryParams],
    queryFn: () => apiGet('/leads', queryParams),
  })

  const kpiQuery = useQuery({
    queryKey: ['leadedge360', 'kpis', queryParams],
    queryFn: () => apiGet('/kpis', queryParams),
  })

  const analyticsQuery = useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: () => apiGet('/analytics/summary'),
  })

  const revenueQuery = useQuery({
    queryKey: ['revenue', 'dashboard'],
    queryFn: () => apiGet('/revenue/dashboard'),
  })

  const opportunitiesQuery = useQuery({
    queryKey: ['opportunities', 'dashboard'],
    queryFn: () => apiGet('/opportunities/dashboard'),
  })

  const scoringQuery = useQuery({
    queryKey: ['lead-scoring', 'dashboard'],
    queryFn: () => apiGet('/lead-scoring/dashboard'),
  })

  const leads = leadsQuery.data?.leads || []
  const kpis = kpiQuery.data
  const revenue = revenueQuery.data
  const opportunities = opportunitiesQuery.data
  const scoring = scoringQuery.data

  const refresh = () => {
    leadsQuery.refetch()
    kpiQuery.refetch()
  }

  const quickLinks = [
    { href: '/leads', label: 'Leads', desc: `${leads.length} active`, icon: Target },
    { href: '/opportunities', label: 'Pipeline', desc: `${opportunities?.total ?? 0} opportunities`, icon: BriefcaseBusiness },
    { href: '/campaigns', label: 'Campaigns', desc: `${analyticsQuery.data?.campaigns ?? 0} campaigns`, icon: Megaphone },
    { href: '/proposals', label: 'Proposals', desc: 'Manage quotes', icon: Sparkles },
  ]

  if (kpiQuery.isLoading) {
    return (
      <div className="container py-10">
        <PageHeader title="Growth Command Center" description="LeadEdge360 · AI-powered revenue growth" />
        <LoadingState label="Loading dashboard…" rows={6} />
      </div>
    )
  }

  return (
    <div className="container py-10 space-y-8">
      <PageHeader
        title="Growth Command Center"
        description="Generate more leads, automate follow-up, and accelerate revenue growth."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <LeadFilterBar
              role={role}
              territory={filterTerr}
              status={filterStatus}
              onRoleChange={setRole}
              onTerritoryChange={setFilterTerr}
              onStatusChange={setFilterStatus}
            />
            <Button className="rounded-full" onClick={() => setCaptureOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> New lead
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard label="New opportunities" value={kpis?.total ?? '—'} icon={<Users className="size-5" />} />
        <KPICard label="High potential" value={kpis?.qualified ?? '—'} icon={<Target className="size-5" />} />
        <KPICard label="Pipeline health" value={`${kpis?.conversion ?? 0}%`} change={`${kpis?.won ?? 0} won`} icon={<TrendingUp className="size-5" />} trend="up" />
        <KPICard label="Hot leads" value={kpis?.hot ?? scoring?.hot ?? '—'} icon={<Flame className="size-5" />} />
        <KPICard
          label="Revenue"
          value={revenue?.totalRevenue ? `₹${(revenue.totalRevenue / 1000).toFixed(0)}k` : '—'}
          icon={<TrendingUp className="size-5" />}
        />
        <KPICard
          label="Scoring engine"
          value={leads[0]?.engine === 'llm' ? 'LLM' : 'Hybrid'}
          icon={<Bot className="size-5" />}
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}>
              <Card className="bg-card/60 border-border/60 hover:border-primary/40 transition-colors h-full">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{item.desc}</div>
                  </div>
                  <Icon className="h-5 w-5 text-primary" />
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <LeadAnalytics kpis={kpis} />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-card/60 border-border/60">
        <CardContent className="p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs tracking-widest text-muted-foreground uppercase">Recent leads</div>
            <div className="font-display font-semibold text-lg">{leads.length} on dashboard view</div>
          </div>
          <Button asChild className="rounded-full">
            <Link href={LEADS_LIST_PATH}>
              View all leads <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardContent>
          </Card>
        </div>
        <AIInsightsPanel compact />
      </div>

      <LeadCaptureDialog open={captureOpen} onOpenChange={setCaptureOpen} onSuccess={refresh} />
    </div>
  )
}
