'use client';

import Link from 'next/link';
import { LEADS_LIST_PATH } from '@/lib/leads/paths';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { leadEdgeApi } from '@/src/services/api';
import { PageHeader } from '@/components/design-system/core/PageHeader';
import { KPICard } from '@/components/design-system/core/KPICard';
import { Card, CardContent } from '@/components/design-system/core/Card';
import { Button } from '@/components/design-system/core/Button';
import { Badge } from '@/components/design-system/core/Badge';
import { LoadingState } from '@/components/design-system/core/LoadingState';
import { RecentActivityFeed } from '@/components/suite/RecentActivityFeed';
import {
  Bot, Target, Flame, TrendingUp, IndianRupee, Zap, ArrowRight,
  Brain, Lightbulb, LineChart, Megaphone, MessageSquare, BriefcaseBusiness,
  AlertTriangle, BarChart3,
} from 'lucide-react';

const MODULE_ICONS: Record<string, typeof Bot> = {
  scoring: Brain,
  recommendations: Lightbulb,
  revenue: LineChart,
  campaign: Megaphone,
  followup: MessageSquare,
  opportunity: BriefcaseBusiness,
  churn: AlertTriangle,
  forecast: BarChart3,
};

export function AICommandCenter() {
  const commandQuery = useQuery({
    queryKey: ['leadedge360', 'command-center'],
    queryFn: () => leadEdgeApi.commandCenter(),
  });

  const workspaceQuery = useQuery({
    queryKey: ['leadedge360', 'ai-workspace'],
    queryFn: () => leadEdgeApi.aiWorkspace(),
  });

  if (commandQuery.isLoading || workspaceQuery.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="AI Command Center" description="LeadEdge360 · AI-first growth workspace" />
        <LoadingState label="Loading AI workspace…" rows={10} />
      </div>
    );
  }

  if (commandQuery.isError || workspaceQuery.isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="AI Command Center" description="LeadEdge360 · AI-first growth workspace" />
        <Card className="bg-card/60 border-border/60">
          <CardContent className="p-6 text-sm text-muted-foreground">
            Unable to load AI workspace data. Refresh the page or try again shortly.
          </CardContent>
        </Card>
      </div>
    );
  }

  const kpis = commandQuery.data?.kpis ?? {
    totalLeads: 0,
    hotLeads: 0,
    pipelineValue: 0,
    conversionRate: 0,
    revenueWon: 0,
    automationsActive: 0,
  };
  const modules = workspaceQuery.data?.modules ?? [];
  const scoringCards = workspaceQuery.data?.scoringCards ?? [];

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title="AI Command Center"
        description="Eight AI modules orchestrating leads, revenue, campaigns, and forecasting."
        actions={
          <Button asChild className="rounded-full">
            <Link href={LEADS_LIST_PATH}>
              <Target className="size-4 mr-2" /> Manage leads
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard label="Total leads" value={kpis.totalLeads} icon={<Target className="size-5" />} />
        <KPICard label="Hot leads" value={kpis.hotLeads} icon={<Flame className="size-5" />} />
        <KPICard
          label="Pipeline value"
          value={`₹${(kpis.pipelineValue / 100000).toFixed(1)}L`}
          icon={<TrendingUp className="size-5" />}
        />
        <KPICard label="Win rate" value={`${kpis.conversionRate}%`} trend="up" icon={<Bot className="size-5" />} />
        <KPICard
          label="Revenue won"
          value={`₹${(kpis.revenueWon / 100000).toFixed(1)}L`}
          icon={<IndianRupee className="size-5" />}
        />
        <KPICard label="Automations" value={kpis.automationsActive} icon={<Zap className="size-5" />} />
      </div>

      <div>
        <h2 className="font-semibold mb-4">AI Modules</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((mod) => {
            const Icon = MODULE_ICONS[mod.id] || Bot;
            return (
              <Card key={mod.id} className="bg-card/60 border-border/60 backdrop-blur-sm hover:border-primary/40 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Icon className="size-5 text-primary" />
                    <Badge variant="outline" className="text-[10px]">{mod.count}</Badge>
                  </div>
                  <p className="font-medium text-sm">{mod.name}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{mod.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Card className="bg-card/60 border-border/60 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="p-5 border-b border-border/60 flex items-center justify-between">
            <h3 className="font-semibold">AI Scoring & Recommendations</h3>
            <Button asChild variant="ghost" size="sm">
              <Link href="/leadedge360/insights">View insights <ArrowRight className="size-4 ml-1" /></Link>
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 text-left text-xs text-muted-foreground">
                  <th className="p-4 font-medium">Lead</th>
                  <th className="p-4 font-medium">Score</th>
                  <th className="p-4 font-medium">Reason</th>
                  <th className="p-4 font-medium">Recommendation</th>
                  <th className="p-4 font-medium">Predicted Rev.</th>
                  <th className="p-4 font-medium">Confidence</th>
                  <th className="p-4 font-medium">Module</th>
                </tr>
              </thead>
              <tbody>
                {scoringCards.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">
                      No scored leads yet. Add leads or run AI scoring from the Leads page.
                    </td>
                  </tr>
                ) : (
                  scoringCards.map((card) => (
                  <tr key={card.id} className="border-b border-border/30 hover:bg-muted/20">
                    <td className="p-4">
                      <p className="font-medium">{card.leadName}</p>
                      <p className="text-xs text-muted-foreground">{card.company}</p>
                    </td>
                    <td className="p-4">
                      <Badge className={card.score >= 85 ? 'bg-emerald-500/15 text-emerald-400' : card.score >= 70 ? 'bg-amber-500/15 text-amber-400' : ''}>
                        {card.score}
                      </Badge>
                    </td>
                    <td className="p-4 max-w-[200px] text-xs text-muted-foreground">{card.reason}</td>
                    <td className="p-4 max-w-[180px] text-xs">{card.recommendation}</td>
                    <td className="p-4 font-medium">₹{card.predictedRevenue.toLocaleString()}</td>
                    <td className="p-4">{card.confidence}%</td>
                    <td className="p-4 text-xs text-muted-foreground">{card.module}</td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/60 border-border/60">
        <CardContent className="p-5">
          <h3 className="font-semibold mb-4">Live activity</h3>
          <RecentActivityFeed showControls limit={10} />
        </CardContent>
      </Card>
    </div>
  );
}
