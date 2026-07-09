'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { leadEdgeApi } from '@/src/services/api';
import { Card, CardContent } from '@/components/design-system/core/Card';
import { Badge } from '@/components/design-system/core/Badge';
import { Button } from '@/components/design-system/core/Button';
import { LoadingState } from '@/components/design-system/core/LoadingState';
import { Bot, ArrowRight, AlertTriangle, TrendingUp, Zap } from 'lucide-react';

const IMPACT_STYLES = {
  high: 'border-[hsl(var(--brand-orange))]/40 bg-[hsl(var(--brand-orange))]/5',
  medium: 'border-primary/30 bg-primary/5',
  low: 'border-border/60 bg-card/40',
};

const TYPE_ICONS = {
  opportunity: TrendingUp,
  risk: AlertTriangle,
  action: Zap,
  forecast: Bot,
};

export function AIInsightsPanel({ compact = false }: { compact?: boolean }) {
  const query = useQuery({
    queryKey: ['leadedge360', 'ai-insights'],
    queryFn: () => leadEdgeApi.aiInsights(),
  });

  if (query.isLoading) {
    return <LoadingState label="Loading AI insights…" rows={compact ? 2 : 4} />;
  }

  const insights = query.data || [];

  return (
    <Card className="bg-card/60 border-border/60 overflow-hidden">
      <CardContent className={compact ? 'p-4' : 'p-5'}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15">
              <Bot className="size-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">AI Insights</h3>
              <p className="text-xs text-muted-foreground">Powered by LeadEdge AI</p>
            </div>
          </div>
          {!compact && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/leadedge360/insights">View all</Link>
            </Button>
          )}
        </div>
        <div className="space-y-3">
          {insights.slice(0, compact ? 2 : 5).map((insight) => {
            const Icon = TYPE_ICONS[insight.type] || Bot;
            return (
              <div
                key={insight.id}
                className={`rounded-lg border p-3 ${IMPACT_STYLES[insight.impact]}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className="size-4 mt-0.5 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{insight.title}</span>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {insight.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{insight.summary}</p>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      {insight.confidence}% confidence
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {compact && (
          <Button asChild variant="outline" size="sm" className="w-full mt-3">
            <Link href="/leadedge360/insights">
              All insights <ArrowRight className="size-3 ml-1" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
