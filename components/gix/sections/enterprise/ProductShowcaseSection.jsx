'use client'

import Link from 'next/link'
import { Bot, MapPin, BarChart3, Store, LayoutDashboard, Cpu } from 'lucide-react'
import { SectionHeader, TiltCard, FadeIn } from '@/components/gix/enterprise/primitives'

const PRODUCTS = [
  { id: 'leadedge', name: 'LeadEdge360', desc: 'AI sales, marketing & revenue growth', href: '/products/leadedge360', icon: Bot, color: 'from-blue-600/30 to-cyan-500/20' },
  { id: 'retail', name: 'RetailEdge360', desc: 'AI retail ops & inventory intelligence', href: '/products/retailedge360', icon: Store, color: 'from-orange-500/30 to-amber-400/20' },
  { id: 'workforce', name: 'AI Workforce', desc: '12+ virtual enterprise employees', href: '/leadedge360/command-center', icon: Cpu, color: 'from-violet-600/30 to-purple-400/20' },
  { id: 'geo', name: 'Geo Lead Finder', desc: 'Territory mapping & geo intelligence', href: '/leadedge360/geo-finder', icon: MapPin, color: 'from-emerald-600/30 to-teal-400/20' },
  { id: 'command', name: 'AI Command Center', desc: 'Unified AI operations workspace', href: '/leadedge360/command-center', icon: LayoutDashboard, color: 'from-sky-600/30 to-blue-400/20' },
  { id: 'exec', name: 'Executive Dashboard', desc: 'C-suite growth & revenue briefing', href: '/dashboard', icon: BarChart3, color: 'from-indigo-600/30 to-blue-500/20' },
]

export default function ProductShowcaseSection() {
  return (
    <section className="py-24 lg:py-32 relative">
      <div className="container">
        <FadeIn>
          <SectionHeader
            eyebrow="Our Products"
            title="Two flagship platforms. One AI growth stack."
            description="Interactive demos for LeadEdge360 revenue growth and RetailEdge360 store operations — built as products, not projects."
          />
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCTS.map((p, i) => {
            const Icon = p.icon
            return (
              <FadeIn key={p.id} delay={i * 0.06}>
                <Link href={p.href} className="block h-full">
                  <TiltCard className={`h-full bg-gradient-to-br ${p.color} hover:gix-glow transition-shadow`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2.5 rounded-xl bg-white border border-border">
                        <Icon className="size-5 text-[hsl(var(--brand-electric))]" />
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">3D Module</span>
                    </div>
                    <h3 className="font-semibold text-lg text-foreground">{p.name}</h3>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{p.desc}</p>
                  </TiltCard>
                </Link>
              </FadeIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}
