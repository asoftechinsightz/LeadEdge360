'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShieldCheck, X } from 'lucide-react'
import { COOKIE_CONSENT_VERSION } from '@/lib/consent-versions'

const STORAGE_KEY = `cookie_consent_v${COOKIE_CONSENT_VERSION}`

export default function DpdpConsentBanner() {
  const [show, setShow] = useState(false)
  const [details, setDetails] = useState(false)
  const [prefs, setPrefs] = useState({ essential: true, analytics: false, performance: false, marketing: false })

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!localStorage.getItem(STORAGE_KEY)) setShow(true)
  }, [])

  const persist = (decision) => {
    const payload = {
      ...prefs,
      ...decision,
      essential: true,
      acceptedAt: new Date().toISOString(),
      version: COOKIE_CONSENT_VERSION,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    fetch('/api/privacy/cookie-consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {})
    setShow(false)
  }

  if (!show) return null
  return (
    <div className="fixed inset-x-3 bottom-3 md:inset-x-auto md:right-5 md:bottom-5 md:max-w-md z-[60]">
      <div className="glass rounded-2xl border border-primary/30 p-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/15 text-primary grid place-items-center shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="font-display font-semibold">Cookie & privacy preferences</div>
            <p className="text-sm text-muted-foreground mt-1">
              We use essential cookies for sign-in and security. With your consent, we also use analytics, performance, and marketing cookies. Manage choices anytime in Settings → Privacy & Data. See our{' '}
              <Link href="/cookie-policy" className="text-primary hover:underline">Cookie Policy</Link>.
            </p>

            {details && (
              <div className="mt-3 space-y-2 text-sm rounded-lg border border-border/40 p-3 bg-background/40">
                <Row label="Essential" desc="Required for sign-in, sessions, and core features." disabled checked />
                <Row label="Analytics" desc="Usage metrics to improve the product." checked={prefs.analytics} onChange={(v) => setPrefs((p) => ({ ...p, analytics: v }))} />
                <Row label="Performance" desc="Helps us monitor speed and reliability." checked={prefs.performance} onChange={(v) => setPrefs((p) => ({ ...p, performance: v }))} />
                <Row label="Marketing" desc="Product updates and newsletters (opt-in only)." checked={prefs.marketing} onChange={(v) => setPrefs((p) => ({ ...p, marketing: v }))} />
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" className="rounded-full bg-primary" onClick={() => persist({ analytics: true, performance: true, marketing: false })}>Accept all</Button>
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => persist({ analytics: false, performance: false, marketing: false })}>Reject non-essential</Button>
              {!details
                ? <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setDetails(true)}>Manage preferences</Button>
                : <Button size="sm" variant="ghost" className="rounded-full" onClick={() => persist({})}>Save my choices</Button>
              }
              <Link href="/privacy" className="text-xs text-muted-foreground ml-auto self-center hover:text-primary">Privacy policy →</Link>
            </div>
          </div>
          <button type="button" onClick={() => persist({ analytics: false, performance: false, marketing: false })} className="p-1 text-muted-foreground hover:text-foreground" aria-label="Reject non-essential and close">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, desc, checked, disabled, onChange }) {
  return (
    <label className={`flex items-start gap-3 ${disabled ? 'opacity-70' : 'cursor-pointer'}`}>
      <input type="checkbox" checked={!!checked} disabled={disabled} onChange={(e) => onChange?.(e.target.checked)} className="mt-1 h-4 w-4 rounded border-border accent-primary" />
      <div>
        <div className="text-sm font-medium">{label}{disabled && <span className="ml-1 text-xs text-muted-foreground">(always on)</span>}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </label>
  )
}
