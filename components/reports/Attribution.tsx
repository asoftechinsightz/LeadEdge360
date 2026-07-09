'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/src/lib/api'
import { PageHeader } from '@/components/design-system/core/PageHeader'
import { Card, CardContent } from '@/components/design-system/core/Card'
import { Badge } from '@/components/design-system/core/Badge'
import { Button } from '@/components/design-system/core/Button'
import { LoadingState } from '@/components/design-system/core/LoadingState'
import { KPICard } from '@/components/design-system/core/KPICard'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts'
import { Target, TrendingUp, Users, IndianRupee } from 'lucide-react'

type AttributionModel = 'first_touch' | 'last_touch' | 'linear'

const MODEL_LABELS: Record<AttributionModel, string> = {
  first_touch: 'First Touch',
  last_touch: 'Last Touch',
  linear: 'Linear',
}

const tooltipStyle = {
  background: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 10,
}

export function Attribution() {
  const [model, setModel] = useState<AttributionModel>('last_touch')

  const summaryQuery = useQuery({
    queryKey: ['analytics', 'attribution'],
    queryFn: () => apiGet('/analytics/attribution'),
  })

  const roiQuery = useQuery({
    queryKey: ['analytics', 'roi', model],
    queryFn: () => apiGet(`/analytics/roi?model=${model}`),
  })

  if (summaryQuery.isLoading || roiQuery.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Attribution" description="Ads → Lead → Revenue" />
        <LoadingState label="Loading attribution data…" rows={6} />
      </div>
    )
  }

  const summary = summaryQuery.data
  const roi = roiQuery.data
  const modelData = summary?.models?.[model] || []
  const chartData = (roi?.channels || []).slice(0, 8).map((c: {
    campaignName: string
    platformLabel: string
    spend: number
    revenue: number
    leads: number
    roas: number | null
  }) => ({
    name: c.campaignName.length > 18 ? `${c.campaignName.slice(0, 16)}…` : c.campaignName,
    spend: c.spend,
    revenue: c.revenue,
    leads: c.leads,
    roas: c.roas,
    platform: c.platformLabel,
  }))

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title="Attribution"
        description="Connect ad spend to leads and revenue — first-touch, last-touch, and linear models."
        actions={
          <div className="flex gap-2">
            {(Object.keys(MODEL_LABELS) as AttributionModel[]).map((m) => (
              <Button
                key={m}
                size="sm"
                variant={model === m ? 'default' : 'outline'}
                onClick={() => setModel(m)}
              >
                {MODEL_LABELS[m]}
              </Button>
            ))}
          </div>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Attributed leads"
          value={String(summary?.attributedLeads || 0)}
          icon={<Users className="size-5" />}
        />
        <KPICard
          label="Ad spend (Meta)"
          value={`₹${Math.round(summary?.spendByPlatform?.meta || 0).toLocaleString()}`}
          icon={<Target className="size-5" />}
        />
        <KPICard
          label="Ad spend (Google)"
          value={`₹${Math.round(summary?.spendByPlatform?.google || 0).toLocaleString()}`}
          icon={<Target className="size-5" />}
        />
        <KPICard
          label="Portfolio ROAS"
          value={roi?.totals?.roas != null ? `${roi.totals.roas}x` : '—'}
          icon={<TrendingUp className="size-5" />}
        />
      </div>

      <Card className="bg-card/60">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-1">{MODEL_LABELS[model]} revenue credit</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Revenue allocated using the {MODEL_LABELS[model].toLowerCase()} model across ad channels.
          </p>
          {modelData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No attributed revenue yet. Connect Meta or Google Ads and sync campaigns.</p>
          ) : (
            <div className="space-y-2">
              {modelData.slice(0, 10).map((row: { channel: string; revenue: number; leadCount: number }) => (
                <div key={row.channel} className="flex items-center justify-between text-sm border-b border-border/40 pb-2">
                  <span className="font-medium">{row.channel.replace(':', ' · ')}</span>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{row.leadCount} leads</Badge>
                    <span className="text-muted-foreground">₹{row.revenue.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/60">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-1">Spend vs revenue by campaign</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {MODEL_LABELS[model]} attribution with cost-per-lead and ROAS.
          </p>
          {chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sync ad campaigns from Integration Center to populate this chart.</p>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Bar dataKey="spend" name="Spend (₹)" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="revenue" name="Revenue (₹)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/60">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <IndianRupee className="size-4" /> Channel ROI table
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b">
                  <th className="pb-2 pr-4">Campaign</th>
                  <th className="pb-2 pr-4">Platform</th>
                  <th className="pb-2 pr-4">Leads</th>
                  <th className="pb-2 pr-4">Spend</th>
                  <th className="pb-2 pr-4">Revenue</th>
                  <th className="pb-2 pr-4">CPL</th>
                  <th className="pb-2">ROAS</th>
                </tr>
              </thead>
              <tbody>
                {(roi?.channels || []).map((c: {
                  campaignId: string | null
                  campaignName: string
                  platformLabel: string
                  leads: number
                  spend: number
                  revenue: number
                  cpl: number | null
                  roas: number | null
                }) => (
                  <tr key={`${c.platformLabel}-${c.campaignName}`} className="border-b border-border/30">
                    <td className="py-2 pr-4 font-medium">{c.campaignName}</td>
                    <td className="py-2 pr-4">{c.platformLabel}</td>
                    <td className="py-2 pr-4">{c.leads}</td>
                    <td className="py-2 pr-4">₹{c.spend.toLocaleString()}</td>
                    <td className="py-2 pr-4">₹{c.revenue.toLocaleString()}</td>
                    <td className="py-2 pr-4">{c.cpl != null ? `₹${c.cpl.toLocaleString()}` : '—'}</td>
                    <td className="py-2">{c.roas != null ? `${c.roas}x` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
