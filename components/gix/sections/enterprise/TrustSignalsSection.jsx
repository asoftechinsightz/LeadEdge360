'use client'

import Link from 'next/link'
import { Shield, Lock, CreditCard, Flag } from 'lucide-react'
import { TRUST_SIGNALS } from '@/lib/marketing-content'
import { FadeIn } from '@/components/gix/enterprise/primitives'

const ICONS = {
  'DPDP Act Ready': Shield,
  'SSL / TLS Encryption': Lock,
  'Razorpay Ready': CreditCard,
  'Made for India': Flag,
}

export default function TrustSignalsSection() {
  return (
    <section className="py-16 border-t border-white/5">
      <div className="container">
        <FadeIn>
          <p className="text-center text-xs uppercase tracking-[0.28em] text-slate-500 mb-8">
            Compliance & security
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TRUST_SIGNALS.map((signal) => {
              const Icon = ICONS[signal.label] || Shield
              return (
                <div
                  key={signal.label}
                  className="gix-glass-dark rounded-2xl border border-white/10 p-5 text-center"
                >
                  <Icon className="size-6 text-cyan-400 mx-auto mb-3" />
                  <p className="font-semibold text-white text-sm">{signal.label}</p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{signal.desc}</p>
                </div>
              )
            })}
          </div>
          <p className="text-center text-xs text-slate-500 mt-8 max-w-2xl mx-auto">
            We do not display fake client logos, fabricated revenue figures, or unearned certifications.
            See our{' '}
            <Link href="/privacy" className="text-cyan-400 hover:underline">Privacy Policy</Link>,{' '}
            <Link href="/terms" className="text-cyan-400 hover:underline">Terms</Link>, and{' '}
            <Link href="/pricing" className="text-cyan-400 hover:underline">Pricing</Link>.
          </p>
        </FadeIn>
      </div>
    </section>
  )
}
