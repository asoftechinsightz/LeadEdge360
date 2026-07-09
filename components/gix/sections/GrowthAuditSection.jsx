import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Reveal from '@/components/site/Reveal'

const assessments = [
  'Website Presence',
  'Lead Capture Process',
  'Follow-Up Effectiveness',
  'Google Business Profile',
  'Online Reputation',
  'Marketing Performance',
  'Automation Readiness',
  'Revenue Growth Potential'
]

export default function GrowthAuditSection() {
  return (
    <section className="container py-24">
      <Reveal>
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            Discover What's Holding Your Business Back
          </h2>

          <p className="mt-6 text-xl text-muted-foreground">
            Our Business Growth Audit identifies visibility gaps,
            lead leakage, reputation risks and automation opportunities.
          </p>
        </div>
      </Reveal>

      <div className="grid md:grid-cols-4 gap-4 mt-14">
        {assessments.map((item) => (
          <Card key={item} className="bg-card border-border shadow-sm">
            <CardContent className="p-6 text-center">
              {item}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-10">
        <Button asChild size="lg" className="rounded-full px-8 bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href="/growth-audit">Start Free Growth Audit</Link>
        </Button>
      </div>
    </section>
  )
}
