import SiteShell from '@/components/site/SiteShell'
import { Card, CardContent } from '@/components/ui/card'
import MarketingPageHero, { MarketingPageCTA } from '@/components/gix/enterprise/MarketingPageHero'
import { FadeIn } from '@/components/gix/enterprise/primitives'

const benefits = [
  'Recurring revenue share',
  'Enterprise deal support',
  'Co-branded marketing kits',
  'Partner certification',
  'Dedicated partner success',
  'AI Workforce enablement',
]

export default function PartnersPage() {
  return (
    <SiteShell>
      <MarketingPageHero
        eyebrow="Partner Program"
        title="Sell enterprise AI."
        accent="Earn every month."
        description="Join our partner ecosystem and deliver LeadEdge360, AI Workforce, and growth intelligence to your clients."
      />

      <section className="container pb-16">
        <FadeIn>
          <Card className="glass border-white/10">
            <CardContent className="p-10">
              <h2 className="font-display text-2xl font-bold text-center mb-8 text-white">Partner journey</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {['Apply', 'Certify', 'Refer', 'Deploy', 'Earn'].map((step) => (
                  <div key={step} className="gix-glass-dark rounded-xl border border-white/10 p-4 text-center text-sm font-medium text-slate-200">
                    {step}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </section>

      <section className="container pb-16">
        <div className="grid md:grid-cols-3 gap-4">
          {benefits.map((b, i) => (
            <FadeIn key={b} delay={i * 0.05}>
              <Card className="glass border-white/10">
                <CardContent className="p-6 text-center text-slate-300">{b}</CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="container pb-24 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card className="glass border-white/10 gix-glow">
          <CardContent className="p-10 text-center">
            <h3 className="text-xl font-bold text-white">Business Growth</h3>
            <p className="text-5xl font-bold gradient-text mt-4">20%</p>
            <p className="text-sm text-muted-foreground mt-2">Recurring monthly commission</p>
          </CardContent>
        </Card>
        <Card className="glass border-white/10 gix-glow">
          <CardContent className="p-10 text-center">
            <h3 className="text-xl font-bold text-white">Enterprise</h3>
            <p className="text-5xl font-bold gradient-text mt-4">25%</p>
            <p className="text-sm text-muted-foreground mt-2">Recurring monthly commission</p>
          </CardContent>
        </Card>
      </section>

      <MarketingPageCTA
        title="Become a growth partner"
        description="Help enterprises adopt Agentic AI while building predictable recurring income."
      />
    </SiteShell>
  )
}
