import SiteShell from '@/components/site/SiteShell'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import MarketingPageHero from '@/components/gix/enterprise/MarketingPageHero'
import { FadeIn } from '@/components/gix/enterprise/primitives'

export const metadata = { title: 'Terms of Service — AsoftechInsightz' }

export default function Terms() {
  return (
    <SiteShell>
      <MarketingPageHero
        eyebrow="Legal"
        title="Terms of Service"
        description="Last updated: June 13, 2025. Agreement governing use of LeadEdge360, RetailEdge360, and related services."
      />

      <section className="container pb-24 max-w-3xl">
        <FadeIn>
          <Card className="glass border-white/10">
            <CardContent className="p-8 md:p-12">
              <Section title="1. Agreement">By creating an account you agree to these Terms and our <Link href="/privacy" className="text-[hsl(var(--brand-electric))] hover:underline">Privacy Policy</Link>. If you are using the Service on behalf of an organisation, you represent that you are authorised to bind that organisation.</Section>
              <Section title="2. The Service">AsoftechInsightz provides the LeadEdge360 and RetailEdge360 SaaS products and related APIs (“Service”). We may update or modify the Service at our discretion.</Section>
              <Section title="3. Subscriptions & billing">Paid plans are billed monthly in advance via Razorpay. All fees are in INR and exclusive of taxes. You may cancel at any time; cancellation takes effect at the end of the current billing cycle.</Section>
              <Section title="4. Customer data">You retain all rights to data you upload. We process it on your instructions, store it in a tenant isolated workspace, and never sell it. You are responsible for ensuring you have lawful basis to process the personal data of your leads / customers.</Section>
              <Section title="5. Acceptable use">No spam, no unsolicited bulk WhatsApp / email, no illegal content, no scraping, no resale of the Service. We may suspend accounts that violate these rules.</Section>
              <Section title="6. SLAs & availability">We target 99.5% monthly uptime on the Growth plan, 99.95% on Scale. Refer to your subscription agreement for binding SLAs.</Section>
              <Section title="7. Termination">Either party may terminate with 30 days notice. Upon termination we will provide a 30-day export window; thereafter your data will be deleted per the Privacy Policy.</Section>
              <Section title="8. Governing law">These Terms are governed by the laws of India. Courts in Noida, Uttar Pradesh shall have exclusive jurisdiction.</Section>
              <Section title="9. Contact">Questions? <a href="mailto:enquiry@asoftechinsightz.com" className="text-[hsl(var(--brand-electric))] hover:underline">enquiry@asoftechinsightz.com</a> · +91-7307911405 · Noida, India</Section>
            </CardContent>
          </Card>
        </FadeIn>
      </section>
    </SiteShell>
  )
}

function Section({ title, children }) {
  return (
    <section className="mt-8 first:mt-0">
      <h2 className="font-display font-semibold text-2xl mb-2 text-foreground">{title}</h2>
      <p className="text-muted-foreground leading-relaxed">{children}</p>
    </section>
  )
}
