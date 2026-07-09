'use client'

import { Card, CardContent } from '@/components/design-system/core/Card'
import { Badge } from '@/components/design-system/core/Badge'
import { SectionHeader } from '@/components/design-system/core/PageHeader'
import { EmptyState } from '@/components/design-system/core/EmptyState'
import { MapPin } from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts'
import { CHART_COLORS } from './constants'

const tooltipStyle = {
  background: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 10,
}

export function LeadAnalytics({ kpis }) {
  if (!kpis) {
    return <EmptyState title="No analytics data" description="KPIs will appear once leads are captured." />
  }

  const agents = [...(kpis.byAgent || [])].sort((a, b) => b.leads - a.leads).slice(0, 5)

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Card className="bg-card/60 border-border/60 lg:col-span-2">
        <CardContent className="p-5">
          <SectionHeader title="Leads & wins" description="Last 14 days" />
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={kpis.trend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="leads" stroke={CHART_COLORS[0]} strokeWidth={2.5} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="won" stroke={CHART_COLORS[1]} strokeWidth={2.5} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/60 border-border/60">
        <CardContent className="p-5">
          <SectionHeader title="By channel" description="Lead sources" />
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={kpis.bySource || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {(kpis.bySource || []).map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/60 border-border/60 lg:col-span-2">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <SectionHeader title="Leads by city" description="Territory performance" />
            <MapPin className="h-4 w-4 text-primary" aria-hidden />
          </div>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={kpis.byTerritory || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="leads" fill={CHART_COLORS[0]} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/60 border-border/60">
        <CardContent className="p-5">
          <SectionHeader title="Sales leaderboard" description="Top agents" />
          <div className="space-y-3">
            {agents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No agent data yet.</p>
            ) : (
              agents.map((agent, i) => (
                <div key={agent.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/15 text-primary grid place-items-center text-xs font-semibold">
                      {i + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{agent.name}</div>
                      <div className="text-xs text-muted-foreground">{agent.leads} leads · {agent.won} won</div>
                    </div>
                  </div>
                  <Badge variant="accent">{agent.conversion}%</Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
