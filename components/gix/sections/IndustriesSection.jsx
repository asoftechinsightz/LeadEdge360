import { Card, CardContent } from '@/components/ui/card'
import Reveal from '@/components/site/Reveal'

const industries = [
  {
    name: 'Architecture & Design',
    outcome: 'Generate qualified project opportunities'
  },
  {
    name: 'Real Estate',
    outcome: 'Capture high-intent buyer leads'
  },
  {
    name: 'Financial Services',
    outcome: 'Improve client engagement'
  },
  {
    name: 'Insurance',
    outcome: 'Accelerate customer acquisition'
  },
  {
    name: 'Healthcare',
    outcome: 'Increase patient engagement'
  },
  {
    name: 'Technology',
    outcome: 'Scale demand generation'
  },
  {
    name: 'Professional Services',
    outcome: 'Generate qualified opportunities'
  },
  {
    name: 'Retail & Ecommerce',
    outcome: 'Drive revenue growth'
  }
]

export default function IndustriesSection() {
  return (
    <section className="py-24 bg-secondary/60">

      <div className="container">

        <Reveal>
          <div className="text-center max-w-4xl mx-auto">

            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              Industries We Empower
            </h2>

            <p className="mt-6 text-lg text-muted-foreground">
              Helping organizations accelerate growth,
              improve customer engagement,
              and drive measurable business outcomes.
            </p>

          </div>
        </Reveal>

        <div className="grid md:grid-cols-4 gap-6 mt-14">

          {industries.map((industry) => (
            <Card
              key={industry.name}
              className="border-border bg-card hover:shadow-md transition-shadow"
            >
              <CardContent className="p-8">

                <div className="h-12 w-12 rounded-lg bg-primary/10 mb-6" />

                <h3 className="font-semibold text-lg text-foreground">
                  {industry.name}
                </h3>

                <p className="mt-3 text-sm text-muted-foreground">
                  {industry.outcome}
                </p>

              </CardContent>
            </Card>
          ))}

        </div>

      </div>

    </section>
  )
}
