'use client'

import Link from 'next/link'
import { ArrowRight, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FadeIn } from '@/components/gix/enterprise/primitives'

export default function EnterpriseCTASection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="container">
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl gix-premium-dark-band gix-glow p-10 md:p-16 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-blue-500/15 pointer-events-none" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-xs text-violet-200 mb-6">
                <Rocket className="size-3.5" /> Razorpay-ready · DPDP compliant · Enterprise-ready
              </div>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                Ready to transform your business?
              </h2>
              <p className="mt-4 text-lg text-slate-300">
                Book a demo to see how RetailEdge360, LeadEdge360, or Trinetra360 fits your operations — transparent pricing, no fabricated claims.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-10">
                <Button asChild size="lg" className="rounded-full px-10 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white shadow-lg shadow-violet-500/25 border-0">
                  <Link href="/book-demo">
                    Book a Demo
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full px-10 border-white/25 bg-white/10 text-white hover:bg-white/20">
                  <Link href="/signup">Start Free Trial</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full px-10 border-white/25 bg-white/10 text-white hover:bg-white/20">
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
