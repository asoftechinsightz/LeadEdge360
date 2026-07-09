'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import { apiGet, apiPost } from '@/src/lib/api'
import { PageHeader } from '@/components/design-system/core/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/design-system/core/Button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

const CONTENT_MIX = [
  { label: 'Educational', pct: 25, color: 'bg-blue-500' },
  { label: 'LeadEdge360 pitch', pct: 25, color: 'bg-emerald-500' },
  { label: 'RetailEdge360 pitch', pct: 15, color: 'bg-orange-500' },
  { label: 'Product demos', pct: 15, color: 'bg-cyan-500' },
  { label: 'Problem → Solution', pct: 10, color: 'bg-violet-500' },
  { label: 'Brand + industry', pct: 10, color: 'bg-amber-500' },
]

const DAILY_SCHEDULE = [
  '06:00 Research', '07:00 Content', '08:00 Graphics', '09:00 Reel',
  '10:00 LinkedIn', '11:00 Facebook', '12:00 Instagram', '13:00 X',
  '18:00 Reel publish', '20:00 Analytics', '21:00 Daily report',
]

export default function MarketingEnginePage() {
  const qc = useQueryClient()

  const analytics = useQuery({
    queryKey: ['marketing-engine', 'analytics'],
    queryFn: () => apiGet('/marketing-engine/analytics'),
  })

  const agents = useQuery({
    queryKey: ['marketing-engine', 'agents'],
    queryFn: () => apiGet('/marketing-engine/agents'),
  })

  const calendar = useQuery({
    queryKey: ['marketing-engine', 'calendar'],
    queryFn: () => apiGet('/marketing-engine/calendar'),
  })

  const report = useQuery({
    queryKey: ['marketing-engine', 'report'],
    queryFn: () => apiGet('/marketing-engine/report'),
  })

  const research = useQuery({
    queryKey: ['marketing-engine', 'research'],
    queryFn: () => apiGet('/marketing-engine/research/run'),
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['marketing-engine'] })

  const runDaily = useMutation({
    mutationFn: () => apiPost('/marketing-engine/daily/run', { full: true, quick: true }),
    onSuccess: (data) => {
      const steps = data?.result?.steps?.length ?? 0
      const failed = data?.result?.errors?.length ?? 0
      if (failed) {
        toast.warning(`Daily pipeline: ${steps} steps, ${failed} failed`)
      } else {
        toast.success(`Daily pipeline: ${steps} steps completed`)
      }
      invalidate()
    },
    onError: (e) => toast.error(e.message || 'Daily pipeline failed'),
  })

  const runPublisher = useMutation({
    mutationFn: () => apiPost('/marketing-engine/publisher/run', { limit: 10 }),
    onSuccess: (data) => {
      toast.success(`Published: ${data?.result?.published ?? 0}`)
      invalidate()
    },
    onError: (e) => toast.error(e.message || 'Publisher failed'),
  })

  const dash = analytics.data?.dashboard
  const agentList = agents.data?.agents || []
  const coreTeam = agentList.filter((a) => a.phase === 'core')
  const upcoming = (calendar.data?.items || []).slice(0, 10)
  const dailyReport = report.data?.report

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Image
            src="/images/brand/asoftechinsightz-logo.png"
            alt="AsoftechInsightz"
            width={180}
            height={48}
            className="h-10 w-auto object-contain"
            priority
          />
          <div>
            <PageHeader
              title="AI Digital Marketing Employee"
              description="Autonomous marketing department for AsoftechInsightz — research, create, publish, engage, report."
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => runDaily.mutate()} disabled={runDaily.isPending}>
          Run Today&apos;s Pipeline
        </Button>
        <Button variant="outline" onClick={() => runPublisher.mutate()} disabled={runPublisher.isPending}>
          Publish Due Posts
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Leads (30d)</p>
          <p className="text-2xl font-semibold">{dash?.leads?.total ?? '—'}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Hot Leads</p>
          <p className="text-2xl font-semibold text-emerald-500">{dash?.leads?.hot ?? '—'}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Content Published</p>
          <p className="text-2xl font-semibold">{dash?.content?.published ?? '—'}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Revenue (30d)</p>
          <p className="text-2xl font-semibold">₹{dash?.sales?.revenue ?? 0}</p>
        </CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-4 space-y-3">
            <p className="font-semibold">Content Strategy Mix</p>
            <div className="space-y-2">
              {CONTENT_MIX.map((c) => (
                <div key={c.label} className="flex items-center gap-3 text-sm">
                  <div className={`h-2 w-2 rounded-full ${c.color}`} />
                  <span className="flex-1">{c.label}</span>
                  <span className="text-muted-foreground">{c.pct}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <p className="font-semibold">Daily Automation (IST)</p>
            <div className="flex flex-wrap gap-2">
              {DAILY_SCHEDULE.map((s) => (
                <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="font-semibold">AI Marketing Team ({coreTeam.length} core agents)</p>
          <div className="grid gap-2 md:grid-cols-2">
            {coreTeam.map((a) => (
              <div key={a.id} className="flex items-start gap-2 rounded-lg border border-white/10 p-3 text-sm">
                <Badge variant="outline" className="shrink-0 text-emerald-500 border-emerald-500/30">active</Badge>
                <div>
                  <p className="font-medium">{a.name}</p>
                  <p className="text-muted-foreground text-xs">{a.schedule}</p>
                  <p className="text-muted-foreground text-xs mt-1">{a.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-4 space-y-2">
            <p className="font-semibold">Content Calendar</p>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">Run today&apos;s pipeline to populate calendar.</p>
            ) : (
              <ul className="text-sm space-y-1 max-h-64 overflow-auto">
                {upcoming.map((e) => (
                  <li key={e.id} className="flex justify-between gap-2 border-b border-white/5 py-1">
                    <span>{new Date(e.scheduledAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
                    <span className="text-muted-foreground">{e.platform} · {e.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-2">
            <p className="font-semibold">CEO Daily Report</p>
            {dailyReport ? (
              <div className="text-sm space-y-2 max-h-64 overflow-auto">
                <p className="font-medium">{dailyReport.title}</p>
                <p className="text-muted-foreground whitespace-pre-wrap">{dailyReport.body}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Run today&apos;s pipeline to generate report.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {research.data?.research?.summary && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <p className="font-semibold">Today&apos;s Research</p>
            <p className="text-sm text-muted-foreground">{research.data.research.summary}</p>
            <ul className="text-sm space-y-1">
              {(research.data.research.topics || []).slice(0, 4).map((t, i) => (
                <li key={i}>• {t.headline || t.topic}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
