'use client'

import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/src/lib/api'
import { PageHeader, SectionHeader } from '@/components/design-system/core/PageHeader'
import { Card, CardContent } from '@/components/design-system/core/Card'
import { KPICard } from '@/components/design-system/core/KPICard'
import { LoadingState } from '@/components/design-system/core/LoadingState'
import { Badge } from '@/components/design-system/core/Badge'

export function AIWorkforceAnalytics() {
  const analyticsQuery = useQuery({
    queryKey: ['agents', 'analytics'],
    queryFn: () => apiGet('/agents/analytics', { sinceDays: 30 }),
  })

  const usageQuery = useQuery({
    queryKey: ['agents', 'usage-detail'],
    queryFn: () => apiGet('/agents/usage', { sinceHours: 720, groupBy: 'agent' }),
  })

  if (analyticsQuery.isLoading) return <LoadingState label="Loading workforce analytics…" rows={8} />

  const a = analyticsQuery.data?.analytics || {}
  const usage = usageQuery.data?.usage?.byGroup || []

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Workforce Analytics"
        description="Human vs AI productivity, business value, and cost metrics (30 days)."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="AI tasks" value={a.aiTasks ?? 0} />
        <KPICard label="Human tasks" value={a.humanTasks ?? 0} />
        <KPICard label="AI share" value={`${a.humanVsAiRatio?.ai ?? 0}%`} />
        <KPICard label="Tasks completed" value={a.tasksCompleted ?? 0} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Avg confidence" value={a.avgConfidence ? `${Math.round(a.avgConfidence * 100)}%` : '—'} />
        <KPICard label="Avg processing" value={a.avgProcessingMs ? `${Math.round(a.avgProcessingMs / 1000)}s` : '—'} />
        <KPICard label="Leads qualified" value={a.leadsQualified ?? 0} />
        <KPICard label="Proposals generated" value={a.proposalsGenerated ?? 0} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <KPICard label="Revenue influenced" value={a.revenueInfluenced ? `₹${a.revenueInfluenced.toLocaleString()}` : '—'} />
        <KPICard label="Token usage" value={a.usage?.tokens ?? 0} />
        <KPICard label="Approval rate" value={`${a.approval?.approvalRate ?? 0}%`} />
      </div>

      <Card variant="glass">
        <CardContent className="p-5">
          <SectionHeader title="Per-agent usage" description="Cost and task volume by AI employee" />
          {usage.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No usage data yet.</p>
          ) : (
            <ul className="divide-y divide-border/50 mt-3">
              {usage.map((row) => (
                <li key={row.key} className="py-3 flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">{row.key}</span>
                  <div className="flex gap-2">
                    <Badge variant="outline">{row.tasks} tasks</Badge>
                    <Badge variant="outline">{row.tokens} tokens</Badge>
                    <Badge variant="outline">₹{row.cost?.toFixed(2)}</Badge>
                    <Badge variant="outline">{row.successRate}% success</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card variant="glass">
        <CardContent className="p-5">
          <SectionHeader title="Agent performance" />
          <ul className="divide-y divide-border/50 mt-3">
            {(a.agentPerformance || []).map((row) => (
              <li key={row.agentId} className="py-2 flex justify-between text-sm">
                <span>{row.agentId}</span>
                <span className="text-muted-foreground">
                  {row.completed} completed · {row.avgConfidence != null ? `${Math.round(row.avgConfidence * 100)}% conf` : '—'}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
