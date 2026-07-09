'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Building2, Mail, Phone, MapPin, Sparkles } from 'lucide-react'
import MarketingPageHero from '@/components/gix/enterprise/MarketingPageHero'
import { FadeIn, SectionHeader } from '@/components/gix/enterprise/primitives'
import { Button } from '@/components/ui/button'
import {
  ABOUT_NARRATIVE,
  ABOUT_TIMELINE,
  COMPANY,
  COMPANY_LEGAL,
  PLATFORM_OUTCOMES,
} from '@/lib/marketing-content'

export default function AboutPagePremium() {
  return (
    <>
      <MarketingPageHero
        eyebrow="About AsoftechInsightz"
        title="An AI-first company"
        accent="building world-class business software"
        description="We ship RetailEdge360, LeadEdge360, and Trinetra360 — cloud-native platforms for retail operations, customer growth, and enterprise observability. Made in India."
        ctaHref="/book-demo"
        ctaLabel="Book a Demo"
        secondaryHref="/products"
        secondaryLabel="Explore Products"
      />

      <section className="container py-20 grid md:grid-cols-2 gap-8">
        <FadeIn>
          <div className="gix-glass-dark rounded-3xl border border-white/10 p-8 h-full">
            <h2 className="font-display text-2xl font-bold text-violet-300">Mission</h2>
            <p className="text-slate-300 mt-4 leading-relaxed">{ABOUT_NARRATIVE.mission}</p>
          </div>
        </FadeIn>
        <FadeIn delay={0.08}>
          <div className="gix-glass-dark rounded-3xl border border-white/10 p-8 h-full">
            <h2 className="font-display text-2xl font-bold text-cyan-300">Vision</h2>
            <p className="text-slate-300 mt-4 leading-relaxed">{ABOUT_NARRATIVE.vision}</p>
          </div>
        </FadeIn>
      </section>

      <section className="py-20 border-y border-white/5 bg-[#050a18]/60">
        <div className="container">
          <FadeIn>
            <SectionHeader
              eyebrow="Our journey"
              title="Product innovation timeline"
              description="From retail digitization to enterprise observability — a continuous build toward India's AI-powered business future."
              className="text-white [&_p]:text-slate-400"
            />
          </FadeIn>
          <div className="mt-12 max-w-3xl mx-auto relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-violet-500/50 via-cyan-500/30 to-transparent hidden sm:block" />
            <div className="space-y-8">
              {ABOUT_TIMELINE.map((item, i) => (
                <FadeIn key={item.title} delay={i * 0.06}>
                  <motion.div
                    className="relative sm:pl-12"
                    whileInView={{ opacity: 1, x: 0 }}
                    initial={{ opacity: 0, x: -12 }}
                    viewport={{ once: true }}
                  >
                    <div className="hidden sm:block absolute left-2.5 top-1.5 size-3 rounded-full bg-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.6)]" />
                    <p className="text-xs uppercase tracking-widest text-violet-400">{item.year}</p>
                    <h3 className="font-display text-lg font-semibold text-white mt-1">{item.title}</h3>
                    <p className="text-sm text-slate-400 mt-2 leading-relaxed">{item.desc}</p>
                  </motion.div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container py-20">
        <FadeIn>
          <SectionHeader
            eyebrow="Digital India"
            title="SME empowerment & enterprise transformation"
            description={ABOUT_NARRATIVE.digitalIndia}
            className="text-white [&_p]:text-slate-400"
          />
        </FadeIn>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
          {PLATFORM_OUTCOMES.slice(0, 6).map((o, i) => (
            <FadeIn key={o.label} delay={i * 0.04}>
              <div className="gix-glass-dark rounded-2xl border border-white/10 p-5">
                <Sparkles className="size-5 text-violet-400 mb-2" />
                <p className="font-semibold text-white text-sm">{o.label}</p>
                <p className="text-xs text-slate-400 mt-1">{o.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
        <p className="text-center text-sm text-slate-500 mt-8 max-w-2xl mx-auto">{ABOUT_NARRATIVE.founderNote}</p>
      </section>

      <section className="py-20 border-t border-white/5">
        <div className="container">
          <FadeIn>
            <SectionHeader
              eyebrow="Company information"
              title="Transparent business details"
              description="Information for Razorpay merchant verification, enterprise procurement, and Startup India ecosystem programs."
              className="text-white [&_p]:text-slate-400"
            />
          </FadeIn>
          <div className="grid md:grid-cols-2 gap-6 mt-10 max-w-4xl mx-auto">
            <div className="gix-glass-dark rounded-2xl border border-white/10 p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Building2 className="size-5 text-violet-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">{COMPANY_LEGAL.legalName}</p>
                  <p className="text-sm text-slate-400 mt-1">{COMPANY_LEGAL.businessType}</p>
                </div>
              </div>
              <p className="text-sm text-slate-400"><span className="text-slate-300">CIN:</span> {COMPANY_LEGAL.cin}</p>
              <p className="text-sm text-slate-400"><span className="text-slate-300">GSTIN:</span> {COMPANY_LEGAL.gstin}</p>
              <p className="text-sm text-slate-400">{COMPANY_LEGAL.businessModel}</p>
            </div>
            <div className="gix-glass-dark rounded-2xl border border-white/10 p-6 space-y-4">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Mail className="size-4 text-cyan-400" />
                <a href={`mailto:${COMPANY.email}`} className="hover:text-cyan-300">{COMPANY.email}</a>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Phone className="size-4 text-cyan-400" />
                <a href={`tel:${COMPANY.phoneTel}`} className="hover:text-cyan-300">{COMPANY.phone}</a>
              </div>
              <div className="flex items-start gap-3 text-sm text-slate-300">
                <MapPin className="size-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>{COMPANY_LEGAL.registeredAddress}</span>
              </div>
              <p className="text-xs text-slate-500">Support: {COMPANY.supportHours}</p>
              <p className="text-xs text-slate-500">DPDP grievance: {COMPANY_LEGAL.grievanceOfficer} — {COMPANY_LEGAL.grievanceEmail}</p>
            </div>
          </div>
          <div className="text-center mt-10">
            <Button asChild className="rounded-full bg-gradient-to-r from-violet-600 to-blue-600">
              <Link href="/contact">Contact Us <ArrowRight className="ml-2 size-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
