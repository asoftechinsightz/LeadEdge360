import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function FinalCTASection() {
  return (
    <section className="container py-24">
      <div className="rounded-3xl border border-border bg-card p-12 text-center shadow-sm">
        <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
          Ready To Accelerate Business Growth?
        </h2>

        <p className="mt-6 text-lg text-muted-foreground">
          Start with a complimentary Business Growth Audit.
        </p>

        <Button
          asChild
          size="lg"
          className="rounded-full mt-8 bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Link href="/growth-audit">
            Book Free Growth Audit
          </Link>
        </Button>
      </div>
    </section>
  )
}
