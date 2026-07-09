'use client';

import { useQuery } from '@tanstack/react-query';
import { leadEdgeApi } from '@/src/services/api';
import { PageHeader } from '@/components/design-system/core/PageHeader';
import { KPICard } from '@/components/design-system/core/KPICard';
import { Card, CardContent } from '@/components/design-system/core/Card';
import { LoadingState } from '@/components/design-system/core/LoadingState';
import { IndianRupee, TrendingUp, Target, BarChart3 } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend,
} from 'recharts';

const tooltipStyle = {
  background: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 10,
};

export function RevenueIntelligence() {
  const query = useQuery({
    queryKey: ['leadedge360', 'revenue-intelligence'],
    queryFn: () => leadEdgeApi.revenueIntelligence(),
  });

  if (query.isLoading) {
    return (
      <div className="container py-10">
        <PageHeader title="Revenue Intelligence" description="Forecasting, territory revenue, and source attribution." />
        <LoadingState label="Loading revenue data…" rows={6} />
      </div>
    );
  }

  const data = query.data!;

  return (
    <div className="container py-10 space-y-8">
      <PageHeader
        title="Revenue Intelligence"
        description="AI-powered revenue forecasting, deal analytics, and territory performance."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total revenue" value={`₹${(data.totalRevenue / 100000).toFixed(1)}L`} icon={<IndianRupee className="size-5" />} />
        <KPICard label="Forecast" value={`₹${(data.forecastRevenue / 100000).toFixed(1)}L`} trend="up" icon={<TrendingUp className="size-5" />} />
        <KPICard label="Avg deal size" value={`₹${(data.avgDealSize / 1000).toFixed(0)}k`} icon={<BarChart3 className="size-5" />} />
        <KPICard label="Win rate" value={`${data.winRate}%`} icon={<Target className="size-5" />} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-card/60 border-border/60">
          <CardContent className="p-5">
            <h3 className="font-semibold mb-4">Revenue trend & forecast</h3>
            <div className="h-64">
              <ResponsiveContainer>
                <LineChart data={data.series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => `₹${v / 100000}L`} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--brand-orange))" strokeWidth={2} name="Actual" />
                  <Line type="monotone" dataKey="forecast" stroke="hsl(var(--brand-electric))" strokeWidth={2} strokeDasharray="4 4" name="Forecast" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-border/60">
          <CardContent className="p-5">
            <h3 className="font-semibold mb-4">Revenue by territory</h3>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={data.byTerritory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => `₹${v / 100000}L`} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="revenue" fill="hsl(var(--brand-electric))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/60 border-border/60">
        <CardContent className="p-5">
          <h3 className="font-semibold mb-4">Revenue by source</h3>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={data.bySource} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => `₹${v / 100000}L`} />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={80} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="revenue" fill="hsl(var(--brand-orange))" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
