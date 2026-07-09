'use client'

import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import MarketingPageHero from '@/components/gix/enterprise/MarketingPageHero'
import { FadeIn, GlassCard, SectionHeader } from '@/components/gix/enterprise/primitives'
import MarketingLeadForm from '@/components/marketing/MarketingLeadForm'
import ProductExperienceSection from '@/components/gix/three/ProductExperienceSection'
import { DeviceMockup, DeviceShowcase } from '@/components/marketing/DeviceMockup'
import { TrustStrip } from '@/components/enterprise/TrustBadges'

import { PRODUCT_GALLERY, PRODUCT_SCREENSHOTS } from '@/lib/marketing-content'

export default function ProductMarketingPage({ product }) {
  const isLead = product.id === 'leadedge360'
  const dashboardImg = isLead ? PRODUCT_SCREENSHOTS.leadedge360 : PRODUCT_SCREENSHOTS.retailedge360
  const gallery = PRODUCT_GALLERY[product.id] || []
  const glow = isLead ? 'cyan' : 'orange'

  return (
    <>
      <MarketingPageHero
        eyebrow={product.name}
        title={isLead ? 'AI-Powered Sales, CRM &' : 'AI Retail'}
        accent={isLead ? 'Marketing Automation' : 'Operating System'}
        description={product.tagline}
        ctaHref={product.demoHref}
        ctaLabel="Book a Demo"
        secondaryHref={product.suiteHref || '/signup'}
        secondaryLabel="Start Free Trial"
      />
      <TrustStrip />

      <ProductExperienceSection
        scene={isLead ? 'crm' : 'retail'}
        eyebrow="Interactive experience"
        title={isLead ? 'From lead capture to loyal customer' : 'Digitize every aspect of your retail business'}
        description={
          isLead
            ? 'Follow the AI-assisted sales pipeline — website leads, CRM, proposals, and repeat revenue in one flow.'
            : 'Smart billing, inventory intelligence, barcode workflows, and GST-ready operations in a unified retail command center.'
        }
      />

      <section className="container pb-20">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <FadeIn>
            <DeviceShowcase src={dashboardImg} alt={`${product.name} dashboard`} glow={glow} />
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="font-display text-2xl font-bold mb-4 text-white">Platform highlights</h2>
            <ul className="grid sm:grid-cols-2 gap-3">
              {product.highlights.map((h) => (
                <li key={h} className="flex items-center gap-2 text-sm text-slate-400">
                  <Check className="size-4 text-cyan-400 shrink-0" />
                  {h}
                </li>
              ))}
            </ul>
            <Button asChild className="rounded-full mt-8 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0">
              <Link href={product.demoHref}>
                Explore {product.name} <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </FadeIn>
        </div>
      </section>

      <section className="container pb-20">
        <FadeIn>
          <SectionHeader eyebrow="Modules" title="Everything you need in one product" align="left" />
        </FadeIn>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {product.modules.map((mod, i) => (
            <FadeIn key={mod} delay={i * 0.04}>
              <GlassCard className="p-5 text-sm font-medium text-slate-200">{mod}</GlassCard>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="container pb-20">
        <FadeIn>
          <SectionHeader eyebrow="Screenshots" title="Real application views" align="left" />
        </FadeIn>
        <div className="grid sm:grid-cols-2 gap-8">
          {(gallery.length ? gallery : [{ label: 'Dashboard', src: dashboardImg }]).map((shot, i) => (
            <FadeIn key={shot.label} delay={i * 0.06}>
              <p className="text-sm font-medium mb-3 text-slate-400">{shot.label}</p>
              <DeviceMockup
                src={shot.src}
                alt={`${product.name} — ${shot.label}`}
                device={i % 2 === 0 ? 'laptop' : 'tablet'}
                glow={glow}
                float={false}
              />
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="container pb-24">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <FadeIn>
            <SectionHeader
              eyebrow="Get started"
              title={`See ${product.name} in action`}
              description="Book a personalized demo or start your free trial today."
              align="left"
            />
          </FadeIn>
          <FadeIn delay={0.1}>
            <MarketingLeadForm product={product.id} />
          </FadeIn>
        </div>
      </section>
    </>
  )
}
