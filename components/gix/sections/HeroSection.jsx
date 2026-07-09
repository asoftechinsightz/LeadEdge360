import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Reveal from '@/components/site/Reveal'

export default function HeroSection() {
  return (
    <section className="relative bg-background">
      <div className="container py-24 lg:py-32">

        <Reveal>
          <div className="max-w-5xl mx-auto text-center">

            <div className="inline-flex items-center px-4 py-2 rounded-full border border-border bg-card text-sm text-muted-foreground mb-8">
              AI-Powered Growth Intelligence Platform
            </div>

            <h1 className="font-display font-bold text-5xl md:text-7xl leading-tight text-foreground">
              Accelerate Revenue Growth With
              <span className="block text-primary">
                AI-Powered Growth Intelligence
              </span>
            </h1>

            <p className="mt-8 text-xl text-muted-foreground max-w-3xl mx-auto">
              Helping organizations generate more leads,
              improve conversion rates, automate customer engagement,
              and accelerate revenue growth through intelligent technology.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mt-10">

              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/growth-audit">
                  Get Free Growth Audit
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg">
                <Link href="/solutions">
                  Explore Solutions
                </Link>
              </Button>

            </div>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-4 gap-6 mt-16">

          {[
            ['+35%', 'Lead Growth'],
            ['+25%', 'Conversion Rate'],
            ['+40%', 'Revenue Growth'],
            ['360°', 'Business Visibility'],
          ].map(([value, label]) => (
            <div key={label} className="border border-border rounded-xl p-6 bg-card shadow-sm">
              <div className="text-3xl font-bold text-primary">{value}</div>
              <div className="text-sm text-muted-foreground mt-2">{label}</div>
            </div>
          ))}

        </div>

      </div>
    </section>
  )
}
