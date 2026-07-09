import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Reveal from '@/components/site/Reveal'
import { PRODUCTS, BRAND_NAME } from '@/lib/brand'

const product = PRODUCTS.leadedge360

export default function LeadEdge360Section() {
  return (
    <section className="container py-24">
      <Reveal>
        <div className="brand-glass-card brand-gradient-border overflow-hidden">
          <div className="relative p-10 md:p-14 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--brand-royal))]/10 via-transparent to-[hsl(var(--brand-growth))]/10 pointer-events-none" />
            <div className="relative mx-auto max-w-3xl">
              <Image
                src={product.logo}
                alt={product.name}
                width={320}
                height={90}
                className="h-16 md:h-20 w-auto object-contain mx-auto mb-6"
              />

              <p className="text-[hsl(var(--brand-growth))] font-medium tracking-wide text-sm uppercase mb-2">
                {product.tagline}
              </p>

              <h2 className="font-display text-4xl md:text-5xl font-bold">
                Your AI-Powered Business Growth Command Center
              </h2>

              <p className="mt-6 text-lg text-muted-foreground">
                Capture more leads. Convert faster. Automate engagement. Grow revenue predictably —
                with territory intelligence and AI scoring built in.
              </p>

              <p className="mt-3 text-xs text-muted-foreground uppercase tracking-wider">
                Powered by {BRAND_NAME}
              </p>

              <div className="flex flex-wrap justify-center gap-3 mt-8">
                <Button asChild size="lg" className="rounded-full bg-[hsl(var(--brand-growth))] hover:bg-[hsl(var(--brand-growth))]/90 text-white">
                  <Link href="/leadedge360">Explore LeadEdge360</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full">
                  <Link href="/signin">Sign in</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
