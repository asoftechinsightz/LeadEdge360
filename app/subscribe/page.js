'use client'

import { Suspense } from 'react'
import { PlansGrid } from '@/components/billing'

function SubscribeContent() {
  return <PlansGrid redirectOnSuccess="/onboarding" />
}

export default function SubscribePage() {
  return (
    <Suspense fallback={<div className="container py-16 text-center text-muted-foreground">Loading plans…</div>}>
      <SubscribeContent />
    </Suspense>
  )
}
