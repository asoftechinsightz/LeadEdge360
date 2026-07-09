'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiGet, apiPost } from '@/src/lib/api'
import { LEAD_ONBOARDING_STEPS, LEADS_TOUR_URL } from '@/lib/onboarding/onboarding-flow'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { Building2, Database, Sparkles, ArrowRight, Loader2 } from 'lucide-react'

const INDUSTRY_OPTIONS = [
  'Retail / Kirana',
  'Healthcare',
  'Real Estate',
  'Education',
  'Manufacturing',
  'SaaS / Technology',
  'Hospitality',
  'BFSI / Finance',
  'Other',
]

export default function OnboardingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [form, setForm] = useState({ companyName: '', industry: '' })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [seedPreview, setSeedPreview] = useState(null)

  useEffect(() => {
    apiGet('/onboarding/lead-step')
      .then((data) => {
        const state = data.state || {}
        setProgress(state.percent || 0)
        if (state.complete) {
          router.replace('/product-selection')
          return
        }
        if (state.demoLeadsImported && !state.aiScoreViewed) {
          router.replace(LEADS_TOUR_URL)
          return
        }
        if (state.companyName && !state.demoLeadsImported) setStep(1)
        else if (!state.companyName) setStep(0)

        const forced = Number(searchParams?.get('step'))
        if (forced === 3 && state.demoLeadsImported) {
          router.replace(LEADS_TOUR_URL)
        }
      })
      .catch(() => {})
  }, [router, searchParams])

  async function runStep1() {
    if (!form.companyName.trim()) {
      setMessage('Enter your company name to continue.')
      return
    }
    setLoading(true)
    setMessage('')
    try {
      const res = await apiPost('/onboarding/lead-step', {
        step: 1,
        companyName: form.companyName.trim(),
        industry: form.industry.trim(),
      })
      setProgress(res.state?.percent || 33)
      setStep(1)
    } catch (e) {
      setMessage(e.message || 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  async function runStep2() {
    setLoading(true)
    setMessage('')
    try {
      const res = await apiPost('/onboarding/lead-step', { step: 2 })
      setSeedPreview(res.result?.seed)
      setProgress(res.state?.percent || 66)
      setStep(2)
    } catch (e) {
      setMessage(e.message || 'Import failed')
    } finally {
      setLoading(false)
    }
  }

  function goToLeadsTour() {
    router.push(LEADS_TOUR_URL)
  }

  const currentMeta = LEAD_ONBOARDING_STEPS[step]

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-xl w-full border-border/60 shadow-xl">
        <CardContent className="p-8 space-y-6">
          <BrandLogo href="/" variant="icon" showText />
          <div>
            <p className="text-xs uppercase tracking-widest text-primary font-medium mb-1">LeadEdge360 setup</p>
            <h1 className="text-2xl font-bold">Get value in under 3 minutes</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Step {step + 1} of {LEAD_ONBOARDING_STEPS.length}: {currentMeta?.title}
            </p>
            <Progress value={progress} className="mt-3" />
          </div>

          {step === 0 && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/30 p-4">
                <Building2 className="size-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">{LEAD_ONBOARDING_STEPS[0].description}</p>
              </div>
              <div>
                <Label htmlFor="companyName">Company name</Label>
                <Input
                  id="companyName"
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  placeholder="Acme Sales Pvt Ltd"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  list="industry-options"
                  value={form.industry}
                  onChange={(e) => setForm({ ...form, industry: e.target.value })}
                  placeholder="Retail, Healthcare, SaaS…"
                  className="mt-1.5"
                />
                <datalist id="industry-options">
                  {INDUSTRY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt} />
                  ))}
                </datalist>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/30 p-4">
                <Database className="size-5 text-primary shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>{LEAD_ONBOARDING_STEPS[1].description}</p>
                  <p className="text-foreground font-medium">
                    We&apos;ll add 10 industry-matched leads, 1 pipeline deal, and 1 sample proposal.
                  </p>
                </div>
              </div>
              {seedPreview?.highlightedLeads?.length > 0 && (
                <ul className="text-sm space-y-1 rounded-lg border border-border/50 p-3 bg-card/50">
                  {seedPreview.highlightedLeads.slice(0, 5).map((l) => (
                    <li key={l.id} className="flex justify-between gap-2">
                      <span>{l.name}</span>
                      <span className="text-primary font-semibold tabular-nums">AI {l.score}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                <Sparkles className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-sm space-y-2">
                  <p className="font-medium text-foreground">Demo data imported!</p>
                  <p className="text-muted-foreground">{LEAD_ONBOARDING_STEPS[2].description}</p>
                </div>
              </div>
            </div>
          )}

          {message && <p className="text-sm text-red-500" role="alert">{message}</p>}

          <div className="flex gap-2">
            {step > 0 && step < 2 && (
              <Button variant="outline" disabled={loading} onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            {step === 0 && (
              <Button className="flex-1" disabled={loading} onClick={runStep1}>
                {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                Continue
                <ArrowRight className="ml-2 size-4" />
              </Button>
            )}
            {step === 1 && (
              <Button className="flex-1" disabled={loading} onClick={runStep2}>
                {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                Import demo leads
                <Database className="ml-2 size-4" />
              </Button>
            )}
            {step === 2 && (
              <Button className="flex-1" onClick={goToLeadsTour}>
                View AI scores
                <Sparkles className="ml-2 size-4" />
              </Button>
            )}
          </div>

          {step < 2 && (
            <p className="text-xs text-center text-muted-foreground">
              Required for trial workspaces — complete all 3 steps to unlock the dashboard.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
