import { Card, CardContent } from '@/components/ui/card'
import Reveal from '@/components/site/Reveal'

const reasons = [
  'Increase Qualified Leads',
  'Improve Conversion Rates',
  'Accelerate Revenue Growth',
  'Reduce Acquisition Cost',
  'Gain Customer Visibility',
  'Automate Growth Operations'
]

export default function WhyGrowthFailsSection() {
  return (
    <section className="container py-24">

      <Reveal>
        <div className="text-center max-w-4xl mx-auto">

          <h2 className="font-display text-4xl md:text-5xl font-bold">
            Business Outcomes We Deliver
          </h2>

          <p className="mt-6 text-muted-foreground text-lg">
            Delivering measurable business outcomes through
            growth intelligence, automation and data-driven decisions.
          </p>

        </div>
      </Reveal>

      <div className="grid md:grid-cols-3 gap-6 mt-14">
        {reasons.map((item) => (
          <Card key={item} className="bg-card border-border shadow-sm">
            <CardContent className="p-8 text-center">
              <h3 className="font-semibold text-lg">
                {item}
              </h3>
            </CardContent>
          </Card>
        ))}
      </div>

    </section>
  )
}
