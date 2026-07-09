'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LeadEdgeBrandLogo } from '@/components/brand/ProductBrandLogo';

type LeadEdgeBrandProps = {
  collapsed?: boolean;
  className?: string;
  variant?: 'sidebar' | 'compact';
};

/** @deprecated Prefer LeadEdgeBrandLogo or SuiteBrandLogo */
export function LeadEdgeBrand({ collapsed = false, className }: LeadEdgeBrandProps) {
  return (
    <LeadEdgeBrandLogo
      href="/leadedge360"
      collapsed={collapsed}
      variant="compact"
      className={cn(className)}
    />
  );
}
