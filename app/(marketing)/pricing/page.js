'use client'
import { useEffect, useState } from 'react'
import Script from 'next/script'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { toast } from 'sonner'

const plans = [
  { id: 'starter', name: 'Starter', price: 1499, tag: 'For solo founders',
    features: ['Up to 500 leads/mo', '1 user', 'Web + WhatsApp capture', 'Basic AI scoring', 'Email support'] },
  { id: 'growth', name: 'Growth', price: 4999, tag: 'Most popular', highlight: true,
    features: ['Up to 10,000 leads/mo', '5 users', 'All channels (FB / Google / Web / WhatsApp)', 'Advanced AI scoring + Copilot', 'Territory routing & RBAC', 'WhatsApp automation', 'Priority support'] },
  { id: 'scale', name: 'Scale', price: null, tag: 'For enterprises', custom: true,
    features: ['Unlimited leads', 'Unlimited users', 'SSO + Audit logs', 'Dedicated CSM', 'On-prem / VPC option', 'SLA 99.95%'] },
]

export default function Pricing() {
  const [loadingPlan, setLoadingPlan] = useState(null)
  const [scriptReady, setScriptReady] = useState(false)
  const [user, setUser] = useState(null)
  const [testMode, setTestMode] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(j => setUser(j.user || null)).catch(() => {})
    fetch('/api/billing/plans').then(r => r.json()).then(j => {
      setTestMode(!!j.testMode)
    }).catch(() => {})
  }, [])

  const testActivate = async (plan) => {
    if (!user) { window.location.href = '/signin'; return }
    setLoadingPlan(plan.id)
    try {
      const r = await fetch('/api/billing/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id }),
      })
      const data = await r.json().catch(() => ({}))
      if (r.ok) {
        toast.success('Test payment activated')
        window.location.href = data.redirectUrl || `/billing/success?plan=${plan.id}`
      } else {
        toast.error(data.error || 'Test activation failed')
      }
    } catch (e) {
      toast.error(e.message || 'Test activation failed')
    } finally {
      setLoadingPlan(null)
    }
  }

  const subscribe = async (plan) => {
    if (plan.custom || plan.price == null) { window.location.href = '/contact'; return }
    if (!user) { window.location.href = '/signin'; return }
    setLoadingPlan(plan.id)
    try {
      const r = await fetch('/api/billing/checkout', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ planId: plan.id }) })
      if (r.status === 503) {
        toast.error('Payments not yet configured — redirecting to sales.')
        setTimeout(() => { window.location.href = '/contact' }, 1200)
        return
      }
      const data = await r.json()
      if (!data.order) throw new Error(data.error || 'order failed')
      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'AsoftechInsightz',
        description: `${plan.name} plan · monthly`,
        order_id: data.order.id,
        prefill: user ? { name: user.name, email: user.email } : {},
        theme: { color: '#FF8A3D' },
        handler: async (response) => {
          const v = await fetch('/api/billing/verify', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ ...response, planId: plan.id }) })
          const data = await v.json().catch(() => ({}))
          if (v.ok) {
            toast.success('Payment successful! Welcome aboard 🎉')
            const dest = data.redirectUrl || `/billing/success?plan=${plan.id}`
            setTimeout(() => { window.location.href = dest }, 800)
          } else toast.error(data.error || 'Payment verification failed')
        },
        modal: { ondismiss: () => setLoadingPlan(null) },
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (e) {
      toast.error(e.message || 'Checkout failed')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" onLoad={() => setScriptReady(true)} />
      <section className="container py-20 text-center">
        <Badge variant="outline" className="rounded-full border-primary/30 text-primary mb-4">Pricing</Badge>
        <h1 className="font-display font-bold text-5xl md:text-6xl">Simple, predictable plans.</h1>
        <p className="mt-5 text-muted-foreground text-lg max-w-xl mx-auto">Pay-as-you-grow. Cancel anytime. GST-compliant invoices. Pay via UPI, Cards, NetBanking on Razorpay.</p>
      </section>
      <section className="container pb-24 grid md:grid-cols-3 gap-5">
        {plans.map(p => (
          <Card key={p.id} className={`relative ${p.highlight ? 'border-primary/50 bg-gradient-to-b from-primary/10 to-card glow-orange' : 'bg-card/60 border-border/60'}`}>
            <CardContent className="p-8">
              {p.highlight && <Badge className="absolute -top-3 left-8 bg-primary text-primary-foreground">Most popular</Badge>}
              <div className="text-sm text-muted-foreground">{p.tag}</div>
              <div className="font-display text-2xl font-bold mt-1">{p.name}</div>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-display text-5xl font-bold">{p.price ? '₹' + p.price.toLocaleString('en-IN') : 'Custom'}</span>
                {p.price && <span className="text-muted-foreground text-sm">/month</span>}
              </div>
              <ul className="mt-6 space-y-2 text-sm">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-2"><Check className="h-4 w-4 mt-0.5 text-primary"/><span className="text-muted-foreground">{f}</span></li>
                ))}
              </ul>
              <Button
                onClick={() => (testMode ? testActivate(p) : subscribe(p))}
                disabled={loadingPlan === p.id || (p.price && !testMode && !scriptReady)}
                className={`mt-7 w-full rounded-full ${p.highlight ? 'bg-primary hover:bg-primary/90' : ''}`}
                variant={p.highlight ? 'default' : 'outline'}>
                {loadingPlan === p.id ? 'Processing…' : p.custom ? 'Talk to sales' : p.price ? (testMode ? 'Test activate' : 'Subscribe with Razorpay') : 'Start free'}
              </Button>
              {testMode && p.price && (
                <p className="mt-2 text-center text-xs text-amber-500/90">BILLING_TEST_MODE — no Razorpay charge</p>
              )}
            </CardContent>
          </Card>
        ))}
      </section>
      <section className="container pb-24 text-center text-xs text-muted-foreground">
        Payments are processed securely by <span className="text-foreground">Razorpay</span>. By subscribing you agree to our <Link href="/terms" className="text-primary hover:underline">Terms</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
      </section>
    </>
  )
}
