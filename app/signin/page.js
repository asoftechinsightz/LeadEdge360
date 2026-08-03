'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import SiteShell from '@/components/site/SiteShell'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, Mail, Sparkles, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function SignIn() {
  const [consents, setConsents] = useState({ dpdp: false, terms: false, marketing: false })
  const [authConfigured, setAuthConfigured] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((j) => {
        setAuthConfigured(j.configured !== false)
        if (j.user) window.location.replace('/dashboard')
      })
    const u = new URL(window.location.href)
    if (u.searchParams.get('auth_error')) setError(u.searchParams.get('auth_error'))
  }, [])

  const proceed = () => {
    if (!consents.dpdp || !consents.terms) {
      toast.error('Please accept the DPDP notice and Terms to continue.')
      return
    }
    localStorage.setItem('signup_consents', JSON.stringify({ ...consents, acceptedAt: new Date().toISOString() }))
    window.location.href = '/api/auth/login'
  }

  return (
    <SiteShell>
      <section className="container py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <Badge variant="outline" className="rounded-full border-primary/30 text-primary mb-5">Sign in / Sign up</Badge>
          <h1 className="font-display font-bold text-5xl md:text-6xl leading-tight">Welcome to <span className="gradient-text">AsoftechInsightz</span>.</h1>
          <p className="mt-5 text-muted-foreground text-lg max-w-md">One account. Two flagship products. Unified AI Copilot. Sign in with Google in one click.</p>
          <div className="mt-8 space-y-3 text-sm text-muted-foreground">
            <Line text="Multi-tenant workspace auto-provisioned on first sign-in" />
            <Line text="Role-based access (Admin / Manager / Agent)" />
            <Line text="DPDP Act, 2023 compliant — you control your data" />
            <Line text="Cancel anytime; export your data on request" />
          </div>
        </div>

        <Card className="bg-card/70 border-border/60">
          <CardContent className="p-8">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-primary"/>
              <div className="font-display font-semibold text-2xl">Continue with Google</div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">No password. Just one click via your work or personal Google account.</p>

            {!authConfigured && (
              <div className="flex gap-2 items-start p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-200 text-sm mb-5">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0"/>
                <div>
                  <div className="font-medium">Auth not yet configured</div>
                  <div className="text-amber-200/80 text-xs mt-1">Add <code>EMERGENT_PROJECT_ID</code> and <code>EMERGENT_API_KEY</code> in <code>.env</code> and restart — then this button will launch the Emergent sign-in.</div>
                </div>
              </div>
            )}
            {error && (
              <div className="flex gap-2 items-start p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-200 text-sm mb-5">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0"/>
                <div>Sign-in failed ({error}). Please try again.</div>
              </div>
            )}

            <div className="space-y-3 mb-6">
              <Consent checked={consents.dpdp} onChange={v => setConsents(c => ({ ...c, dpdp: v }))}>
                I have read and consent to processing of my personal data as described in the <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>, in accordance with the <strong>Digital Personal Data Protection Act, 2023</strong>. <span className="text-rose-300">*</span>
              </Consent>
              <Consent checked={consents.terms} onChange={v => setConsents(c => ({ ...c, terms: v }))}>
                I agree to the <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>. <span className="text-rose-300">*</span>
              </Consent>
              <Consent checked={consents.marketing} onChange={v => setConsents(c => ({ ...c, marketing: v }))}>
                I consent to receive product updates &amp; offers via email / WhatsApp. (optional)
              </Consent>
            </div>

            <Button onClick={proceed} className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 glow-orange">
              <ShieldCheck className="h-5 w-5 mr-2"/> Continue with Google
            </Button>
            <p className="text-xs text-muted-foreground mt-4 text-center">Need help? <a href="mailto:enquiry@asoftechinsightz.com" className="text-primary hover:underline">enquiry@asoftechinsightz.com</a></p>
          </CardContent>
        </Card>
      </section>
    </SiteShell>
  )
}

function Line({ text }) {
  return <div className="flex items-start gap-2"><ShieldCheck className="h-4 w-4 text-accent mt-0.5"/>{text}</div>
}

function Consent({ checked, onChange, children }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <Checkbox checked={checked} onCheckedChange={onChange} className="mt-0.5" />
      <span className="text-sm text-muted-foreground leading-relaxed">{children}</span>
    </label>
  )
}
