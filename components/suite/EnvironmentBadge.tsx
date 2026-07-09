'use client'

import { getEnvironmentBadge } from '@/lib/env/runtime'

export function EnvironmentBadge() {
  const badge = getEnvironmentBadge()

  return (
    <span
      className={`hidden sm:inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider ${badge.className}`}
      title={`Environment: ${badge.label}`}
    >
      {badge.label}
    </span>
  )
}
