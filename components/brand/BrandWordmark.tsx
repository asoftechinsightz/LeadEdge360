import Link from 'next/link'
import { cn } from '@/lib/utils'
import { BRAND_PROMISE } from '@/lib/brand'

type BrandWordmarkProps = {
  href?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showPromise?: boolean
  /** @deprecated light theme is default; kept for API compat */
  variant?: 'light' | 'dark'
}

const sizes = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-2xl',
}

/** Text wordmark — uses brand typography and colours on any surface */
export function BrandWordmark({
  href = '/',
  className,
  size = 'md',
  showPromise = false,
  variant = 'light',
}: BrandWordmarkProps) {
  const mark = (
    <div className={cn('min-w-0 leading-tight', className)}>
      <div className={cn('font-display font-bold tracking-tight', sizes[size])}>
        <span className={variant === 'dark' ? 'text-white' : 'text-foreground'}>Asoftech</span>
        <span className="text-[hsl(var(--brand-electric))]">Insightz</span>
      </div>
      {showPromise && (
        <p className="text-[10px] tracking-wide text-muted-foreground mt-1">{BRAND_PROMISE}</p>
      )}
    </div>
  )

  if (!href) return mark

  return (
    <Link href={href} className="block min-w-0 hover:opacity-90 transition-opacity" title="AsoftechInsightz">
      {mark}
    </Link>
  )
}
