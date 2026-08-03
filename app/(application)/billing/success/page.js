'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Check, ArrowRight } from 'lucide-react'

const PLAN_LABELS = {
  starter: 'Starter',
  growth: 'Growth',
  scale: 'Scale',
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function BillingSuccessPage() {
  const [planParam, setPlanParam] = useState(null)
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('plan')
    setPlanParam(p)
    fetch('/api/billing/status')
      .then(r => (r.ok ? r.json() : null))
      .then(data => setStatus(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const planCode = status?.plan || planParam || 'starter'
  const planName = PLAN_LABELS[planCode] || planCode
  const subscription = status?.subscription
  const entitlements = status?.entitlements || { leadEnabled: true, retailEnabled: false }

  return (
    <div className="mx-auto max-w-lg space-y-6 py-4 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
        <Check className="h-8 w-8 text-primary" />
      </div>
      <Badge variant="outline" className="rounded-full border-primary/30 text-primary">
        Payment successful
      </Badge>
      <h1 className="font-display font-bold text-2xl md:text-3xl">
        Welcome to {planName}
      </h1>
      <p className="text-muted-foreground text-sm">
        Your subscription is active. Here&apos;s what you can access now.
      </p>

      <Card className="text-left bg-card/60 border-border/60">
        <CardContent className="p-6 space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading your plan details…</p>
          ) : (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium">{planName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium capitalize">
                  {status?.billingStatus || subscription?.status || 'active'}
                </span>
              </div>
              {subscription?.currentEnd && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current period ends</span>
                  <span className="font-medium">{formatDate(subscription.currentEnd)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-border/60">
                <p className="text-xs text-muted-foreground mb-2">Products enabled</p>
                <ul className="space-y-1 text-sm">
                  {entitlements.leadEnabled && (
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-primary" />
                      LeadEdge360
                    </li>
                  )}
                  {entitlements.retailEnabled && (
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-accent" />
                      RetailEdge360
                    </li>
                  )}
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild className="rounded-full">
          <Link href="/dashboard">
            Go to dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        {entitlements.retailEnabled && (
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/retailedge360">Open RetailEdge360</Link>
          </Button>
        )}
      </div>
    </div>
  )
}
