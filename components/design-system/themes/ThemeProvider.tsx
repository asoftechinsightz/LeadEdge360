'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type ThemeName = 'marketing' | 'suite';

export interface ThemeProviderProps {
  theme: ThemeName;
  children: React.ReactNode;
  className?: string;
}

/**
 * Applies data-theme attribute for marketing or suite CSS variable scopes.
 * Does not modify global :root — existing pages remain unchanged until migration.
 */
export function ThemeProvider({ theme, children, className }: ThemeProviderProps) {
  return (
    <div data-theme={theme} className={cn('min-h-full text-foreground bg-background', className)}>
      {children}
    </div>
  );
}
