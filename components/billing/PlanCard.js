'use client'

import { Card, CardContent } from '@/components/design-system/core/Card'
import { Button } from '@/components/design-system/core/Button'
import { Badge } from '@/components/design-system/core/Badge'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from './constants'

export function PlanCard({
  plan,
  currentPlanId,
  onSubscribe,
  loading = false,
  configured = true,
}) {
  const isCurrent = currentPlanId && (plan.planCode === currentPlanId || plan.id === currentPlanId)
  const isCustom = plan.custom || plan.price == null
  const features = plan.features || []

  return (
    <Card
      className={cn(
        'relative overflow-hidden border-border/60 bg-card/60 h-full',
        plan.highlight && 'ring-2 ring-accent/50 border-accent/40',
        isCurrent && 'ring-2 ring-accent border-accent/40',
      )}
    >
      <CardContent className="flex h-full flex-col p-6 md:p-8">
        {plan.highlight && !isCurrent && (
          <Badge variant="accent" className="mb-3 w-fit">Popular</Badge>
        )}
        {isCurrent && (
          <Badge variant="accent" className="mb-3 w-fit">Current plan</Badge>
        )}

        <p className="text-xs uppercase tracking-widest text-muted-foreground">{plan.productLabel}</p>
        <h3 className="font-display text-2xl font-bold mt-1">{plan.name}</h3>

        <div className="mt-3 font-display text-3xl font-bold">
          {isCustom ? (
            <span className="text-xl">Custom pricing</span>
          ) : (
            <>
              {formatCurrency(plan.price)}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                /{plan.interval || 'month'}
              </span>
            </>
          )}
        </div>

        {plan.setupPrice && (
          <p className="text-xs text-muted-foreground mt-1">
            {plan.setupLabel || 'One-Time Setup'}: <span className="font-medium text-foreground">{formatCurrency(plan.setupPrice)}</span>
          </p>
        )}
        {plan.badge && (
          <span className="inline-block mt-2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30">
            {plan.badge}
          </span>
        )}
        {plan.idealFor && (
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">Ideal for: {plan.idealFor}</p>
        )}

        {features.length > 0 && (
          <ul className="mt-6 flex-1 space-y-2 text-sm text-muted-foreground">
            {features.slice(0, 8).map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                {feature}
              </li>
            ))}
            {features.length > 8 && (
              <li className="text-xs text-muted-foreground/80">+{features.length - 8} more features</li>
            )}
          </ul>
        )}

        <div className="mt-8">
          {isCustom ? (
            <Button asChild variant="outline" className="w-full rounded-full">
              <a href="/contact">Contact sales</a>
            </Button>
          ) : (
            <Button
              className="w-full rounded-full bg-accent hover:bg-accent/90"
              disabled={loading || isCurrent || !configured}
              onClick={() => onSubscribe?.(plan.id)}
            >
              {isCurrent ? 'Active plan' : loading ? 'Processing…' : 'Subscribe now'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
