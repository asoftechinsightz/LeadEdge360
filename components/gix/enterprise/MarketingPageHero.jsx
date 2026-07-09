'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { FadeIn } from '@/components/gix/enterprise/primitives'

export default function MarketingPageHero({
  eyebrow,
  title,
  accent,
  description,
  ctaHref,
  ctaLabel,
  secondaryHref,
  secondaryLabel,
  children,
}) {
  return (
    <section className="relative overflow-hidden bg-[#030712] text-white border-b border-white/5">
      <div className="absolute inset-0 gix-aurora opacity-40 pointer-events-none" aria-hidden />
      <div className="absolute inset-0 gix-hero-grid opacity-30 pointer-events-none" aria-hidden />
      <div className="container relative py-20 lg:py-28">
        <FadeIn priority className="max-w-4xl mx-auto text-center">
          {eyebrow && (
            <p className="inline-flex items-center px-4 py-1.5 rounded-full border border-violet-500/40 bg-violet-500/10 text-violet-200 text-xs font-semibold uppercase tracking-[0.18em] mb-6">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl leading-tight text-white">
            {title}
            {accent && (
              <span className="block mt-2 bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {accent}
              </span>
            )}
          </h1>
          {description && (
            <p className="mt-6 text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              {description}
            </p>
          )}
          {(ctaHref || secondaryHref) && (
            <div className="flex flex-wrap justify-center gap-4 mt-10">
              {ctaHref && (
                <Link
                  href={ctaHref}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 hover:from-violet-500 hover:via-blue-500 hover:to-cyan-400 text-white px-8 py-3 text-sm font-medium transition-all shadow-lg shadow-violet-500/20"
                >
                  {ctaLabel || 'Get started'}
                  <ArrowRight className="size-4" />
                </Link>
              )}
              {secondaryHref && (
                <Link
                  href={secondaryHref}
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 hover:bg-white/10 text-white px-8 py-3 text-sm font-medium transition-colors"
                >
                  {secondaryLabel || 'Learn more'}
                </Link>
              )}
            </div>
          )}
          {children}
        </FadeIn>
      </div>
    </section>
  )
}

export function MarketingPageCTA({ title, description }) {
  return (
    <section className="container pb-24">
      <FadeIn>
        <div className="gix-premium-dark-band gix-glow rounded-3xl p-10 md:p-14 text-center max-w-4xl mx-auto border border-white/10">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white">{title}</h2>
          {description && (
            <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">{description}</p>
          )}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link
              href="/book-demo"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white px-8 py-3 text-sm font-medium transition-colors shadow-lg shadow-violet-500/20"
            >
              Book a Demo
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 hover:bg-white/20 text-white px-8 py-3 text-sm font-medium transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </FadeIn>
    </section>
  )
}
