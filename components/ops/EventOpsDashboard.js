'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost } from '@/src/lib/api'
import { PageHeader, SectionHeader } from '@/components/design-system/core/PageHeader'
import { Card, CardContent } from '@/components/design-system/core/Card'
import { Button } from '@/components/design-system/core/Button'
import { Badge } from '@/components/design-system/core/Badge'
import { LoadingState } from '@/components/design-system/core/LoadingState'
import { KPICard } from '@/components/design-system/core/KPICard'
import {
  Activity, AlertTriangle, Clock, Database, Play, RefreshCw, RotateCcw, Zap,
} from 'lucide-react'

export function EventOpsDashboard() {
  const qc = useQueryClient()
  const [replayMsg, setReplayMsg] = useState('')

  const metricsQuery = useQuery({
    queryKey: ['platform', 'metrics'],
    queryFn: () => apiGet('/platform/events/metrics'),
  })

  const dlqQuery = useQuery({
    queryKey: ['platform', 'dlq'],
    queryFn: () => apiGet('/platform/events/dlq', { limit: 20 }),
  })

  const registryQuery = useQuery({
    queryKey: ['platform', 'registry'],
    queryFn: () => apiGet('/platform/events/registry'),
  })

  const healthQuery = useQuery({
    queryKey: ['platform', 'health'],
    queryFn: () => apiGet('/platform/health'),
  })

  const replayMutation = useMutation({
    mutationFn: (body) => apiPost('/platform/events/replay', body),
    onSuccess: (data) => {
      setReplayMsg(`Replay job ${data.jobId}: ${data.processed ?? 0} processed, ${data.failed ?? 0} failed`)
      qc.invalidateQueries({ queryKey: ['platform'] })
    },
    onError: (e) => setReplayMsg(e.message || 'Replay failed'),
  })

  const retryMutation = useMutation({
    mutationFn: (id) => apiPost(`/platform/events/dlq/${id}/retry`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['platform', 'dlq'] }),
  })

  const ignoreMutation = useMutation({
    mutationFn: (id) => apiPost(`/platform/events/dlq/${id}/ignore`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['platform', 'dlq'] }),
  })

  if (metricsQuery.isLoading) {
    return <LoadingState label="Loading event operations…" rows={6} />
  }

  const m = metricsQuery.data?.metrics || {}
  const dlq = dlqQuery.data?.items || []
  const schemas = registryQuery.data?.schemas || []
  const health = healthQuery.data?.health || {}

  return (
    <div className="space-y-6">
      <PageHeader
        title="Event Operations"
        description="Platform event bus health, replay, dead letter queue, and schema registry."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              metricsQuery.refetch()
              dlqQuery.refetch()
              healthQuery.refetch()
            }}
          >
            <RefreshCw className="size-4 mr-2" /> Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
        <KPICard label="Events / min" value={m.eventsPerMinute ?? 0} icon={<Zap className="size-5" />} />
        <KPICard label="Queue depth" value={m.eventQueue ?? 0} icon={<Activity className="size-5" />} />
        <KPICard label="Failed (1h)" value={m.failedEvents ?? 0} trend="down" icon={<AlertTriangle className="size-5" />} />
        <KPICard label="Dead letter" value={m.deadLetterQueue ?? 0} icon={<Database className="size-5" />} />
        <KPICard label="Avg latency" value={`${m.averageLatencyMs ?? 0}ms`} icon={<Clock className="size-5" />} />
        <KPICard label="Total events" value={m.totalEvents ?? 0} icon={<Activity className="size-5" />} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card variant="glass">
          <CardContent className="p-5 space-y-4">
            <SectionHeader title="Replay Platform Events" description="Rebuild projections idempotently from the event store." />
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => replayMutation.mutate({ dryRun: true })}
                disabled={replayMutation.isPending}
              >
                <Play className="size-4 mr-1" /> Dry run
              </Button>
              <Button
                size="sm"
                variant="default"
                onClick={() => replayMutation.mutate({ clearTargets: false })}
                disabled={replayMutation.isPending}
              >
                <RotateCcw className="size-4 mr-1" /> Replay org
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => replayMutation.mutate({ clearTargets: true })}
                disabled={replayMutation.isPending}
              >
                Full rebuild
              </Button>
            </div>
            {replayMsg && <p className="text-xs text-muted-foreground">{replayMsg}</p>}
            {m.replayStatus && (
              <p className="text-xs text-muted-foreground">
                Last replay: {m.replayStatus.status} — {m.replayStatus.processed} processed
              </p>
            )}
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-5 space-y-3">
            <SectionHeader title="System health" />
            <div className="space-y-2 text-sm">
              <HealthRow label="MongoDB" ok={health.mongodb?.ok} detail={`${health.mongodb?.latencyMs ?? '—'}ms`} />
              <HealthRow label="Event bus" ok={health.eventBus?.ok} detail={`${health.eventBus?.eventsPerMinute ?? 0} evt/min`} />
              <HealthRow label="API" ok={health.api?.ok} />
              <HealthRow label="n8n" ok={health.n8n?.ok} detail={health.n8n?.status} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card variant="glass">
        <CardContent className="p-5">
          <SectionHeader title="Dead letter queue" description="Failed events — retry or ignore." />
          {dlq.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No failed events.</p>
          ) : (
            <ul className="divide-y divide-border/50">
              {dlq.map((item) => (
                <li key={item.id} className="py-3 flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{item.event?.type || 'unknown'} · {item.processor}</p>
                    <p className="text-xs text-destructive mt-0.5">{item.error}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Retries: {item.retryCount} · {item.createdAt}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => retryMutation.mutate(item.id)}>Retry</Button>
                    <Button size="sm" variant="ghost" onClick={() => ignoreMutation.mutate(item.id)}>Ignore</Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card variant="glass">
        <CardContent className="p-5">
          <SectionHeader title="Event schema registry" description={`${schemas.length} registered event types`} />
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border/40">
                  <th className="py-2 pr-4">Event</th>
                  <th className="py-2 pr-4">Version</th>
                  <th className="py-2 pr-4">Producers</th>
                  <th className="py-2">Consumers</th>
                </tr>
              </thead>
              <tbody>
                {schemas.slice(0, 12).map((s) => (
                  <tr key={s.name} className="border-b border-border/20">
                    <td className="py-2 pr-4 font-mono text-xs">{s.versionedName}</td>
                    <td className="py-2 pr-4">v{s.version}</td>
                    <td className="py-2 pr-4 text-xs text-muted-foreground">{s.producers?.join(', ')}</td>
                    <td className="py-2 text-xs text-muted-foreground">{s.consumers?.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {m.slowConsumers?.length > 0 && (
        <Card variant="glass">
          <CardContent className="p-5">
            <SectionHeader title="Slow consumers" />
            <ul className="space-y-2">
              {m.slowConsumers.map((c) => (
                <li key={c.processor} className="flex justify-between text-sm">
                  <span>{c.processor}</span>
                  <span className="text-muted-foreground">{c.avgMs}ms avg · {c.failures} failures</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function HealthRow({ label, ok, detail }) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <div className="flex items-center gap-2">
        {detail && <span className="text-xs text-muted-foreground">{detail}</span>}
        <Badge variant={ok ? 'success' : ok === null ? 'outline' : 'destructive'}>
          {ok === null ? 'N/A' : ok ? 'OK' : 'Down'}
        </Badge>
      </div>
    </div>
  )
}
