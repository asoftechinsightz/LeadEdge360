import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const posts = [
  { t: 'Why geo-qualified lead routing 3x your conversions', d: 'A deep-dive into territory mapping for Indian field-sales teams.', tag: 'Sales', date: 'Jun 12, 2025' },
  { t: 'AI Lead Scoring: how we score every lead in <2 seconds', d: 'Behind the scenes of LeadEdge360’s real-time scoring engine.', tag: 'Engineering', date: 'Jun 5, 2025' },
  { t: 'WhatsApp follow-ups: from 12% to 38% reply rates', d: 'Templates and timings that actually convert in Tier-2 India.', tag: 'Playbook', date: 'May 28, 2025' },
  { t: 'RetailEdge360 sneak peek: RevenueShield AI', d: 'Saving ₹3.6Cr in expiry waste across 240+ pilot stores.', tag: 'Product', date: 'May 14, 2025' },
]

export default function Blog() {
  return (
    <>
      <section className="container py-20">
        <Badge variant="outline" className="rounded-full border-primary/30 text-primary mb-4">Blog</Badge>
        <h1 className="font-display font-bold text-5xl md:text-6xl">Insights &amp; playbooks.</h1>
        <p className="mt-4 text-muted-foreground text-lg">From the AsoftechInsightz team — hand-picked, no fluff.</p>
      </section>
      <section className="container pb-24 grid md:grid-cols-2 gap-5">
        {posts.map(p => (
          <Card key={p.t} className="bg-card/60 border-border/60 hover:border-primary/40 transition cursor-pointer">
            <CardContent className="p-7">
              <div className="flex items-center gap-3 text-xs text-muted-foreground"><Badge variant="outline" className="rounded-full">{p.tag}</Badge>{p.date}</div>
              <div className="mt-4 font-display text-2xl font-semibold leading-snug">{p.t}</div>
              <p className="mt-2 text-muted-foreground">{p.d}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </>
  )
}
