'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, ExternalLink } from 'lucide-react'

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

export default function BillingPage() {
  const router = useRouter()
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/billing/status')
      .then((r) => {
        if (r.status === 401) {
          router.replace('/signin')
          return null
        }
        return r.ok ? r.json() : null
      })
      .then((data) => setStatus(data))
      .catch(() => setStatus(null))
      .finally(() => setLoading(false))
  }, [router])

  const planName = PLAN_LABELS[status?.plan] || status?.plan || 'Starter'
  const entitlements = status?.entitlements || { leadEnabled: true, retailEnabled: false }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <p className="text-xs tracking-widest text-muted-foreground uppercase">Account</p>
        <h1 className="font-display text-2xl font-bold md:text-3xl mt-1">Billing &amp; plan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your subscription and product access.
        </p>
      </div>

      <Card className="border-border/60 bg-card/60">
        <CardContent className="p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-medium">Current plan</h2>
            <Button asChild size="sm" variant="outline" className="rounded-full">
              <Link href="/pricing">
                Upgrade
                <ExternalLink className="ml-2 size-3.5" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading billing status…</p>
          ) : (
            <>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Plan</dt>
                  <dd className="font-medium">{planName}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="font-medium capitalize">{status?.billingStatus || 'none'}</dd>
                </div>
                {status?.subscription?.currentEnd && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Period ends</dt>
                    <dd className="font-medium">{formatDate(status.subscription.currentEnd)}</dd>
                  </div>
                )}
              </dl>

              <div className="pt-3 border-t border-border/60">
                <p className="text-xs text-muted-foreground mb-2">Product access</p>
                <ul className="space-y-1 text-sm">
                  {entitlements.leadEnabled && (
                    <li className="flex items-center gap-2">
                      <Check className="size-3.5 text-primary" />
                      LeadEdge360
                    </li>
                  )}
                  {entitlements.retailEnabled && (
                    <li className="flex items-center gap-2">
                      <Check className="size-3.5 text-accent" />
                      RetailEdge360
                    </li>
                  )}
                  {!entitlements.retailEnabled && (
                    <li className="text-xs text-muted-foreground">
                      Upgrade to Growth for RetailEdge360.
                    </li>
                  )}
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/40">
        <CardContent className="p-5 text-sm text-muted-foreground">
          <p>Need to change plan? Visit pricing or contact sales for Scale.</p>
          <Button asChild variant="link" className="px-0 mt-2 text-primary">
            <Link href="/pricing">View pricing</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
