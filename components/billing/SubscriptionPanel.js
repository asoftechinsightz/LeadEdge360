'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/design-system/core/Card'
import { Button } from '@/components/design-system/core/Button'
import { LoadingState } from '@/components/design-system/core/LoadingState'
import { SubscriptionBadge } from './SubscriptionBadge'
import { PaymentStatus } from './PaymentStatus'
import { formatDate } from './constants'
import { CreditCard, ArrowRight } from 'lucide-react'

export function SubscriptionPanel({ subscription, isLoading }) {
  if (isLoading) {
    return <LoadingState label="Loading subscription…" rows={2} />
  }

  const plan = subscription?.plan || 'starter'
  const sub = subscription?.subscription
  const status = sub?.status || 'active'

  return (
    <Card className="border-border/60 bg-card/60">
      <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-primary/15 p-3 text-primary">
            <CreditCard className="size-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current subscription</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <SubscriptionBadge plan={plan} />
              <PaymentStatus status={status} />
            </div>
            {sub?.renewalDate && (
              <p className="mt-2 text-sm text-muted-foreground">
                Renews {formatDate(sub.renewalDate)}
              </p>
            )}
            {!sub && (
              <p className="mt-2 text-sm text-muted-foreground">
                Upgrade your plan to unlock proposals, invoices, and revenue analytics.
              </p>
            )}
          </div>
        </div>

        <Button asChild variant="accent" className="rounded-full shrink-0">
          <Link href="/subscribe">
            Manage plan <ArrowRight className="ml-1 size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
