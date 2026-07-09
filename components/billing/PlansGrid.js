'use client'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Store, Users, Package } from 'lucide-react'
import { apiGet } from '@/src/lib/api'
import { PageHeader } from '@/components/design-system/core/PageHeader'
import { LoadingState } from '@/components/design-system/core/LoadingState'
import { PlanCard } from './PlanCard'
import { useSubscribeCheckout } from './useSubscribeCheckout'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'retail', label: 'RetailEdge360', icon: Store },
  { id: 'lead', label: 'LeadEdge360', icon: Users },
  { id: 'bundle', label: 'Bundles', icon: Package },
]

export function PlansGrid({ redirectOnSuccess = '/onboarding' }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('product') || 'lead'
  const [activeTab, setActiveTab] = useState(
    TABS.some((t) => t.id === initialTab) ? initialTab : 'lead',
  )

  const plansQuery = useQuery({
    queryKey: ['billing', 'plans'],
    queryFn: () => apiGet('/billing/plans'),
  })

  const subscriptionQuery = useQuery({
    queryKey: ['billing', 'subscription'],
    queryFn: () => apiGet('/users/subscription'),
  })

  const { subscribe, loading } = useSubscribeCheckout({
    onSuccess: () => router.push(redirectOnSuccess),
  })

  const plans = useMemo(() => {
    const all = plansQuery.data?.plans || []
    return all.filter((p) => !p.legacy && p.product === activeTab)
  }, [plansQuery.data?.plans, activeTab])

  if (plansQuery.isLoading) {
    return (
      <div className="container py-10">
        <PageHeader title="Choose your plan" description="Business Suite subscriptions" />
        <LoadingState label="Loading plans…" rows={3} />
      </div>
    )
  }

  const configured = plansQuery.data?.configured !== false
  const currentPlanId = subscriptionQuery.data?.plan

  return (
    <div className="container py-10 space-y-8">
      <PageHeader
        title="Subscribe to Business Suite"
        description="Affordable monthly plans in INR. Digital delivery — your workspace activates instantly after payment."
        className="text-center items-center"
      />

      <div className="flex flex-wrap justify-center gap-3">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border transition-all',
                activeTab === tab.id
                  ? 'bg-accent border-accent text-accent-foreground'
                  : 'border-border text-muted-foreground hover:border-accent/40',
              )}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {!configured && (
        <p className="text-center text-sm text-muted-foreground">
          Payment gateway is not configured.{' '}
          <Link href="/contact" className="text-accent hover:underline">Contact sales</Link> to subscribe.
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            currentPlanId={currentPlanId}
            onSubscribe={subscribe}
            loading={loading}
            configured={configured}
          />
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground max-w-2xl mx-auto">
        Trinetra360 enterprise observability is billed separately.{' '}
        <Link href="/products/trinetra360" className="text-accent hover:underline">Learn more</Link>
        {' · '}
        <Link href="/pricing" className="text-accent hover:underline">Marketing pricing</Link>
        {' · '}
        <Link href="/refund-policy" className="text-accent hover:underline">Refund policy</Link>
      </p>
    </div>
  )
}
