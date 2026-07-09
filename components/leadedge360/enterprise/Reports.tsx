'use client';

import { useQuery } from '@tanstack/react-query';
import { leadEdgeApi } from '@/src/services/api';
import { PageHeader } from '@/components/design-system/core/PageHeader';
import { Card, CardContent } from '@/components/design-system/core/Card';
import { Badge } from '@/components/design-system/core/Badge';
import { Button } from '@/components/design-system/core/Button';
import { LoadingState } from '@/components/design-system/core/LoadingState';
import { FileText, Download, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORY_ICONS: Record<string, typeof FileText> = {
  Executive: BarChart3,
  Sales: FileText,
  Campaign: FileText,
  Revenue: BarChart3,
  'Growth Audit': FileText,
  Territory: FileText,
};

export function Reports() {
  const query = useQuery({
    queryKey: ['leadedge360', 'reports'],
    queryFn: () => leadEdgeApi.reports(),
  });

  if (query.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Reports" description="Executive and operational reporting" />
        <LoadingState label="Loading reports…" rows={6} />
      </div>
    );
  }

  const reports = query.data || [];
  const categories = [...new Set(reports.map((r) => r.category))];

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Reports"
        description="Executive, sales, campaign, revenue, growth audit, and territory reports."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <a href="/leadedge360/reports/attribution">Attribution &amp; ROI</a>
            </Button>
            <Button variant="outline" onClick={() => toast.success('Report scheduler coming soon')}>
              Schedule report
            </Button>
          </div>
        }
      />

      {categories.map((category) => {
        const items = reports.filter((r) => r.category === category);
        const Icon = CATEGORY_ICONS[category] || FileText;
        return (
          <div key={category}>
            <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Icon className="size-4 text-primary" /> {category} Reports
            </h2>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {items.map((report) => (
                <Card key={report.id} className="bg-card/60 border-border/60 hover:border-primary/30 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="font-medium">{report.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last generated {new Date(report.lastGenerated).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline">{report.format}</Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => toast.success(`Downloading ${report.name} (demo)`)}
                    >
                      <Download className="size-4 mr-2" /> Download
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
