'use client'

import { Card, CardContent } from '@/components/design-system/core/Card'
import { SectionHeader } from '@/components/design-system/core/PageHeader'
import { EmptyState } from '@/components/design-system/core/EmptyState'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { CHART_COLORS, formatCurrency } from './constants'

const tooltipStyle = {
  background: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 10,
}

export function RetailAnalytics({ kpis }) {
  if (!kpis) {
    return <EmptyState title="No retail analytics" description="Add SKUs to see inventory insights." />
  }

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Card className="bg-card/60 border-border/60 lg:col-span-2">
        <CardContent className="p-5">
          <SectionHeader title="Inventory value by category" description="Risk by category" />
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={kpis.byCategory || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(v)} />
                <Bar dataKey="value" fill="hsl(var(--brand-electric))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/60 border-border/60">
        <CardContent className="p-5">
          <SectionHeader title="Shelf-life risk" description="SKU risk split" />
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={kpis.byRisk || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {(kpis.byRisk || []).map((_, i) => (
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
    </div>
  )
}
