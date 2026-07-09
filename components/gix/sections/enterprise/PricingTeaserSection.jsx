import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SectionHeader, FadeIn } from '@/components/gix/enterprise/primitives'
import { Button } from '@/components/ui/button'
import PricingShowcase from '@/components/marketing/PricingShowcase'

export default function PricingTeaserSection() {
  return (
    <section className="py-24 lg:py-32 border-t border-white/5">
      <div className="container">
        <FadeIn>
          <SectionHeader
            eyebrow="Pricing"
            title="Affordable plans for Indian businesses"
            description="RetailEdge360 from ₹2,999/month · LeadEdge360 from ₹14,999/month · Business Suite ₹16,999/month. Trinetra360 is priced separately for enterprise."
            className="text-white [&_p]:text-slate-400"
          />
        </FadeIn>
        <FadeIn delay={0.1}>
          <PricingShowcase compact showTrinetraNote />
          <div className="text-center mt-10">
            <Button asChild className="rounded-full bg-[#0066FF] hover:bg-[#00C6FF]">
              <Link href="/pricing">
                View full pricing & comparison
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
