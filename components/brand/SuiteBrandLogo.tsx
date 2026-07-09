'use client';

import { usePathname } from 'next/navigation';
import {
  LeadEdgeBrandLogo,
  RetailEdgeBrandLogo,
  BrandLogo,
} from '@/components/brand/ProductBrandLogo';
import { getProductBrandFromPath } from '@/lib/brand';
import { cn } from '@/lib/utils';

type SuiteBrandLogoProps = {
  collapsed?: boolean;
  className?: string;
  /** compact = header; horizontal = sidebar (full logo) */
  presentation?: 'sidebar' | 'header';
};

/** Context-aware sidebar/header brand — logo only, no duplicate tagline text */
export function SuiteBrandLogo({
  collapsed = false,
  className,
  presentation = 'sidebar',
}: SuiteBrandLogoProps) {
  const pathname = usePathname() || '';
  const context = getProductBrandFromPath(pathname);
  const variant = presentation === 'header' || collapsed ? 'compact' : 'horizontal';

  if (context === 'retailedge360') {
    return (
      <RetailEdgeBrandLogo
        href="/retailedge360"
        collapsed={collapsed}
        variant={variant}
        onDarkSurface
        className={cn(className)}
      />
    );
  }

  if (context === 'leadedge360') {
    return (
      <LeadEdgeBrandLogo
        href="/dashboard"
        collapsed={collapsed}
        variant={variant}
        onDarkSurface
        className={cn(className)}
      />
    );
  }

  return (
    <BrandLogo
      href="/dashboard"
      variant={collapsed ? 'icon' : presentation === 'header' ? 'compact' : 'sidebar'}
      showText={!collapsed && presentation === 'sidebar'}
      className={className}
    />
  );
}
