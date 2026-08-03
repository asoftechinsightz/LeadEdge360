'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, IndianRupee, Target } from 'lucide-react'
import { AeoGrowthEngine } from '@/components/aeo/AeoGrowthEngine'

function formatDate() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [billing, setBilling] = useState(null)
  const [leadKpis, setLeadKpis] = useState(null)
  const [retailKpis, setRetailKpis] = useState(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((j) => {
        setUser(j.user || null)
        setBilling(j.billing || null)
      })
      .catch(() => {})

    Promise.all([
      fetch('/api/kpis').then((r) => r.json()).catch(() => null),
      fetch('/api/retail-kpis').then((r) => r.json()).catch(() => null),
    ]).then(([leads, retail]) => {
      setLeadKpis(leads)
      setRetailKpis(retail)
    })
  }, [])

  const planLabel = billing?.plan
    ? billing.plan.charAt(0).toUpperCase() + billing.plan.slice(1)
    : null

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs tracking-widest text-muted-foreground uppercase">Overview</p>
          <h1 className="font-display text-2xl font-bold md:text-3xl mt-1">
            {user?.name ? `Good morning, ${user.name.split(' ')[0]}` : 'Workspace overview'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{formatDate()}</p>
        </div>
        {planLabel && billing?.activated && (
          <Badge variant="outline" className="rounded-full border-primary/30 text-primary capitalize">
            {planLabel} plan
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total leads', value: leadKpis?.total ?? '—' },
          { label: 'Hot leads', value: leadKpis?.hot ?? '—' },
          { label: 'Conversion', value: leadKpis ? `${leadKpis.conversion}%` : '—' },
          { label: 'SKUs at risk', value: retailKpis?.byRisk?.[0]?.value ?? '—' },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-border/60 bg-card/60 border-l-2 border-l-primary">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className="font-display text-2xl font-bold mt-1 tabular-nums">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <AeoGrowthEngine />

      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Your products</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-border/60 bg-card/60 hover:border-primary/30 transition">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Target className="size-5 text-primary" />
                <span className="font-display font-semibold text-lg">LeadEdge360</span>
              </div>
              <p className="text-sm text-muted-foreground">CRM &amp; lead intelligence</p>
              <p className="text-xs text-muted-foreground mt-3">
                {leadKpis?.total != null ? `${leadKpis.total} leads · ${leadKpis.hot ?? 0} hot` : 'Loading…'}
              </p>
              <Button asChild className="mt-4 rounded-full">
                <Link href="/leadedge360">
                  Open dashboard
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60 hover:border-accent/30 transition">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <IndianRupee className="size-5 text-accent" />
                <span className="font-display font-semibold text-lg">RetailEdge360</span>
              </div>
              <p className="text-sm text-muted-foreground">Expiry &amp; shelf-life AI</p>
              <p className="text-xs text-muted-foreground mt-3">
                {retailKpis?.total != null ? `${retailKpis.total} SKUs tracked` : 'Loading…'}
              </p>
              <Button asChild variant="outline" className="mt-4 rounded-full">
                <Link href="/retailedge360">
                  Open dashboard
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-border/60 bg-card/40">
        <CardContent className="flex flex-wrap items-center gap-3 p-5 text-sm">
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => router.push('/leadedge360')}>
            + New lead
          </Button>
          <Button variant="ghost" size="sm" className="rounded-full" asChild>
            <Link href="/billing">View billing</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
