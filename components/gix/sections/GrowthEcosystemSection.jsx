import { Card, CardContent } from '@/components/ui/card'
import Reveal from '@/components/site/Reveal'

const items = [
  'LeadEdge360',
  'RetailEdge360',
  'AI Analytics',
  'Growth Automation',
  'Digital Experience',
  'Business Consulting'
]

export default function GrowthEcosystemSection() {
  return (
    <section className="container py-24">

      <Reveal>
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            Growth Intelligence Platform
          </h2>
        </div>
      </Reveal>

      <div className="grid md:grid-cols-3 gap-6 mt-14">
        {items.map((item) => (
          <Card key={item} className="bg-card border-border shadow-sm">
            <CardContent className="p-8 text-center font-medium">
              {item}
            </CardContent>
          </Card>
        ))}
      </div>

    </section>
  )
}
