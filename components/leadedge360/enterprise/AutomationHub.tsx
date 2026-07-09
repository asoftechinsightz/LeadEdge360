'use client';

import { useQuery } from '@tanstack/react-query';
import { leadEdgeApi } from '@/src/services/api';
import { PageHeader } from '@/components/design-system/core/PageHeader';
import { Card, CardContent } from '@/components/design-system/core/Card';
import { Badge } from '@/components/design-system/core/Badge';
import { Button } from '@/components/design-system/core/Button';
import { LoadingState } from '@/components/design-system/core/LoadingState';
import { Workflow, Play, Pause, Settings2 } from 'lucide-react';
import { toast } from 'sonner';

export function AutomationHub() {
  const query = useQuery({
    queryKey: ['leadedge360', 'automations'],
    queryFn: () => leadEdgeApi.automations(),
  });

  if (query.isLoading) {
    return (
      <div className="container py-10">
        <PageHeader title="Automation Hub" description="Workflows, triggers, and multi-channel nurture." />
        <LoadingState label="Loading automations…" rows={5} />
      </div>
    );
  }

  return (
    <div className="container py-10 space-y-6">
      <PageHeader
        title="Automation Hub"
        description="Build and monitor AI-driven sales workflows across WhatsApp, email, and CRM."
        actions={
          <Button onClick={() => toast.info('Workflow builder coming soon')}>
            <Workflow className="size-4 mr-2" /> New workflow
          </Button>
        }
      />

      <div className="space-y-4">
        {(query.data || []).map((flow) => (
          <Card key={flow.id} className="bg-card/60 border-border/60">
            <CardContent className="p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15 shrink-0">
                  <Workflow className="size-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold">{flow.name}</h3>
                  <p className="text-sm text-muted-foreground">Trigger: {flow.trigger}</p>
                  <p className="text-xs text-muted-foreground mt-1">Channel: {flow.channel}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="text-right text-sm">
                  <div><strong>{flow.runs}</strong> runs</div>
                  <div className="text-muted-foreground">{flow.conversions} conversions</div>
                </div>
                <Badge
                  variant={flow.status === 'active' ? 'default' : 'outline'}
                  className="capitalize"
                >
                  {flow.status}
                </Badge>
                <div className="flex gap-2">
                  {flow.status === 'active' ? (
                    <Button size="sm" variant="outline" onClick={() => toast.success('Workflow paused')}>
                      <Pause className="size-3" />
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => toast.success('Workflow resumed')}>
                      <Play className="size-3" />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => toast.info('Workflow settings')}>
                    <Settings2 className="size-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
