'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { leadEdgeApi } from '@/src/services/api';
import { Badge } from '@/components/design-system/core/Badge';
import { Button } from '@/components/design-system/core/Button';
import { LoadingState } from '@/components/design-system/core/LoadingState';
import {
  ExecutivePanel,
  ExecutiveOverviewStrip,
  CHART_TOOLTIP_STYLE,
  CHART_AXIS,
} from './enterprise-ui';
import {
  Target, BriefcaseBusiness, Megaphone, Bot, Rocket, Workflow,
  Calendar, ArrowRight, MapPin, Activity, Globe, Brain,
  UserPlus, Map, CheckSquare, Sparkles,
  IndianRupee, Trophy,
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  AreaChart, Area, PieChart, Pie, Cell, LabelList, LineChart as ReLineChart, Line,
} from 'recharts';
import { toast } from 'sonner';

const AI_WORKSPACE_MODULES = [
  { href: '/leadedge360/command-center', label: 'AI Command Center', desc: 'Unified AI orchestration', badge: '12 active insights', icon: Bot, color: 'violet' },
  { href: '/leadedge360/insights', label: 'AI Insights', desc: 'Scoring & predictions', badge: 'Live scoring', icon: Sparkles, color: 'sky' },
  { href: '/leadedge360/automation', label: 'Automation Hub', desc: 'Workflow automation', badge: '18 workflows', icon: Workflow, color: 'cyan' },
  { href: '/leadedge360/geo-finder', label: 'Geo Lead Finder', desc: 'Location intelligence', badge: 'Territory scan', icon: MapPin, color: 'emerald' },
  { href: '/leadedge360/territories', label: 'Territory Management', desc: 'Coverage & agents', badge: '5 territories', icon: Map, color: 'amber' },
  { href: '/leadedge360/growth-engine', label: 'Growth Audit', desc: 'AI growth analysis', badge: 'Free audit', icon: Rocket, color: 'orange' },
];

const ACTIVITY_ICONS = {
  lead: Target,
  deal: Trophy,
  invoice: IndianRupee,
  campaign: Megaphone,
  task: CheckSquare,
};

const PRIORITY_STYLES = {
  high: 'bg-red-500/15 text-red-400 border-red-500/30',
  medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  low: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
};

const IMPACT_PRIORITY: Record<string, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const MODULE_COLORS: Record<string, string> = {
  violet: 'border-violet-500/20 bg-violet-500/8 hover:border-violet-400/35',
  sky: 'border-sky-500/20 bg-sky-500/8 hover:border-sky-400/35',
  cyan: 'border-cyan-500/20 bg-cyan-500/8 hover:border-cyan-400/35',
  emerald: 'border-emerald-500/20 bg-emerald-500/8 hover:border-emerald-400/35',
  amber: 'border-amber-500/20 bg-amber-500/8 hover:border-amber-400/35',
  orange: 'border-orange-500/20 bg-orange-500/8 hover:border-orange-400/35',
};

const fade = { initial: { opacity: 0, y: 4 }, animate: { opacity: 1, y: 0 } };

export function ExecutiveCommandCenter() {
  const query = useQuery({
    queryKey: ['leadedge360', 'executive'],
    queryFn: () => leadEdgeApi.executiveDashboard(),
  });

  if (query.isLoading) {
    return <LoadingState label="Loading Executive Command Center…" rows={10} />;
  }

  const d = query.data!;
  const territories = d.topTerritories || [];

  return (
    <div className="w-full min-w-0 space-y-2.5 pb-4">
      {/* Compressed hero + action toolbar */}
      <motion.div
        {...fade}
        className="relative w-full overflow-hidden rounded-xl border border-primary/15 bg-gradient-to-br from-[#0d1321] via-primary/8 to-[hsl(var(--brand-orange))]/8 px-3 py-3 md:px-4 md:py-3.5"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-500/8 via-transparent to-transparent pointer-events-none" />
        <div className="relative space-y-2">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <Badge className="text-[9px] mb-1.5 h-5 px-2 bg-primary/15 text-primary border-primary/25 hover:bg-primary/15">
                LeadEdge360 Enterprise Growth OS
              </Badge>
              <h1 className="font-display text-lg md:text-xl font-bold tracking-tight leading-snug">
                AI-powered Lead Generation, Revenue Intelligence, Growth Automation, and Sales Execution Platform
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
              <div className="flex items-center gap-1.5 rounded-md border border-border/35 bg-background/50 px-2 py-1 text-[11px] backdrop-blur-sm">
                <Calendar className="size-3 text-muted-foreground shrink-0" />
                <span className="whitespace-nowrap font-medium">{d.dateLabel}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-md border border-border/35 bg-background/50 px-2 py-1 text-[11px] backdrop-blur-sm">
                <Globe className="size-3 text-primary shrink-0" />
                <span className="whitespace-nowrap">{d.workspaceName || 'AsoftechInsightz · Enterprise'}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5 border-t border-border/25">
            <Button asChild size="sm" className="rounded-full h-7 text-[11px] px-2.5">
              <Link href="/leadedge360/leads">
                <UserPlus className="size-3 mr-1" /> New Lead
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="rounded-full h-7 text-[11px] px-2.5 border-primary/25">
              <Link href="/leadedge360/growth-engine">
                <Rocket className="size-3 mr-1" /> Run Growth Audit
              </Link>
            </Button>
            <Button asChild size="sm" className="rounded-full h-7 text-[11px] px-2.5 bg-violet-600 hover:bg-violet-600/90">
              <Link href="/leadedge360/command-center">
                <Brain className="size-3 mr-1" /> Open AI Workspace
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Executive KPI row */}
      <motion.div {...fade} transition={{ delay: 0.03 }}>
        <ExecutiveOverviewStrip items={d.executiveOverview || []} />
      </motion.div>

      {/* AI Recommendations — above the fold */}
      <motion.div {...fade} transition={{ delay: 0.05 }}>
        <ExecutivePanel
          title="AI Recommendations"
          subtitle={`${d.aiRecommendations.length} actionable insights · ${d.totalLeadCount?.toLocaleString() || '1,248'} total leads`}
          action={
            <Button asChild variant="ghost" size="sm" className="h-6 text-[10px] px-2">
              <Link href="/leadedge360/command-center">View all <ArrowRight className="size-3 ml-0.5" /></Link>
            </Button>
          }
        >
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-2">
            {d.aiRecommendations.map((rec) => (
              <div
                key={rec.id}
                className="rounded-lg border border-border/35 bg-card/50 px-2.5 py-2 flex flex-col"
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[8px] px-1 py-0 h-4 capitalize',
                      rec.impact === 'high' ? PRIORITY_STYLES.high : rec.impact === 'medium' ? PRIORITY_STYLES.medium : PRIORITY_STYLES.low
                    )}
                  >
                    {IMPACT_PRIORITY[rec.impact] || 'Medium'} Priority
                  </Badge>
                  {rec.confidence != null && (
                    <span className="text-[9px] font-semibold text-emerald-400 tabular-nums">{rec.confidence}% Confidence</span>
                  )}
                </div>
                <p className="font-semibold text-xs leading-snug">{rec.title}</p>
                {rec.expectedImpact && (
                  <p className="text-[10px] text-emerald-400/90 mt-1 font-medium">
                    Expected Impact: {rec.expectedImpact.replace(/^Expected\s*/i, '')}
                  </p>
                )}
                <p className="text-[9px] text-muted-foreground leading-relaxed mt-0.5 line-clamp-2 flex-1">{rec.summary}</p>
                <Button
                  size="sm"
                  className="h-6 text-[10px] mt-2 rounded-full w-full"
                  onClick={() => toast.success(`${rec.actionLabel || 'Execute'} triggered (demo)`)}
                >
                  Execute
                </Button>
              </div>
            ))}
          </div>
        </ExecutivePanel>
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 w-full">
        <div className="lg:col-span-4 min-w-0">
          <ExecutivePanel title="Pipeline Funnel" subtitle="Horizontal funnel by stage">
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={d.pipeline} layout="vertical" margin={{ left: 4, right: 16, top: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} opacity={0.3} />
                  <XAxis type="number" {...CHART_AXIS} />
                  <YAxis type="category" dataKey="name" {...CHART_AXIS} width={68} tick={{ fontSize: 9 }} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.12 }} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={14}>
                    {d.pipeline.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                    <LabelList dataKey="count" position="right" fill="hsl(var(--foreground))" fontSize={9} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ExecutivePanel>
        </div>

        <div className="lg:col-span-4 min-w-0">
          <ExecutivePanel
            title="Revenue Trend"
            subtitle={`₹${(d.revenueTotal / 100000).toFixed(1)}L total · ${d.revenueChange}`}
          >
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={d.revenueTrend} margin={{ top: 6, right: 6, left: -4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradExec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--brand-orange))" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(var(--brand-orange))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
                  <XAxis dataKey="date" {...CHART_AXIS} dy={4} tick={{ fontSize: 9 }} />
                  <YAxis {...CHART_AXIS} tickFormatter={(v) => `₹${v / 1000}k`} width={44} tick={{ fontSize: 9 }} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--brand-orange))" strokeWidth={2} fill="url(#revenueGradExec)" dot={{ r: 2 }} activeDot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ExecutivePanel>
        </div>

        <div className="lg:col-span-4 min-w-0">
          <ExecutivePanel title="Campaign Performance" subtitle="Leads generated per week">
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <ReLineChart data={d.campaignPerformance || []} margin={{ top: 6, right: 6, left: -4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
                  <XAxis dataKey="week" {...CHART_AXIS} tick={{ fontSize: 9 }} />
                  <YAxis {...CHART_AXIS} width={28} tick={{ fontSize: 9 }} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Line type="monotone" dataKey="leads" stroke="#6366F1" strokeWidth={2} dot={{ r: 3, fill: '#6366F1' }} activeDot={{ r: 5 }} />
                </ReLineChart>
              </ResponsiveContainer>
            </div>
          </ExecutivePanel>
        </div>
      </div>

      {/* Territories + Lead Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-2 w-full">
        <div className="xl:col-span-7 min-w-0">
          <ExecutivePanel title="Top Territories" subtitle="City performance intelligence">
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/30 text-[9px] uppercase tracking-wide text-muted-foreground">
                    <th className="text-left py-1.5 px-1 font-medium">City</th>
                    <th className="text-right py-1.5 px-1 font-medium">Leads</th>
                    <th className="text-right py-1.5 px-1 font-medium">Growth %</th>
                    <th className="text-right py-1.5 px-1 font-medium">Conversion %</th>
                    <th className="text-right py-1.5 px-1 font-medium">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {territories.map((t) => (
                    <tr key={t.city} className="border-b border-border/20 hover:bg-muted/20">
                      <td className="py-1.5 px-1 font-medium">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3 text-primary/60 shrink-0" />
                          {t.city}
                        </span>
                      </td>
                      <td className="py-1.5 px-1 text-right tabular-nums font-semibold">{t.leads}</td>
                      <td className="py-1.5 px-1 text-right tabular-nums text-emerald-400">+{t.growthPct}%</td>
                      <td className="py-1.5 px-1 text-right tabular-nums">{t.conversionPct}%</td>
                      <td className="py-1.5 px-1 text-right tabular-nums font-medium text-primary">{t.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ExecutivePanel>
        </div>

        <div className="xl:col-span-2 min-w-0 hidden xl:block">
          <ExecutivePanel title="India Coverage" subtitle="Territory map" contentClassName="flex items-center justify-center">
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <div className="relative size-24 rounded-lg border border-dashed border-primary/25 bg-primary/5 flex items-center justify-center mb-2">
                <Map className="size-10 text-primary/40" />
                <div className="absolute top-3 right-4 size-2 rounded-full bg-emerald-400 animate-pulse" />
                <div className="absolute bottom-5 left-5 size-1.5 rounded-full bg-sky-400" />
                <div className="absolute top-8 left-7 size-1.5 rounded-full bg-violet-400" />
              </div>
              <p className="text-[10px] text-muted-foreground">UP · NCR · Tier-2 focus</p>
              <p className="text-[9px] text-primary/80 mt-0.5">{territories.length} active territories</p>
            </div>
          </ExecutivePanel>
        </div>

        <div className="xl:col-span-3 min-w-0">
          <ExecutivePanel
            title="Lead Sources"
            subtitle={`${(d.totalLeadCount || 1248).toLocaleString()} total leads`}
          >
            <div className="flex items-center gap-3">
              <div className="h-28 w-28 shrink-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={d.leadSources}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={26}
                      outerRadius={44}
                      paddingAngle={2}
                      stroke="hsl(var(--card))"
                      strokeWidth={2}
                    >
                      {d.leadSources.map((s) => (
                        <Cell key={s.name} fill={s.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v: number) => [`${v}%`, 'Share']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-sm font-bold tabular-nums">{(d.totalLeadCount || 1248).toLocaleString()}</p>
                  <p className="text-[8px] text-muted-foreground">Leads</p>
                </div>
              </div>
              <ul className="flex-1 space-y-1 min-w-0">
                {d.leadSources.map((s) => (
                  <li key={s.name} className="flex items-center justify-between text-[11px] gap-1">
                    <span className="flex items-center gap-1 min-w-0">
                      <span className="size-1.5 rounded-full shrink-0" style={{ background: s.color }} />
                      <span className="truncate">{s.name}</span>
                    </span>
                    <span className="font-semibold tabular-nums shrink-0">{s.value}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </ExecutivePanel>
        </div>
      </div>

      {/* Activities + Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
        <ExecutivePanel title="Recent Activities" subtitle="Enterprise activity stream">
          <ul className="space-y-0">
            {d.recentActivities.map((a, i) => {
              const Icon = ACTIVITY_ICONS[a.type] || Activity;
              const isLast = i === d.recentActivities.length - 1;
              const [label, ...rest] = a.text.split(' — ');
              return (
                <li key={a.id} className="flex gap-2.5 relative">
                  {!isLast && <div className="absolute left-[13px] top-7 bottom-0 w-px bg-border/50" />}
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-background z-10">
                    <Icon className="size-3 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1 pb-3">
                    <p className="text-[11px] leading-snug">
                      <span className="font-semibold text-primary">{label}</span>
                      {rest.length > 0 && <span className="text-foreground"> — {rest.join(' — ')}</span>}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{a.time}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </ExecutivePanel>

        <ExecutivePanel title="Upcoming Tasks" subtitle="Executive task queue">
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border/30 text-[9px] uppercase tracking-wide text-muted-foreground">
                  <th className="text-left py-1.5 px-1 font-medium">Task</th>
                  <th className="text-left py-1.5 px-1 font-medium hidden sm:table-cell">Owner</th>
                  <th className="text-left py-1.5 px-1 font-medium">Due</th>
                  <th className="text-right py-1.5 px-1 font-medium">Priority</th>
                </tr>
              </thead>
              <tbody>
                {d.upcomingTasks.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-border/20 hover:bg-muted/20 cursor-pointer"
                    onClick={() => toast.info(`Task: ${t.title}`)}
                  >
                    <td className="py-1.5 px-1 font-medium leading-snug max-w-[140px]">{t.title}</td>
                    <td className="py-1.5 px-1 text-muted-foreground hidden sm:table-cell whitespace-nowrap">{t.owner || '—'}</td>
                    <td className="py-1.5 px-1 text-muted-foreground whitespace-nowrap">{t.due}</td>
                    <td className="py-1.5 px-1 text-right">
                      <Badge variant="outline" className={cn('text-[8px] h-4 px-1 capitalize', PRIORITY_STYLES[t.priority])}>
                        {t.priority}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ExecutivePanel>
      </div>

      {/* AI Workspace — compact */}
      <div className="rounded-lg border border-violet-500/20 bg-gradient-to-r from-violet-500/8 via-card/40 to-primary/5 p-3 w-full">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-violet-500/15">
              <Sparkles className="size-3.5 text-violet-300" />
            </div>
            <div>
              <h2 className="font-semibold text-xs text-violet-100">AI Workspace</h2>
              <p className="text-[10px] text-muted-foreground">Intelligence modules · one click away</p>
            </div>
          </div>
          <Button asChild variant="ghost" size="sm" className="h-6 text-[10px] text-violet-300 hover:text-violet-200 hover:bg-violet-500/10">
            <Link href="/leadedge360/command-center">View all <ArrowRight className="size-3 ml-0.5" /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
          {AI_WORKSPACE_MODULES.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="min-w-0">
                <div className={cn(
                  'group flex flex-col gap-1 rounded-lg border px-2 py-2 h-full transition-all hover:shadow-sm',
                  MODULE_COLORS[item.color]
                )}>
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-background/40 text-primary">
                      <Icon className="size-3.5" />
                    </div>
                    <Badge variant="outline" className="text-[8px] h-4 px-1 shrink-0 hidden sm:flex">{item.badge}</Badge>
                  </div>
                  <p className="font-semibold text-[10px] leading-tight">{item.label}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick access */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 w-full">
        {d.quickAccess.map((item) => {
          const icons: Record<string, typeof Target> = {
            leads: Target, opportunities: BriefcaseBusiness, campaigns: Megaphone,
            ai: Bot, growth: Rocket, automation: Workflow,
          };
          const Icon = icons[item.icon] || Target;
          return (
            <Link key={item.href} href={item.href} className="min-w-0">
              <div className="group flex items-center gap-1.5 rounded-md border border-border/30 bg-card/40 px-2 py-2 hover:border-primary/30 hover:bg-primary/5 transition-all h-full">
                <Icon className="size-3.5 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-[10px] leading-tight truncate">{item.label}</p>
                  <p className="text-[9px] text-muted-foreground truncate">{item.stat}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
