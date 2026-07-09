'use client';

import { RetailEdgeBrandLogo } from '@/components/brand/ProductBrandLogo';
import { cn } from '@/lib/utils';

type RetailEdgeBrandProps = {
  collapsed?: boolean;
  className?: string;
};

export function RetailEdgeBrand({ collapsed = false, className }: RetailEdgeBrandProps) {
  return (
    <RetailEdgeBrandLogo
      href="/retailedge360"
      collapsed={collapsed}
      className={cn(className)}
    />
  );
}
