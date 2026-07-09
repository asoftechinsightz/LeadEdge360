'use client'

import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/src/lib/api'
import { PageHeader } from '@/components/design-system/core/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend,
} from 'recharts'

const PIE_COLORS = ['#FF8A3D', '#22C55E', '#38BDF8', '#A78BFA', '#F59E0B']

export default function RevenuePage() {
  const revenueQuery = useQuery({
    queryKey: ['revenue', 'dashboard'],
    queryFn: () => apiGet('/revenue/dashboard'),
  })

  const funnelQuery = useQuery({
    queryKey: ['analytics', 'funnel'],
    queryFn: () => apiGet('/analytics/funnel'),
  })

  const summaryQuery = useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: () => apiGet('/analytics/summary'),
  })

  const data = revenueQuery.data
  const funnelRaw = funnelQuery.data?.funnel
  const funnel = Array.isArray(funnelRaw)
    ? funnelRaw.map((f) => ({ name: f._id || 'Unknown', count: f.count }))
    : [
        { name: 'Scanned', count: funnelRaw?.scanned ?? 0 },
        { name: 'Leads', count: funnelRaw?.leads ?? 0 },
        { name: 'Executions', count: funnelRaw?.executions ?? 0 },
      ]

  if (revenueQuery.isLoading) {
    return <div className="text-muted-foreground">Loading analytics…</div>
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics & Revenue"
        description="Revenue performance, funnel conversion, and platform activity."
      />

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Revenue</div>
            <div className="text-2xl font-bold">₹{data?.totalRevenue?.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Paid Revenue</div>
            <div className="text-2xl font-bold">₹{data?.paidRevenue?.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Pending Revenue</div>
            <div className="text-2xl font-bold">₹{data?.pendingRevenue?.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Avg Deal Size</div>
            <div className="text-2xl font-bold">₹{data?.averageDealSize?.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {summaryQuery.data && (
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card><CardContent className="p-4"><div className="text-sm text-muted-foreground">Campaigns</div><div className="text-2xl font-bold">{summaryQuery.data.campaigns}</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-sm text-muted-foreground">Leads</div><div className="text-2xl font-bold">{summaryQuery.data.leads}</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-sm text-muted-foreground">Executions</div><div className="text-2xl font-bold">{summaryQuery.data.executions}</div></CardContent></Card>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-card/60">
          <CardContent className="p-5">
            <h3 className="font-semibold mb-4">Lead funnel by status</h3>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={funnel}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#0B1220', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }} />
                  <Bar dataKey="count" fill="#FF8A3D" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60">
          <CardContent className="p-5">
            <h3 className="font-semibold mb-4">Revenue mix</h3>
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Paid', value: data?.paidRevenue || 0 },
                      { name: 'Pending', value: data?.pendingRevenue || 0 },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                  >
                    {PIE_COLORS.map((color, i) => <Cell key={i} fill={color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0B1220', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
