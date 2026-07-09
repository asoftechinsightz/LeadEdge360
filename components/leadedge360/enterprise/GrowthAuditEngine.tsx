'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { leadEdgeApi } from '@/src/services/api';
import { PageHeader } from '@/components/design-system/core/PageHeader';
import { Card, CardContent } from '@/components/design-system/core/Card';
import { Badge } from '@/components/design-system/core/Badge';
import { Button } from '@/components/design-system/core/Button';
import { Input } from '@/components/design-system/core/Input';
import { LoadingState } from '@/components/design-system/core/LoadingState';
import { ExecutivePanel, CHART_TOOLTIP_STYLE, CHART_AXIS } from './enterprise-ui';
import {
  Rocket, UserPlus, BriefcaseBusiness, Calendar, FileText, TrendingUp,
  Search, Globe, Users, MapPin, BarChart3, Share2, Download,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis,
} from 'recharts';

const GRADE_COLORS: Record<string, string> = {
  A: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  B: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  C: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  D: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const SCORE_COLORS = ['#38BDF8', '#6366F1', '#F59E0B', '#22C55E', '#A78BFA', '#FF8A3D'];

const SCORE_ICONS = [Search, Users, Globe, Globe, BarChart3, TrendingUp];

export function GrowthAuditEngine() {
  const [form, setForm] = useState({
    website: 'https://example.com',
    industry: 'SaaS',
    revenue: '5000000',
    employees: '25',
    geography: 'India',
  });
  const [reportReady, setReportReady] = useState(false);

  const auditsQuery = useQuery({
    queryKey: ['leadedge360', 'growth-audits'],
    queryFn: () => leadEdgeApi.growthAudits(),
  });

  const scoresQuery = useQuery({
    queryKey: ['leadedge360', 'growth-scores'],
    queryFn: () => leadEdgeApi.growthScores(),
    enabled: reportReady,
  });

  const runAudit = () => {
    setReportReady(true);
    scoresQuery.refetch();
    toast.success('Growth audit report generated');
  };

  const scores = scoresQuery.data || [];
  const overallScore = useMemo(() => {
    if (!scores.length) return 0;
    return Math.round(scores.reduce((s, x) => s + x.score, 0) / scores.length);
  }, [scores]);

  const grade = overallScore >= 80 ? 'A' : overallScore >= 65 ? 'B' : overallScore >= 50 ? 'C' : 'D';

  if (auditsQuery.isLoading) {
    return (
      <div className="space-y-4">
        <PageHeader title="Growth Audit Engine" description="AI website & growth diagnostics." />
        <LoadingState label="Loading audits…" rows={5} />
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-4 pb-6">
      <PageHeader
        title="Growth Audit Engine"
        description="Growth Analysis · Lead Generation · Website Audit · AI Recommendations · Revenue Roadmap"
      />

      <Card className="bg-card/70 border-border/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-3">Run Growth Audit</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
            {[
              { key: 'website', label: 'Website', placeholder: 'https://yoursite.com' },
              { key: 'industry', label: 'Industry', placeholder: 'e.g. Real Estate' },
              { key: 'revenue', label: 'Annual Revenue (₹)', placeholder: '5000000' },
              { key: 'employees', label: 'Employees', placeholder: '25' },
              { key: 'geography', label: 'Geography', placeholder: 'India' },
            ].map((field) => (
              <div key={field.key}>
                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1 block">{field.label}</label>
                <Input
                  className="h-9 text-sm"
                  value={form[field.key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                />
              </div>
            ))}
          </div>
          <Button onClick={runAudit} size="sm" className="rounded-full">
            <Rocket className="size-4 mr-2" /> Generate Growth Audit Report
          </Button>
        </CardContent>
      </Card>

      {reportReady && scores.length > 0 && (
        <>
          {/* Report header with gauge */}
          <div className="rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 via-card/60 to-emerald-500/5 p-5">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="relative h-40 w-40 shrink-0 mx-auto lg:mx-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" data={[{ score: overallScore, fill: 'hsl(var(--brand-orange))' }]} startAngle={90} endAngle={-270}>
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar background={{ fill: 'hsl(var(--muted))', opacity: 0.4 }} dataKey="score" cornerRadius={12} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-4xl font-bold font-display text-primary tabular-nums">{overallScore}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Overall Growth Score</p>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <Badge variant="outline" className="text-[10px] mb-2 border-primary/30">Growth Audit Report</Badge>
                <h2 className="font-display text-xl font-bold">{form.website.replace(/^https?:\/\//, '')}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {form.industry} · {form.geography} · ₹{Number(form.revenue).toLocaleString()} ARR · {form.employees} employees
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <Badge className={`text-base px-3 py-1 ${GRADE_COLORS[grade]}`} variant="outline">Grade {grade}</Badge>
                  <span className="text-sm text-muted-foreground">Overall Growth Score · {overallScore}/100</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button variant="outline" size="sm" className="h-8 text-xs rounded-full" onClick={() => toast.success('PDF downloading (demo)')}>
                    <Download className="size-3.5 mr-1.5" /> Download PDF
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 text-xs rounded-full" onClick={() => toast.success('Report link copied (demo)')}>
                    <Share2 className="size-3.5 mr-1.5" /> Share Report
                  </Button>
                  <Button size="sm" className="h-8 text-xs rounded-full" onClick={() => toast.success('Opportunity created from audit')}>
                    <BriefcaseBusiness className="size-3.5 mr-1.5" /> Create Opportunity
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Section scores */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {scores.map((s, i) => {
              const Icon = SCORE_ICONS[i] || Search;
              const pct = Math.round((s.score / s.max) * 100);
              const color = SCORE_COLORS[i % SCORE_COLORS.length];
              return (
                <Card key={s.label} className="bg-card/70 border-border/50 overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10" style={{ color }}>
                          <Icon className="size-4" />
                        </div>
                        <p className="text-sm font-semibold truncate">{s.label}</p>
                      </div>
                      <p className="text-2xl font-bold font-display tabular-nums shrink-0" style={{ color }}>{s.score}</p>
                    </div>
                    <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1.5">{pct}% of benchmark</p>
                    {s.recommendation && (
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed border-t border-border/40 pt-2">
                        <span className="text-primary font-medium">Recommendation: </span>
                        {s.recommendation}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <ExecutivePanel title="Recommended Actions" subtitle="Convert audit insights to pipeline">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs rounded-full" onClick={() => toast.success('Lead created from audit')}>
                <UserPlus className="size-3.5 mr-1.5" /> Create Lead
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs rounded-full" onClick={() => toast.success('Opportunity created')}>
                <BriefcaseBusiness className="size-3.5 mr-1.5" /> Create Opportunity
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs rounded-full" onClick={() => toast.success('Assigned to sales owner')}>
                <UserPlus className="size-3.5 mr-1.5" /> Assign Owner
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs rounded-full" onClick={() => toast.success('Follow-up scheduled')}>
                <Calendar className="size-3.5 mr-1.5" /> Schedule Follow-up
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs rounded-full" onClick={() => toast.success('PDF report downloading (demo)')}>
                <FileText className="size-3.5 mr-1.5" /> Download Report
              </Button>
            </div>
            <div className="mt-3 pt-3 border-t border-border/40 flex items-center gap-2 text-xs text-emerald-400">
              <TrendingUp className="size-3.5 shrink-0" />
              <span>Revenue Potential is your highest lever — prioritize outreach campaigns in {form.geography}.</span>
            </div>
          </ExecutivePanel>
        </>
      )}

      <div>
        <h3 className="font-semibold text-sm mb-2">Previous Audits</h3>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          {(auditsQuery.data || []).map((audit) => (
            <Card key={audit.id} className="bg-card/70 border-border/50 hover:border-primary/25 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm">{audit.company}</h3>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="size-3" /> {audit.website}
                    </p>
                  </div>
                  <Badge className={GRADE_COLORS[audit.grade] || ''} variant="outline">
                    {audit.grade}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs mb-2">
                  <span>Score <strong className="text-primary tabular-nums">{audit.score}</strong></span>
                  <span>Issues <strong className="tabular-nums">{audit.issues}</strong></span>
                  <Badge variant="outline" className="text-[10px] capitalize">{audit.status}</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(audit.scannedAt).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
