import SiteShell from '@/components/site/SiteShell'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import MarketingPageHero from '@/components/gix/enterprise/MarketingPageHero'
import { FadeIn } from '@/components/gix/enterprise/primitives'

export const metadata = { title: 'Privacy Policy — AsoftechInsightz' }

export default function Privacy() {
  const updated = 'June 13, 2025'
  return (
    <SiteShell>
      <MarketingPageHero
        eyebrow="Privacy & DPDP Notice"
        title="Privacy Policy"
        description={`Last updated: ${updated}. How we collect, use, and protect personal data under the Digital Personal Data Protection Act, 2023.`}
      />

      <section className="container pb-24 max-w-3xl">
        <FadeIn>
          <Card className="glass border-white/10">
            <CardContent className="p-8 md:p-12">
              <Section title="1. About this notice">
                AsoftechInsightz Pvt. Ltd. (“<strong>we</strong>”, “<strong>us</strong>”, “<strong>our</strong>”) is the data fiduciary for personal data processed via this website and our SaaS products LeadEdge360 and RetailEdge360. This notice describes how we collect, use, share and protect your personal data in accordance with the <strong>Digital Personal Data Protection Act, 2023</strong> (“<strong>DPDP Act</strong>”) and applicable rules.
              </Section>
              <Section title="2. Data we process">
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Identification</strong> — name, email, profile picture (via Google sign-in)</li>
                  <li><strong>Usage</strong> — device, IP, browser, pages visited, feature interactions</li>
                  <li><strong>Customer-data inside the product</strong> — lead records, contact details, retail SKUs you upload; processed solely on your instructions as the data principal of your tenant.</li>
                  <li><strong>Billing</strong> — plan, invoices (processed via Razorpay)</li>
                </ul>
              </Section>
              <Section title="3. Lawful basis & purpose">
                We process personal data on the basis of your <strong>explicit consent</strong> obtained at sign-up, for the following specified purposes: account creation, service delivery, security &amp; fraud-prevention, product improvement, customer support, billing, and (only if you opt-in) marketing.
              </Section>
              <Section title="4. Your DPDP rights">
                You may exercise the following rights at any time by writing to <a href="mailto:enquiry@asoftechinsightz.com" className="text-[hsl(var(--brand-electric))] hover:underline">enquiry@asoftechinsightz.com</a>:
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>Right to access &amp; obtain a copy of your personal data</li>
                  <li>Right to correction, completion, updating</li>
                  <li>Right to erasure (“right to be forgotten”)</li>
                  <li>Right to nominate</li>
                  <li>Right to grievance redressal</li>
                  <li>Right to <strong>withdraw consent</strong> at any time (with no effect on lawfulness of prior processing)</li>
                </ul>
              </Section>
              <Section title="5. Retention">
                We retain personal data only as long as necessary for the purposes notified, or as required by law. Upon withdrawal of consent or closure of your account, we delete or anonymise your personal data within <strong>30 days</strong>, except where retention is required by law (e.g. tax, audit).
              </Section>
              <Section title="6. Processors & cross-border transfers">
                We use the following processors: <strong>MongoDB Atlas</strong> (hosting), <strong>Emergent</strong> (authentication &amp; LLM), <strong>Razorpay</strong> (payments), <strong>Meta &amp; Google</strong> (lead-ads ingestion if connected). Transfers outside India are governed by contractual safeguards aligned with DPDP s.16.
              </Section>
              <Section title="7. Security">
                We maintain reasonable security safeguards: TLS in transit, encryption at rest, role-based access, audit logging, tenant isolation. We notify the Data Protection Board and impacted users within statutory timelines in the event of a personal data breach.
              </Section>
              <Section title="8. Grievance officer">
                <div>For DPDP-related questions or complaints, our Grievance Officer:</div>
                <div className="mt-2 rounded-lg border border-white/10 p-3 gix-glass">
                  <div>Name: <strong>Grievance Officer, AsoftechInsightz Pvt. Ltd.</strong></div>
                  <div>Email: <a href="mailto:enquiry@asoftechinsightz.com" className="text-[hsl(var(--brand-electric))] hover:underline">enquiry@asoftechinsightz.com</a></div>
                  <div>Phone: +91-7307911405</div>
                  <div>Address: Noida, India</div>
                </div>
              </Section>
              <Section title="9. Changes">
                We will update this policy from time to time. Material changes will be notified by email or in-product banner at least 7 days before they take effect.
              </Section>
              <p className="mt-10 text-sm text-muted-foreground">See also: <Link href="/terms" className="text-[hsl(var(--brand-electric))] hover:underline">Terms of Service</Link></p>
            </CardContent>
          </Card>
        </FadeIn>
      </section>
    </SiteShell>
  )
}

function Section({ title, children }) {
  return (
    <section className="mt-9 first:mt-0">
      <h2 className="font-display font-semibold text-2xl mb-2 text-foreground">{title}</h2>
      <div className="text-muted-foreground leading-relaxed">{children}</div>
    </section>
  )
}
