import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Reveal from '@/components/site/Reveal'

export default function RetailEdge360Section() {
  return (
    <section className="container py-24">

      <Reveal>

        <div className="grid lg:grid-cols-2 gap-12 items-center">

          <div>

            <div className="text-accent font-semibold mb-4">
              RetailEdge360
            </div>

            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              Retail Growth Platform
            </h2>

            <p className="mt-6 text-lg text-muted-foreground">
              Digitize Operations.
              Increase Customer Retention.
              Grow Revenue.
            </p>

            <ul className="mt-8 space-y-3 text-foreground/80">
              <li>✓ Smart Billing & POS</li>
              <li>✓ Inventory Intelligence</li>
              <li>✓ Customer Loyalty</li>
              <li>✓ GST Billing</li>
              <li>✓ Retail Analytics</li>
            </ul>

            <Button asChild size="lg" className="mt-8 rounded-full bg-primary hover:bg-primary/90">
              <Link href="/retailedge360">
                Explore RetailEdge360
              </Link>
            </Button>

          </div>

          <div className="border border-border rounded-2xl bg-card p-4 shadow-md">
            <Image
              src="/images/products/retailedge360-dashboard.png"
              alt="RetailEdge360 Dashboard"
              width={1200}
              height={700}
              className="rounded-xl"
            />
          </div>

        </div>

      </Reveal>

    </section>
  )
}
