'use client'

import { cn } from '@/lib/utils'

export function AuroraFallback({ className, label = 'AI ecosystem' }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border bg-[#050d1f]',
        className,
      )}
      aria-hidden
    >
      <div className="absolute inset-0 gix-aurora opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0066FF]/20 via-transparent to-[#8B5CF6]/15" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs uppercase tracking-[0.3em] text-white/40">{label}</span>
      </div>
    </div>
  )
}

export function GridFallback({ className }) {
  return (
    <div
      className={cn('relative overflow-hidden rounded-2xl border border-border bg-[#050d1f]/90 gix-hero-grid', className)}
      aria-hidden
    />
  )
}
