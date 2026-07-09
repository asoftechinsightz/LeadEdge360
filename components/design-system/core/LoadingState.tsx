import * as React from 'react';
import { cn } from '@/lib/utils';

export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  rows?: number;
}

export function LoadingState({ label = 'Loading…', rows = 3, className, ...props }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className={cn('space-y-3 rounded-xl border border-border bg-card p-6', className)}
      {...props}
    >
      <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" style={{ animationDelay: `${i * 75}ms` }} />
      ))}
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div
      role="status"
      className={cn('size-8 animate-spin rounded-full border-2 border-muted border-t-primary', className)}
      aria-label="Loading"
    />
  );
}
