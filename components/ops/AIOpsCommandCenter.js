'use client'

import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/src/lib/api'
import { PageHeader, SectionHeader } from '@/components/design-system/core/PageHeader'
import { Card, CardContent } from '@/components/design-system/core/Card'
import { Badge } from '@/components/design-system/core/Badge'
import { LoadingState } from '@/components/design-system/core/LoadingState'
import { KPICard } from '@/components/design-system/core/KPICard'
import {
  Bot, CheckCircle2, Clock, AlertTriangle, Users, Gauge, Database, Activity,
} from 'lucide-react'

export function AIOpsCommandCenter() {
  const opsQuery = useQuery({
    queryKey: ['platform', 'ai-ops'],
    queryFn: () => apiGet('/platform/ai-ops'),
  })

  const analyticsQuery = useQuery({
    queryKey: ['platform', 'event-analytics'],
    queryFn: () => apiGet('/platform/events/analytics', { days: 30 }),
  })

  if (opsQuery.isLoading) {
    return <LoadingState label="Loading AI operations…" rows={8} />
  }

  const ops = opsQuery.data || {}
  const analytics = analyticsQuery.data?.analytics || {}
  const agents = ops.agents || []
  const health = ops.health || {}

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Operations Command Center"
        description="Control center for Agentic AI employees — tasks, health, utilization, and confidence."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
        <KPICard label="Active agents" value={ops.activeAgents ?? 0} icon={<Bot className="size-5" />} />
        <KPICard label="Running tasks" value={ops.runningTasks ?? 0} icon={<Activity className="size-5" />} />
        <KPICard label="Waiting" value={ops.waitingTasks ?? 0} icon={<Clock className="size-5" />} />
        <KPICard label="Failed" value={ops.failedTasks ?? 0} trend="down" icon={<AlertTriangle className="size-5" />} />
        <KPICard label="Avg confidence" value={`${ops.averageConfidence ?? 0}%`} icon={<Gauge className="size-5" />} />
        <KPICard label="Response time" value={`${ops.averageResponseTimeMs ?? 0}ms`} icon={<Clock className="size-5" />} />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <KPICard label="Human escalations" value={ops.humanEscalations ?? 0} icon={<Users className="size-5" />} />
        <KPICard label="Pending approvals" value={ops.pendingApprovals ?? 0} icon={<CheckCircle2 className="size-5" />} />
        <KPICard
          label="Automation %"
          value={`${analytics.humanVsAiRatio?.automationPercentage ?? 0}%`}
          icon={<Bot className="size-5" />}
        />
      </div>

      <Card variant="glass">
        <CardContent className="p-5">
          <SectionHeader title="AI Employees" description="Agentic workforce status" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {agents.map((agent) => (
              <div key={agent.id} className="rounded-lg border border-border/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">🤖</span>
                  <Badge variant={agent.status === 'active' ? 'success' : 'outline'}>{agent.status}</Badge>
                </div>
                <p className="font-medium text-sm">{agent.name}</p>
                <p className="text-xs text-muted-foreground">{agent.role}</p>
                <p className="text-xs mt-2">
                  Tasks today: {agent.tasksToday}
                  {agent.avgConfidence != null && ` · ${agent.avgConfidence}% confidence`}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card variant="glass">
          <CardContent className="p-5">
            <SectionHeader title="Event analytics (30d)" description="Derived from platform event store" />
            <ul className="space-y-2 text-sm mt-3">
              <StatRow label="Leads created" value={analytics.leadsCreated} />
              <StatRow label="Proposals generated" value={analytics.proposalsGenerated} />
              <StatRow label="Invoices paid" value={analytics.invoicesPaid} />
              <StatRow label="Campaigns launched" value={analytics.campaignsLaunched} />
              <StatRow label="AI tasks completed" value={analytics.aiTasksCompleted} />
              <StatRow label="Human vs AI" value={`${analytics.humanVsAiRatio?.human ?? 0} / ${analytics.humanVsAiRatio?.ai ?? 0}`} />
            </ul>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-5">
            <SectionHeader title="Infrastructure health" />
            <ul className="space-y-2 text-sm mt-3">
              <StatRow label="MongoDB" value={health.mongodb?.ok ? 'Healthy' : 'Degraded'} />
              <StatRow label="Event queue" value={ops.eventQueueHealth?.eventQueue ?? 0} />
              <StatRow label="Events / min" value={ops.eventQueueHealth?.eventsPerMinute ?? 0} />
              <StatRow label="n8n" value={health.n8n?.ok === null ? 'Not configured' : health.n8n?.ok ? 'OK' : 'Down'} />
              <StatRow label="API" value={health.api?.ok ? 'OK' : 'Down'} />
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatRow({ label, value }) {
  return (
    <li className="flex justify-between border-b border-border/30 pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value ?? '—'}</span>
    </li>
  )
}
