'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost } from '@/src/lib/api'
import { PageHeader, SectionHeader } from '@/components/design-system/core/PageHeader'
import { Card, CardContent } from '@/components/design-system/core/Card'
import { Button } from '@/components/design-system/core/Button'
import { Badge } from '@/components/design-system/core/Badge'
import { LoadingState } from '@/components/design-system/core/LoadingState'
import { KPICard } from '@/components/design-system/core/KPICard'
import { Bot, CheckCircle2, Clock, AlertTriangle, Play, RefreshCw } from 'lucide-react'

const STATUS_VARIANT = {
  completed: 'success',
  running: 'default',
  queued: 'outline',
  awaiting_approval: 'warning',
  failed: 'destructive',
}

export function AgentRuntimeDashboard() {
  const qc = useQueryClient()

  const agentsQuery = useQuery({
    queryKey: ['agents', 'registry'],
    queryFn: () => apiGet('/agents'),
  })

  const tasksQuery = useQuery({
    queryKey: ['agents', 'tasks'],
    queryFn: () => apiGet('/agents/tasks', { limit: 30 }),
  })

  const workerMutation = useMutation({
    mutationFn: () => apiPost('/agents/worker/run', { limit: 10 }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agents'] })
      qc.invalidateQueries({ queryKey: ['platform'] })
    },
  })

  const approveMutation = useMutation({
    mutationFn: (id) => apiPost(`/agents/tasks/${id}/approve`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agents'] }),
  })

  if (agentsQuery.isLoading) {
    return <LoadingState label="Loading agent runtime…" rows={8} />
  }

  const agents = agentsQuery.data?.agents || []
  const runtime = agentsQuery.data?.runtime || {}
  const observability = agentsQuery.data?.observability || {}
  const tasks = tasksQuery.data?.items || []
  const confidence = observability.confidenceDistribution || {}

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Workforce Operations"
        description="Agent runtime platform — queue, observability, approvals, and 12 AI employees."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { agentsQuery.refetch(); tasksQuery.refetch() }}>
              <RefreshCw className="size-4 mr-1" /> Refresh
            </Button>
            <Button size="sm" onClick={() => workerMutation.mutate()} disabled={workerMutation.isPending}>
              <Play className="size-4 mr-1" /> Process queue
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPICard label="Queue depth" value={observability.queueDepth ?? runtime.queued ?? 0} icon={<Clock className="size-5" />} />
        <KPICard label="Running" value={observability.running ?? runtime.running ?? 0} icon={<Bot className="size-5" />} />
        <KPICard label="Awaiting approval" value={observability.awaitingApproval ?? runtime.awaiting ?? 0} icon={<CheckCircle2 className="size-5" />} />
        <KPICard label="Success rate" value={`${observability.successRate ?? 100}%`} icon={<CheckCircle2 className="size-5" />} />
        <KPICard label="Failed / retry" value={`${observability.failedTasks ?? 0} / ${observability.retryQueue ?? 0}`} trend="down" icon={<AlertTriangle className="size-5" />} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <KPICard label="Avg processing" value={observability.avgProcessingMs ? `${Math.round(observability.avgProcessingMs / 1000)}s` : '—'} />
        <KPICard label="SLA compliance" value={`${observability.slaCompliance ?? 100}%`} />
        <KPICard label="Token usage" value={observability.tokenUsage ?? 0} />
        <KPICard label="AI cost" value={observability.aiCost ? `₹${observability.aiCost}` : '—'} />
        <KPICard label="Escalations" value={observability.humanEscalations ?? 0} />
        <KPICard label="Event rate" value={observability.eventProcessingRate ?? 0} />
      </div>

      <Card variant="glass">
        <CardContent className="p-5">
          <SectionHeader title="Confidence distribution" description="Completed tasks by confidence band (24h)" />
          <div className="grid grid-cols-4 gap-3 mt-3">
            <div className="rounded-lg border border-border/60 p-3 text-center">
              <p className="text-2xl font-semibold text-emerald-600">{confidence.high ?? 0}</p>
              <p className="text-xs text-muted-foreground">High (≥80%)</p>
            </div>
            <div className="rounded-lg border border-border/60 p-3 text-center">
              <p className="text-2xl font-semibold text-amber-600">{confidence.medium ?? 0}</p>
              <p className="text-xs text-muted-foreground">Medium</p>
            </div>
            <div className="rounded-lg border border-border/60 p-3 text-center">
              <p className="text-2xl font-semibold text-red-600">{confidence.low ?? 0}</p>
              <p className="text-xs text-muted-foreground">Low</p>
            </div>
            <div className="rounded-lg border border-border/60 p-3 text-center">
              <p className="text-2xl font-semibold">{confidence.unknown ?? 0}</p>
              <p className="text-xs text-muted-foreground">Unknown</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card variant="glass">
        <CardContent className="p-5">
          <SectionHeader title="AI Employee Registry" description={`${agents.length} registered agents`} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {agents.map((agent) => (
              <div key={agent.id} className="rounded-lg border border-border/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">🤖</span>
                  <Badge variant="outline" className="text-[10px]">{agent.role}</Badge>
                </div>
                <p className="font-medium text-sm">{agent.name}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{agent.description}</p>
                <p className="text-[10px] text-muted-foreground mt-2">
                  {agent.autoRun ? 'Auto-run' : 'Manual'}
                  {agent.requiresApproval ? ' · Approval required' : ''}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Tools: {agent.permissions?.allowedTools?.slice(0, 3).join(', ') || '—'}
                  {(agent.permissions?.allowedTools?.length || 0) > 3 ? '…' : ''}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card variant="glass">
        <CardContent className="p-5">
          <SectionHeader title="Task queue" description="Recent agent tasks from platform events" />
          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6">No agent tasks yet. Create a lead to trigger Lead Qualification AI.</p>
          ) : (
            <ul className="divide-y divide-border/50 mt-3">
              {tasks.map((task) => (
                <li key={task.id} className="py-3 flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">{task.agentName || task.agentId}</p>
                      <Badge variant={STATUS_VARIANT[task.status] || 'outline'} className="text-[10px]">
                        {task.status}
                      </Badge>
                      {task.confidence != null && (
                        <span className="text-[10px] text-muted-foreground">
                          {Math.round(task.confidence * 100)}% confidence
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {task.explanation || task.type} · {task.relativeTime || task.createdAt}
                    </p>
                  </div>
                  {task.status === 'awaiting_approval' && (
                    <Button size="sm" variant="outline" onClick={() => approveMutation.mutate(task.id)}>
                      Approve & run
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
