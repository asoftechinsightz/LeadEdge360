'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/design-system/core/Card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const CHART_TOOLTIP_STYLE = {
  background: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 10,
  fontSize: 12,
  boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
  color: 'hsl(var(--foreground))',
};

export const CHART_AXIS = {
  stroke: 'hsl(var(--muted-foreground))',
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};

export function ExecutivePanel({
  title,
  subtitle,
  action,
  children,
  className,
  contentClassName,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <Card className={cn('bg-card/75 border-border/40 backdrop-blur-md shadow-sm', className)}>
      <CardContent className={cn('p-3', contentClassName)}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-[13px] leading-tight">{title}</h3>
            {subtitle && <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

const KPI_ACCENTS = [
  'from-sky-500/25 to-sky-500/5 border-sky-500/30',
  'from-violet-500/25 to-violet-500/5 border-violet-500/30',
  'from-emerald-500/25 to-emerald-500/5 border-emerald-500/30',
  'from-amber-500/25 to-amber-500/5 border-amber-500/30',
  'from-cyan-500/25 to-cyan-500/5 border-cyan-500/30',
  'from-primary/25 to-primary/5 border-primary/35',
];

export function ExecutiveOverviewStrip({
  items,
}: {
  items: { label: string; value: string; sub: string; trend?: 'up' | 'down' | 'neutral' }[];
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
      {items.map((item, i) => {
        const TrendIcon = item.trend === 'down' ? TrendingDown : item.trend === 'up' ? TrendingUp : Minus;
        const trendColor =
          item.trend === 'up' ? 'text-emerald-400' : item.trend === 'down' ? 'text-red-400' : 'text-muted-foreground';
        return (
          <div
            key={item.label}
            className={cn(
              'rounded-lg border bg-card/80 px-2.5 py-2 backdrop-blur-sm transition-colors hover:border-primary/25',
              i === 0 && 'border-sky-500/20 bg-sky-500/[0.04]',
              i === 3 && 'border-violet-500/20 bg-violet-500/[0.04]',
              i === 5 && 'border-emerald-500/20 bg-emerald-500/[0.04]',
              ![0, 3, 5].includes(i) && 'border-border/35'
            )}
          >
            <p className="text-2xl md:text-[1.65rem] font-bold font-display tabular-nums tracking-tight leading-none">
              {item.value}
            </p>
            <p className="text-[9px] font-medium text-muted-foreground mt-1 truncate">{item.label}</p>
            <p className={cn('text-[9px] mt-0.5 flex items-center gap-0.5 font-medium truncate', trendColor)}>
              <TrendIcon className="size-2.5 shrink-0" aria-hidden />
              {item.sub}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export function ExecutiveKPICard({
  label,
  value,
  change,
  trend,
  icon,
  index = 0,
  featured = false,
}: {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  index?: number;
  featured?: boolean;
}) {
  const accent = KPI_ACCENTS[index % KPI_ACCENTS.length];
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border bg-gradient-to-br transition-all hover:border-primary/45 hover:shadow-md hover:shadow-primary/5',
        accent,
        featured ? 'p-4 min-h-[108px]' : 'p-3'
      )}
    >
      {featured && (
        <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      )}
      <div className={cn('flex gap-2', featured ? 'items-center' : 'items-start justify-between')}>
        <div className={cn('min-w-0 flex-1', featured && 'order-2')}>
          <p className={cn('font-medium text-muted-foreground uppercase tracking-wide', featured ? 'text-xs' : 'text-[10px]')}>
            {label}
          </p>
          <p className={cn('font-bold tracking-tight mt-0.5 font-display tabular-nums', featured ? 'text-2xl md:text-3xl' : 'text-lg')}>
            {value}
          </p>
          <p
            className={cn(
              'mt-1 flex items-center gap-1 font-medium',
              featured ? 'text-xs' : 'text-[10px]',
              trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-muted-foreground'
            )}
          >
            <TrendIcon className="size-3 shrink-0" aria-hidden />
            <span className="line-clamp-2">{change}</span>
          </p>
        </div>
        <div
          className={cn(
            'flex shrink-0 items-center justify-center rounded-lg bg-background/60 border border-border/40 text-primary',
            featured ? 'size-11 order-1' : 'size-8'
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
