import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './Card';

const kpiVariants = cva('', {
  variants: {
    trend: {
      up: 'text-[hsl(var(--brand-electric))]',
      down: 'text-destructive',
      neutral: 'text-muted-foreground',
    },
  },
  defaultVariants: { trend: 'neutral' },
});

export interface KPICardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  isLoading?: boolean;
  glass?: boolean;
}

export function KPICard({
  label,
  value,
  change,
  trend = 'neutral',
  icon,
  isLoading,
  glass = true,
  className,
  ...props
}: KPICardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <Card
      variant={glass ? 'glass' : 'default'}
      className={cn('overflow-hidden brand-gradient-border', className)}
      {...props}
    >
      <CardContent className="p-5 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-muted-foreground truncate">{label}</p>
            {isLoading ? (
              <div className="mt-2 h-8 w-24 animate-pulse rounded-md bg-muted" aria-busy="true" />
            ) : (
              <p className="mt-1 font-display text-2xl font-bold tracking-tight md:text-3xl">{value}</p>
            )}
            {change && !isLoading && (
              <p className={cn('mt-1 flex items-center gap-1 text-xs font-medium', kpiVariants({ trend }))}>
                <TrendIcon className="size-3.5" aria-hidden />
                {change}
              </p>
            )}
          </div>
          {icon && (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--product-accent,var(--brand-electric)))]/10 text-[hsl(var(--product-accent,var(--brand-electric)))] ring-1 ring-[hsl(var(--product-accent,var(--brand-electric)))]/20">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/** Alias for KPI-style metrics with optional subtitle */
export interface MetricCardProps extends KPICardProps {
  subtitle?: string;
}

export function MetricCard({ subtitle, ...props }: MetricCardProps) {
  return (
    <div className="space-y-1">
      <KPICard {...props} />
      {subtitle && <p className="px-1 text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export interface StatCardProps extends Omit<KPICardProps, 'change' | 'trend'> {
  stat?: string;
  description?: string;
}

export function StatCard({ stat, description, label, value, ...props }: StatCardProps) {
  return (
    <div className="space-y-1">
      <KPICard
        label={label}
        value={value}
        change={stat}
        trend={stat?.startsWith('-') ? 'down' : stat?.startsWith('+') ? 'up' : 'neutral'}
        {...props}
      />
      {description && <p className="px-1 text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}
