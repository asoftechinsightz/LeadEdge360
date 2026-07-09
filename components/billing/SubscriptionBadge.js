'use client'

import { Badge } from '@/components/design-system/core/Badge'
import { Crown } from 'lucide-react'

export function SubscriptionBadge({ plan, className }) {
  if (!plan) return null
  const label = String(plan).replace(/_/g, ' ')

  return (
    <Badge variant="accent" className={className}>
      <Crown className="mr-1 size-3" aria-hidden />
      <span className="capitalize">{label}</span>
    </Badge>
  )
}
