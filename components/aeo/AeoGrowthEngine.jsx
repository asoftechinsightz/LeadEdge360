'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Sparkles,
  Building2,
  HelpCircle,
  MapPin,
  MessageSquare,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Copy,
  Wand2,
} from 'lucide-react'
import { toast } from 'sonner'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import fieldsConfig from '@/config/aeo/business-profile-fields.json'
import defaultsConfig from '@/config/aeo/defaults.json'
import {
  computeAeoScore,
  FAQ_TARGET,
  checklistProgress,
  reviewHealthLabel,
} from '@/lib/aeo/compute'
import { buildRuleRecommendations } from '@/lib/aeo/recommendations'
import {
  hydrateAeoProfileFromApi,
  saveAeoProfile,
  saveAeoProfileToServer,
  clearAeoSessionStorage,
  parseKeywordsInput,
} from '@/lib/aeo/profile'
import { invokeAeoPrompt } from '@/lib/aeo/actions'

const TERRITORY_OPTIONS = defaultsConfig.defaultTerritories || []

export function AeoKpiRow({ profile, kpis, compact = false }) {
  const metrics = useMemo(() => computeAeoScore(profile, kpis), [profile, kpis])
  const faqCount = profile?.faqs?.length ?? 0

  return (
    <div className={`grid grid-cols-2 ${compact ? 'md:grid-cols-5' : 'lg:grid-cols-5'} gap-4`}>
      <KpiCard
        icon={Sparkles}
        label="AEO SCORE"
        value={metrics.score}
        sub="answer readiness"
        accent="primary"
      />
      <KpiCard
        icon={Building2}
        label="BUSINESS COMPLETENESS"
        value={`${metrics.completeness}%`}
        sub="profile fields"
        accent="primary"
      />
      <KpiCard
        icon={HelpCircle}
        label="FAQ READINESS"
        value={`${faqCount}/${FAQ_TARGET}`}
        sub={`${metrics.faqPct}% of target`}
        accent="accent"
      />
      <KpiCard
        icon={MapPin}
        label="LOCAL VISIBILITY"
        value={`${metrics.localPct}%`}
        sub="territories active"
        accent="accent"
      />
      <KpiCard
        icon={MessageSquare}
        label="REVIEW HEALTH"
        value={reviewHealthLabel(profile)}
        sub={`${metrics.reviewPct}% health`}
        accent="primary"
      />
    </div>
  )
}

export function AeoGrowthEngine({ compact = false }) {
  const [profile, setProfile] = useState(null)
  const [kpis, setKpis] = useState(null)
  const [leads, setLeads] = useState([])
  const [panelOpen, setPanelOpen] = useState(!compact)
  const [keywordsInput, setKeywordsInput] = useState('')
  const [faqDraft, setFaqDraft] = useState({ question: '', answer: '' })
  const [aiOutput, setAiOutput] = useState(null)
  const [llmBusy, setLlmBusy] = useState(false)
  const [llmCalls, setLlmCalls] = useState(0)
  const [serverEnabled, setServerEnabled] = useState(false)
  const [canServerSave, setCanServerSave] = useState(false)
  const [profileReady, setProfileReady] = useState(false)
  const saveTimerRef = useRef(null)

  useEffect(() => {
    hydrateAeoProfileFromApi().then((hydrated) => {
      setProfile(hydrated.profile)
      setKeywordsInput((hydrated.profile?.keywords || []).join(', '))
      setServerEnabled(hydrated.serverEnabled)
      setCanServerSave(hydrated.canServerSave)
      setProfileReady(true)

      if (hydrated.serverEnabled && hydrated.canServerSave) {
        if (hydrated.mergedFromSession) {
          saveAeoProfileToServer(hydrated.profile).then((res) => {
            if (res.ok) clearAeoSessionStorage()
          })
        }
      }
    })
  }, [])

  useEffect(() => {
    Promise.all([
      fetch('/api/kpis').then((r) => r.json()).catch(() => null),
      fetch('/api/leads').then((r) => r.json()).catch(() => ({ leads: [] })),
    ]).then(([k, l]) => {
      setKpis(k)
      setLeads(l?.leads || [])
    })
  }, [])

  const flushServerSave = async (nextProfile) => {
    if (!serverEnabled || !canServerSave) {
      saveAeoProfile(nextProfile)
      return
    }
    const res = await saveAeoProfileToServer(nextProfile)
    if (res.ok) {
      clearAeoSessionStorage()
    } else if (res.status === 404 || res.status === 401) {
      saveAeoProfile(nextProfile)
      toast.error('Saved locally — sign in with bridge enabled to sync to server')
    } else {
      toast.error(res.body?.message || res.body?.error || 'Could not save profile to server')
      saveAeoProfile(nextProfile)
    }
  }

  const scheduleServerSave = (nextProfile) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => flushServerSave(nextProfile), 800)
  }

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [])

  const recommendations = useMemo(
    () => buildRuleRecommendations(profile || {}, kpis, leads),
    [profile, kpis, leads]
  )

  const checklist = useMemo(
    () => checklistProgress(profile || {}, kpis),
    [profile, kpis]
  )

  const persist = (next) => {
    setProfile(next)
    if (serverEnabled && canServerSave) {
      scheduleServerSave(next)
    } else {
      saveAeoProfile(next)
    }
  }

  if (!profileReady || !profile) {
    return (
      <div className="text-sm text-muted-foreground py-4">Loading AEO profile…</div>
    )
  }

  const updateField = (key, value) => {
    persist({ ...profile, [key]: value })
  }

  const toggleArea = (area) => {
    const set = new Set(profile.serviceAreas || [])
    if (set.has(area)) set.delete(area)
    else set.add(area)
    persist({ ...profile, serviceAreas: [...set] })
  }

  const saveKeywords = () => {
    persist({ ...profile, keywords: parseKeywordsInput(keywordsInput) })
    toast.success('Keywords saved')
  }

  const addFaq = () => {
    if (!faqDraft.question.trim() || !faqDraft.answer.trim()) {
      toast.error('FAQ question and answer required')
      return
    }
    const faqs = [...(profile.faqs || []), { ...faqDraft }]
    persist({ ...profile, faqs })
    setFaqDraft({ question: '', answer: '' })
    toast.success('FAQ added')
  }

  const throttleLlm = () => {
    const max = defaultsConfig.llmCallsPerHour ?? 10
    if (llmCalls >= max) {
      toast.error(`LLM limit (${max}/hour) — try again later`)
      return false
    }
    setLlmCalls((n) => n + 1)
    return true
  }

  const runPrompt = async (promptId, context, label) => {
    if (!throttleLlm()) return
    setLlmBusy(true)
    toast.loading(label, { id: 'aeo-llm' })
    const res = await invokeAeoPrompt(promptId, context)
    setLlmBusy(false)
    if (!res.ok) {
      toast.error(res.error || 'Generation failed', { id: 'aeo-llm' })
      return
    }
    setAiOutput({ promptId, data: res.data })
    toast.success('Generated — verify before publishing', { id: 'aeo-llm' })
  }

  const suggestFaqs = () =>
    runPrompt('faq-suggestions', { profile: JSON.stringify(profile, null, 2) }, 'Suggesting FAQs…')

  const improveDescription = () =>
    runPrompt('description-improve', {
      category: profile.category,
      keywords: (profile.keywords || []).join(', '),
      description: profile.descriptionLong || profile.descriptionShort,
    }, 'Improving description…')

  const applyAiFaqs = () => {
    const faqs = aiOutput?.data?.faqs
    if (!Array.isArray(faqs)) return
    persist({ ...profile, faqs: [...(profile.faqs || []), ...faqs] })
    toast.success(`Added ${faqs.length} suggested FAQs`)
  }

  const copyAiText = () => {
    const text = JSON.stringify(aiOutput?.data, null, 2)
    navigator.clipboard?.writeText(text)
    toast.success('Copied to clipboard')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs tracking-widest text-muted-foreground uppercase flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI GROWTH ENGINE · AEO INTELLIGENCE
          </p>
          {!compact && (
            <h2 className="font-display text-xl font-bold mt-1">Answer engine readiness</h2>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            {serverEnabled && canServerSave
              ? 'Profile saved to your account — syncs across browsers.'
              : serverEnabled
                ? 'Profile loaded from server; saves stay in this browser until WEB_JWT_BRIDGE is enabled.'
                : 'Profile saved in this browser session. Verify AI output before publishing.'}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => setPanelOpen((o) => !o)}
        >
          {panelOpen ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
          {panelOpen ? 'Hide profile' : 'Improve profile'}
        </Button>
      </div>

      <AeoKpiRow profile={profile} kpis={kpis} compact={compact} />

      {panelOpen && (
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-5 space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              {fieldsConfig.fields.map((f) => (
                <div key={f.key} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                  <Label>{f.label}</Label>
                  {f.type === 'textarea' ? (
                    <Textarea
                      rows={f.rows || 3}
                      className="mt-1.5"
                      value={profile[f.key] || ''}
                      onChange={(e) => updateField(f.key, e.target.value)}
                    />
                  ) : (
                    <Input
                      type={f.type === 'url' ? 'url' : f.type === 'tel' ? 'tel' : 'text'}
                      className="mt-1.5"
                      value={profile[f.key] || ''}
                      onChange={(e) => updateField(f.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>

            <div>
              <Label>{fieldsConfig.serviceAreasLabel}</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {TERRITORY_OPTIONS.map((t) => {
                  const active = (profile.serviceAreas || []).includes(t)
                  return (
                    <Badge
                      key={t}
                      variant={active ? 'default' : 'outline'}
                      className="cursor-pointer rounded-full"
                      onClick={() => toggleArea(t)}
                    >
                      {t}
                    </Badge>
                  )
                })}
              </div>
            </div>

            <div>
              <Label>{fieldsConfig.keywordsLabel}</Label>
              <div className="flex gap-2 mt-1.5">
                <Input value={keywordsInput} onChange={(e) => setKeywordsInput(e.target.value)} />
                <Button variant="outline" onClick={saveKeywords}>Save</Button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={profile.whatsappConfigured}
                onCheckedChange={(v) => updateField('whatsappConfigured', v)}
              />
              <Label>WhatsApp opt-in messaging configured</Label>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <Label>Review count (manual)</Label>
                <Input
                  type="number"
                  className="mt-1.5"
                  value={profile.reviews?.count ?? 0}
                  onChange={(e) =>
                    persist({
                      ...profile,
                      reviews: { ...profile.reviews, count: Number(e.target.value) },
                    })
                  }
                />
              </div>
              <div>
                <Label>Average rating</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  className="mt-1.5"
                  value={profile.reviews?.averageRating ?? 0}
                  onChange={(e) =>
                    persist({
                      ...profile,
                      reviews: { ...profile.reviews, averageRating: Number(e.target.value) },
                    })
                  }
                />
              </div>
              <div>
                <Label>Pending replies</Label>
                <Input
                  type="number"
                  className="mt-1.5"
                  value={profile.reviews?.pendingReplies ?? 0}
                  onChange={(e) =>
                    persist({
                      ...profile,
                      reviews: { ...profile.reviews, pendingReplies: Number(e.target.value) },
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label>{fieldsConfig.faqsLabel}</Label>
              <div className="grid sm:grid-cols-2 gap-3 mt-1.5">
                <Input
                  placeholder="Question"
                  value={faqDraft.question}
                  onChange={(e) => setFaqDraft({ ...faqDraft, question: e.target.value })}
                />
                <Input
                  placeholder="Answer"
                  value={faqDraft.answer}
                  onChange={(e) => setFaqDraft({ ...faqDraft, answer: e.target.value })}
                />
              </div>
              <Button variant="outline" size="sm" className="mt-2 rounded-full" onClick={addFaq}>
                Add FAQ
              </Button>
              {(profile.faqs || []).length > 0 && (
                <ul className="mt-3 text-sm space-y-1 text-muted-foreground">
                  {profile.faqs.map((f, i) => (
                    <li key={i}>Q: {f.question}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                className="rounded-full"
                disabled={llmBusy}
                onClick={suggestFaqs}
              >
                <Wand2 className="h-4 w-4 mr-1" /> Suggest FAQs
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                disabled={llmBusy}
                onClick={improveDescription}
              >
                <RefreshCw className="h-4 w-4 mr-1" /> Improve description
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                disabled={llmBusy}
                onClick={() =>
                  runPrompt('gbp-post', { profile: JSON.stringify(profile, null, 2) }, 'Generating post…')
                }
              >
                GBP post draft
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-5">
            <div className="text-xs tracking-widest text-muted-foreground mb-2">CHECKLIST</div>
            <ul className="space-y-2 text-sm">
              {checklist.map((item) => (
                <li key={item.id} className="flex items-start gap-2">
                  <ChevronRight
                    className={`h-4 w-4 mt-0.5 shrink-0 ${item.done ? 'text-emerald-400' : 'text-muted-foreground'}`}
                  />
                  <span className={item.done ? 'text-foreground' : 'text-muted-foreground'}>
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-5">
            <div className="text-xs tracking-widest text-muted-foreground mb-2">AI GROWTH RECOMMENDATIONS</div>
            {recommendations.length === 0 ? (
              <p className="text-sm text-muted-foreground">Profile looks strong — keep monitoring KPIs.</p>
            ) : (
              <div className="space-y-4">
                {recommendations.map((group) => (
                  <div key={group.category}>
                    <div className="text-xs font-medium text-primary mb-1">{group.category}</div>
                    <ul className="text-sm space-y-1">
                      {group.items.map((item, i) => (
                        <li key={i} className="flex gap-2">
                          <ChevronRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {aiOutput && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="font-display font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI output · {aiOutput.promptId}
              </div>
              <div className="flex gap-2">
                {aiOutput.promptId === 'faq-suggestions' && (
                  <Button size="sm" variant="outline" onClick={applyAiFaqs}>Apply FAQs</Button>
                )}
                <Button size="sm" variant="ghost" onClick={copyAiText}>
                  <Copy className="h-4 w-4 mr-1" /> Copy
                </Button>
              </div>
            </div>
            <pre className="text-xs overflow-auto max-h-48 whitespace-pre-wrap text-muted-foreground">
              {JSON.stringify(aiOutput.data, null, 2)}
            </pre>
            <p className="text-xs text-muted-foreground mt-2">Verify before publishing to any channel.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
