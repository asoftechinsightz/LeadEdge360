'use client'

import { TRUSTED_TECH } from '@/lib/marketing-content'
import { FadeIn } from '@/components/gix/enterprise/primitives'

export default function TrustedBySection() {
  return (
    <section className="py-12 border-y border-border/60 bg-white/70 backdrop-blur-sm">
      <div className="container">
        <FadeIn>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground mb-8">
            Trusted by growing businesses · Built on enterprise technology
          </p>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
            {TRUSTED_TECH.map((name) => (
              <span
                key={name}
                className="text-sm md:text-base font-medium text-muted-foreground hover:text-[hsl(var(--brand-electric))] transition-colors"
              >
                {name}
              </span>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
