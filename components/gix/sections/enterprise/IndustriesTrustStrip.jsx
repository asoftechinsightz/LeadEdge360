'use client'

import Link from 'next/link'
import {
  Store,
  HeartPulse,
  Factory,
  GraduationCap,
  Landmark,
  Briefcase,
  Truck,
  Radio,
} from 'lucide-react'
import { INDUSTRY_STRIP } from '@/lib/marketing-content'
import { FadeIn } from '@/components/gix/enterprise/primitives'

const ICONS = {
  store: Store,
  heart: HeartPulse,
  factory: Factory,
  graduation: GraduationCap,
  landmark: Landmark,
  briefcase: Briefcase,
  truck: Truck,
  radio: Radio,
}

export default function IndustriesTrustStrip() {
  return (
    <section className="py-16 border-y border-white/5 bg-[#050a18]/50">
      <div className="container">
        <FadeIn>
          <p className="text-center text-xs uppercase tracking-[0.28em] text-slate-500 mb-10">
            Trusted by businesses across industries
          </p>
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {INDUSTRY_STRIP.map((industry) => {
              const Icon = ICONS[industry.icon] || Briefcase
              return (
                <Link
                  key={industry.name}
                  href="/industries"
                  className="flex flex-col items-center gap-2 group min-w-[72px]"
                >
                  <div className="size-12 rounded-2xl border border-white/10 bg-white/[0.04] flex items-center justify-center group-hover:border-violet-500/40 group-hover:bg-violet-500/10 transition-all">
                    <Icon className="size-5 text-slate-400 group-hover:text-violet-300 transition-colors" />
                  </div>
                  <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">
                    {industry.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
