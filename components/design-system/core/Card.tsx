import * as React from 'react';
import { cn } from '@/lib/utils';
import { elevation } from '../foundations';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevationLevel?: 0 | 1 | 2 | 3 | 4;
  variant?: 'default' | 'glass';
}

const elevationClass: Record<number, string> = {
  0: 'shadow-none',
  1: 'shadow-sm',
  2: 'shadow-md',
  3: 'shadow-lg',
  4: 'shadow-xl',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, elevationLevel = 1, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      data-elevation={elevation[`${elevationLevel}` as keyof typeof elevation]?.zIndex}
      className={cn(
        variant === 'glass'
          ? 'brand-glass-card rounded-2xl border-0 text-card-foreground'
          : 'rounded-xl border border-border bg-card text-card-foreground',
        elevationClass[elevationLevel],
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'DSCard';

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col gap-1.5 p-6', className)} {...props} />
  )
);
CardHeader.displayName = 'DSCardHeader';

export const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('font-display text-lg font-semibold leading-none', className)} {...props} />
  )
);
CardTitle.displayName = 'DSCardTitle';

export const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
);
CardDescription.displayName = 'DSCardDescription';

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'DSCardContent';

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  )
);
CardFooter.displayName = 'DSCardFooter';
