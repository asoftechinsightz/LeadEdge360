'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './Card';

export interface DataCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  meta?: React.ReactNode;
  badges?: React.ReactNode;
  action?: React.ReactNode;
}

/** Touch-friendly card row for mobile data lists (L2) */
export function DataCard({
  title,
  subtitle,
  meta,
  badges,
  action,
  className,
  onClick,
  ...props
}: DataCardProps) {
  return (
    <Card
      className={cn(
        'border-border/60 bg-card/60 transition-colors',
        onClick && 'cursor-pointer active:bg-card/90',
        className
      )}
      onClick={onClick}
      {...props}
    >
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="font-medium leading-snug">{title}</div>
          {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
          {meta && <div className="text-sm text-muted-foreground">{meta}</div>}
          {badges && <div className="flex flex-wrap gap-1.5 pt-1">{badges}</div>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </CardContent>
    </Card>
  );
}
