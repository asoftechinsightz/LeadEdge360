import Image from 'next/image'
import SiteShell from '@/components/site/SiteShell'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, Bot, Radar } from 'lucide-react'
import { BRAND_LOGOS } from '@/lib/brand'
import { FLAGSHIP_PRODUCTS } from '@/lib/marketing-content'
import MarketingPageHero from '@/components/gix/enterprise/MarketingPageHero'
import { FadeIn } from '@/components/gix/enterprise/primitives'

export const metadata = {
  title: 'Products — RetailEdge360, LeadEdge360 & Trinetra360',
  description:
    'Explore the AsoftechInsightz product ecosystem: AI retail, CRM & revenue growth, and enterprise observability.',
}

const LOGOS = {
  retailedge360: BRAND_LOGOS.retailedge360,
  leadedge360: BRAND_LOGOS.leadedge360,
}

const BADGES = {
  retailedge360: { label: 'Live', className: 'bg-orange-500/15 text-orange-700 border-0' },
  leadedge360: { label: 'Live · Enterprise', className: 'bg-emerald-500/15 text-emerald-700 border-0' },
  trinetra360: { label: 'Early Access', className: 'bg-violet-500/15 text-violet-700 border-0' },
}

export default function Products() {
  return (
    <SiteShell>
      <MarketingPageHero
        eyebrow="Products"
        title="Our AI-Powered"
        accent="Product Ecosystem"
        description="RetailEdge360 and LeadEdge360 form the Business Suite. Trinetra360 is our separate enterprise observability platform."
        ctaHref="/book-demo"
        ctaLabel="Book a Demo"
        secondaryHref="/pricing"
        secondaryLabel="View Pricing"
      />

      <section className="container pb-24 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FLAGSHIP_PRODUCTS.map((product, i) => {
          const logo = LOGOS[product.id]
          const badge = BADGES[product.id]
          const isEnterprise = product.id === 'trinetra360'
          return (
            <FadeIn key={product.id} delay={i * 0.06}>
              <Card className={`gix-glass-dark border h-full ${isEnterprise ? 'border-violet-500/30' : 'border-white/10'}`}>
                <CardContent className="p-8 flex flex-col h-full">
                  {logo ? (
                    <Image src={logo} alt={product.name} width={200} height={56} className="h-12 w-auto object-contain mb-3" />
                  ) : (
                    <Radar className="h-10 w-10 text-violet-500 mb-3" />
                  )}
                  <Badge className={badge.className + ' w-fit mb-3'}>{badge.label}</Badge>
                  <p className="text-sm font-medium" style={{ color: product.accent }}>{product.tagline}</p>
                  <h3 className="font-display text-2xl font-bold mt-1 text-white">{product.name}</h3>
                  <p className="mt-2 text-slate-400 text-sm leading-relaxed flex-1">{product.shortDesc || product.message}</p>
                  <Button asChild className="mt-6 rounded-full w-full" style={{ backgroundColor: product.accent }}>
                    <Link href={product.href}>
                      Explore <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </FadeIn>
          )
        })}
      </section>

      <section className="container pb-24">
        <FadeIn>
          <Card className="gix-glass-dark border border-violet-500/20 bg-gradient-to-br from-violet-600/10 via-transparent to-cyan-500/10">
            <CardContent className="p-8 flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex gap-3">
                <Bot className="h-8 w-8 text-violet-400" />
                <Radar className="h-8 w-8 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold text-white">AI Workforce Runtime</h3>
                <p className="mt-2 text-slate-400 max-w-2xl text-sm">
                  12+ virtual employees orchestrated through the agent runtime, platform event bus, and executive observability.
                </p>
              </div>
              <Button asChild className="rounded-full shrink-0 md:ml-auto bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0">
                <Link href="/leadedge360/command-center">AI Command Center</Link>
              </Button>
            </CardContent>
          </Card>
        </FadeIn>
      </section>
    </SiteShell>
  )
}
