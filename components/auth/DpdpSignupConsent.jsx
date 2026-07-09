'use client'

import Link from 'next/link'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { CONSENT_COPY } from '@/lib/consent-versions'

export default function DpdpSignupConsent({
  termsAccepted,
  onTermsAcceptedChange,
  privacyRead,
  onPrivacyReadChange,
  dataProcessingAccepted,
  onDataProcessingChange,
  marketingConsent,
  onMarketingConsentChange,
}) {
  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-widest text-slate-500">Privacy & consent (DPDP Act, 2023)</p>

      <label className="flex items-start gap-3 cursor-pointer">
        <Checkbox
          id="terms-consent"
          checked={termsAccepted}
          onCheckedChange={(v) => onTermsAcceptedChange(!!v)}
          className="mt-0.5"
        />
        <Label htmlFor="terms-consent" className="text-sm text-slate-300 leading-relaxed font-normal cursor-pointer">
          {CONSENT_COPY.termsLabel}{' '}
          <Link href="/terms" className="text-cyan-400 hover:underline" target="_blank">Terms & Conditions</Link>
        </Label>
      </label>

      <label className="flex items-start gap-3 cursor-pointer">
        <Checkbox
          id="privacy-consent"
          checked={privacyRead}
          onCheckedChange={(v) => onPrivacyReadChange(!!v)}
          className="mt-0.5"
        />
        <Label htmlFor="privacy-consent" className="text-sm text-slate-300 leading-relaxed font-normal cursor-pointer">
          {CONSENT_COPY.privacyLabel}{' '}
          <Link href="/privacy" className="text-cyan-400 hover:underline" target="_blank">Privacy Policy</Link>
        </Label>
      </label>

      <label className="flex items-start gap-3 cursor-pointer">
        <Checkbox
          id="data-consent"
          checked={dataProcessingAccepted}
          onCheckedChange={(v) => onDataProcessingChange(!!v)}
          className="mt-0.5"
        />
        <Label htmlFor="data-consent" className="text-sm text-slate-300 leading-relaxed font-normal cursor-pointer">
          {CONSENT_COPY.dataProcessingLabel}
        </Label>
      </label>

      <label className="flex items-start gap-3 cursor-pointer">
        <Checkbox
          id="marketing-consent"
          checked={marketingConsent}
          onCheckedChange={(v) => onMarketingConsentChange(!!v)}
          className="mt-0.5"
        />
        <Label htmlFor="marketing-consent" className="text-sm text-slate-400 leading-relaxed font-normal cursor-pointer">
          {CONSENT_COPY.marketingLabel}
        </Label>
      </label>
    </div>
  )
}
