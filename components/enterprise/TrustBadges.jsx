'use client'

import { Shield, Cloud, Cpu, Globe, Lock, Headphones, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

const DEFAULT_BADGES = [
  { icon: Shield, label: 'Secure by Design' },
  { icon: Cloud, label: 'Cloud Native' },
  { icon: Cpu, label: 'AI Powered' },
  { icon: Lock, label: 'Enterprise Ready' },
  { icon: MapPin, label: 'Made in India' },
  { icon: Headphones, label: '24×7 Support' },
]

export function TrustBadges({ badges = DEFAULT_BADGES, className, compact = false }) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {badges.map(({ icon: Icon, label }) => (
        <span
          key={label}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 text-slate-300 backdrop-blur-sm',
            compact ? 'px-2.5 py-1 text-[10px]' : 'px-3 py-1.5 text-xs',
          )}
        >
          <Icon className={cn('text-violet-300', compact ? 'size-3' : 'size-3.5')} />
          {label}
        </span>
      ))}
    </div>
  )
}

export function TrustStrip({ className }) {
  const items = ['SOC-ready architecture', 'Multi-tenant SaaS', 'Role-based access', 'API integrations', 'DPDP aligned']
  return (
    <div className={cn('border-y border-white/10 bg-[#050a18]/80 backdrop-blur-sm', className)}>
      <div className="container py-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
        {items.map((item) => (
          <span key={item} className="flex items-center gap-1.5">
            <Globe className="size-3 text-cyan-400" />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
