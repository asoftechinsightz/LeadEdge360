'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { KNOWLEDGE_TOPICS } from '@/lib/marketing-content'
import { SectionHeader, GlassCard, FadeIn } from '@/components/gix/enterprise/primitives'

export default function KnowledgeCenterSection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="container">
        <FadeIn>
          <SectionHeader
            eyebrow="Knowledge Center"
            title="Insights for AI-driven growth"
            description="SEO-optimized guides on sales, retail intelligence, and digital transformation for SMEs."
          />
        </FadeIn>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {KNOWLEDGE_TOPICS.map((topic, i) => (
            <FadeIn key={topic.title} delay={i * 0.05}>
              <Link href={topic.href}>
                <GlassCard className="p-6 h-full group hover:gix-glow transition-shadow flex items-center justify-between gap-3">
                  <span className="font-medium">{topic.title}</span>
                  <ArrowRight className="size-4 text-muted-foreground group-hover:text-[hsl(var(--brand-electric))] transition-colors" />
                </GlassCard>
              </Link>
            </FadeIn>
          ))}
        </div>
        <FadeIn delay={0.2}>
          <div className="text-center mt-10">
            <Link href="/blog" className="text-sm text-[hsl(var(--brand-electric))] hover:underline">
              View all articles →
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
