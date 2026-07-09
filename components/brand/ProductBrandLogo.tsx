'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  BRAND_NAME,
  BRAND_PROMISE,
  BRAND_TAGLINE,
  BRAND_LOGOS,
  PRODUCTS,
} from '@/lib/brand';

export type ProductBrandLogoProps = {
  brand?: 'leadedge360' | 'retailedge360' | 'master';
  href?: string | null;
  variant?: 'horizontal' | 'icon' | 'compact';
  showPoweredBy?: boolean;
  showTagline?: boolean;
  /** Blends white-box PNG logos on dark suite surfaces */
  onDarkSurface?: boolean;
  className?: string;
};

const SIZES = {
  horizontal: { width: 200, height: 56, box: 'h-12 w-auto max-w-[200px]' },
  compact: { width: 160, height: 44, box: 'h-10 w-auto max-w-[160px]' },
  icon: { width: 40, height: 40, box: 'h-10 w-10' },
};

export function ProductBrandLogo({
  brand = 'master',
  href,
  variant = 'horizontal',
  showPoweredBy = false,
  showTagline = false,
  onDarkSurface = false,
  className,
}: ProductBrandLogoProps) {
  const size = SIZES[variant];
  const isMaster = brand === 'master';
  const product = !isMaster ? PRODUCTS[brand] : null;
  const src = isMaster
    ? BRAND_LOGOS.master
    : variant === 'icon'
      ? (brand === 'leadedge360' ? BRAND_LOGOS.leadedge360Icon : BRAND_LOGOS.retailedge360Icon)
      : product!.logo;
  const alt = isMaster ? BRAND_NAME : product!.name;
  const linkHref = href === null ? null : (href ?? (isMaster ? '/' : product!.href));

  const image = (
    <div
      className={cn(
        'relative shrink-0',
        size.box,
        onDarkSurface &&
          !isMaster &&
          variant !== 'icon' &&
          'rounded-lg border border-white/15 bg-white px-2 py-1.5 shadow-sm',
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={size.width}
        height={size.height}
        className={cn(
          'h-full w-auto object-contain object-left',
          variant === 'icon' && 'object-center',
        )}
        priority
      />
    </div>
  );

  const textBlock = (variant !== 'icon' && (showTagline || showPoweredBy)) && (
    <div className="min-w-0 leading-tight">
      {showTagline && isMaster && (
        <p className="text-[10px] text-muted-foreground truncate">{BRAND_TAGLINE}</p>
      )}
      {showTagline && product && (
        <p className="text-[10px] text-muted-foreground truncate">{product.tagline}</p>
      )}
      {showPoweredBy && !isMaster && (
        <p className="text-[9px] uppercase tracking-wide text-muted-foreground/80 mt-0.5">
          Powered by {BRAND_NAME}
        </p>
      )}
    </div>
  );

  const content = (
    <div className={cn('flex items-center gap-2 min-w-0 shrink-0', variant === 'icon' && 'justify-center', className)}>
      {image}
      {textBlock}
    </div>
  );

  if (!linkHref) return content;

  return (
    <Link href={linkHref} className="block min-w-0 hover:opacity-90 transition-opacity" title={alt}>
      {content}
    </Link>
  );
}

/** Corporate master brand — website, proposals, sign-in */
export function BrandLogo({
  href = '/dashboard',
  variant = 'compact',
  className,
  showText = true,
}: {
  href?: string;
  variant?: 'icon' | 'compact' | 'sidebar';
  className?: string;
  showText?: boolean;
}) {
  const mapVariant = variant === 'sidebar' ? 'horizontal' : variant === 'icon' ? 'icon' : 'compact';

  if (!showText && variant === 'icon') {
    return (
      <ProductBrandLogo brand="master" href={href} variant="icon" className={className} />
    );
  }

  if (variant === 'sidebar' || variant === 'compact') {
    return (
      <ProductBrandLogo
        brand="master"
        href={href}
        variant={mapVariant}
        showTagline={showText && variant === 'sidebar'}
        className={className}
      />
    );
  }

  return (
    <Link href={href} className={cn('flex items-center gap-3 min-w-0 hover:opacity-90', className)}>
      <ProductBrandLogo brand="master" href={null} variant="icon" />
      {showText && (
        <div className="min-w-0 leading-tight">
          <div className="font-semibold text-sm truncate">
            <span>Asoftech</span>
            <span className="text-[hsl(var(--brand-electric))]">Insightz</span>
          </div>
          <div className="text-[10px] tracking-wide text-muted-foreground truncate">{BRAND_PROMISE}</div>
        </div>
      )}
    </Link>
  );
}

export function LeadEdgeBrandLogo({
  href = '/dashboard',
  variant = 'horizontal',
  collapsed = false,
  onDarkSurface = true,
  className,
}: {
  href?: string;
  variant?: 'horizontal' | 'icon' | 'compact';
  collapsed?: boolean;
  onDarkSurface?: boolean;
  className?: string;
}) {
  return (
    <ProductBrandLogo
      brand="leadedge360"
      href={href}
      variant={collapsed ? 'icon' : variant}
      onDarkSurface={onDarkSurface && !collapsed}
      className={className}
    />
  );
}

export function RetailEdgeBrandLogo({
  href = '/retailedge360',
  variant = 'horizontal',
  collapsed = false,
  onDarkSurface = true,
  className,
}: {
  href?: string;
  variant?: 'horizontal' | 'icon' | 'compact';
  collapsed?: boolean;
  onDarkSurface?: boolean;
  className?: string;
}) {
  return (
    <ProductBrandLogo
      brand="retailedge360"
      href={href}
      variant={collapsed ? 'icon' : variant}
      onDarkSurface={onDarkSurface && !collapsed}
      className={className}
    />
  );
}
