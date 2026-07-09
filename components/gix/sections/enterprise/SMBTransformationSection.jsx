'use client'

import { SMB_TRANSFORMATION_STEPS } from '@/lib/marketing-content'
import { SectionHeader, FadeIn } from '@/components/gix/enterprise/primitives'
import { ArrowDown } from 'lucide-react'

export default function SMBTransformationSection() {
  return (
    <section className="py-24 lg:py-32 bg-secondary/30">
      <div className="container">
        <FadeIn>
          <SectionHeader
            eyebrow="Small Business Growth"
            title="How we help Indian businesses transform"
            description="A practical journey from traditional operations to an AI-powered, observable enterprise — without inventing statistics. Outcomes depend on your industry and rollout scope."
          />
        </FadeIn>

        <div className="max-w-2xl mx-auto mt-12">
          {SMB_TRANSFORMATION_STEPS.map((step, i) => (
            <FadeIn key={step.title} delay={i * 0.06}>
              <div className="relative pl-8 pb-10 border-l-2 border-[hsl(var(--brand-electric))]/30 last:pb-0">
                <div className="absolute -left-[9px] top-0 size-4 rounded-full bg-[hsl(var(--brand-electric))] ring-4 ring-background" />
                <h3 className="font-semibold text-lg text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{step.desc}</p>
                {i < SMB_TRANSFORMATION_STEPS.length - 1 && (
                  <ArrowDown className="size-4 text-muted-foreground/50 mt-4 ml-1" aria-hidden />
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
