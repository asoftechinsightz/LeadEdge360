import Reveal from '@/components/site/Reveal'

const steps = [
  'Traffic Sources',
  'Growth Audit',
  'LeadEdge360',
  'AI Scoring',
  'Revenue Growth'
]

export default function GrowthJourneySection() {
  return (
    <section className="container py-24">

      <Reveal>
        <div className="text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            Growth Intelligence Architecture
          </h2>
        </div>
      </Reveal>

      <div className="grid md:grid-cols-5 gap-6 mt-14">
        {steps.map((step, index) => (
          <div
            key={step}
            className="border border-border rounded-xl p-8 text-center bg-card shadow-sm"
          >
            <div className="text-primary text-sm">
              STEP {index + 1}
            </div>

            <div className="text-xl font-semibold mt-2">
              {step}
            </div>
          </div>
        ))}
      </div>

    </section>
  )
}
