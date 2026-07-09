import SiteShell from '@/components/site/SiteShell'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import MarketingPageHero from '@/components/gix/enterprise/MarketingPageHero'
import { FadeIn } from '@/components/gix/enterprise/primitives'

const posts = [
  { t: 'Agentic AI in enterprise CRM: a 2026 playbook', d: 'How virtual employees change pipeline velocity and executive visibility.', tag: 'AI Workforce', date: 'Jun 2026' },
  { t: 'Pilot to production: VPS certification lessons', d: 'What we learned certifying LeadEdge360 for multi-tenant pilots.', tag: 'Engineering', date: 'Jun 2026' },
  { t: 'Industry profiles: configuring AI for BFSI vs Retail', d: 'Matching agents, approval rules, and confidence thresholds by sector.', tag: 'Product', date: 'May 2026' },
  { t: 'Geo lead finder + AI scoring in the field', d: 'Territory mapping workflows for Indian sales teams.', tag: 'Playbook', date: 'May 2026' },
]

export default function Blog() {
  return (
    <SiteShell>
      <MarketingPageHero
        eyebrow="Insights"
        title="Enterprise growth"
        accent="intelligence briefs"
        description="From the AsoftechInsightz team — AI workforce, CRM, and pilot deployment playbooks."
      />
      <section className="container pb-24 grid md:grid-cols-2 gap-5">
        {posts.map((p, i) => (
          <FadeIn key={p.t} delay={i * 0.06}>
            <Card className="glass border-white/10 hover:gix-glow transition-shadow cursor-pointer h-full">
              <CardContent className="p-7">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <Badge variant="outline" className="rounded-full border-white/20">{p.tag}</Badge>
                  {p.date}
                </div>
                <div className="mt-4 font-display text-xl font-semibold leading-snug text-white">{p.t}</div>
                <p className="mt-2 text-muted-foreground text-sm">{p.d}</p>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </section>
    </SiteShell>
  )
}
