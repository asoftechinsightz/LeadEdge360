'use client';

import { useQuery } from '@tanstack/react-query';
import { leadEdgeApi } from '@/src/services/api';
import { PageHeader } from '@/components/design-system/core/PageHeader';
import { AIInsightsPanel } from './AIInsightsPanel';
import { LoadingState } from '@/components/design-system/core/LoadingState';

export function AIInsightsPage() {
  const query = useQuery({
    queryKey: ['leadedge360', 'ai-insights'],
    queryFn: () => leadEdgeApi.aiInsights(),
  });

  return (
    <div className="container py-10 space-y-6">
      <PageHeader
        title="AI Insights"
        description="Actionable intelligence across your pipeline, territories, and automations."
      />
      {query.isLoading ? (
        <LoadingState label="Analyzing pipeline…" rows={6} />
      ) : (
        <AIInsightsPanel />
      )}
    </div>
  );
}
