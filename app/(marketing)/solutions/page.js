import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Target, Store, Handshake, Building2, ArrowRight } from 'lucide-react'

const solutions = [
  {
    icon: Target,
    title: 'Field sales & distribution',
    description:
      'Geo-qualified lead routing, territory mapping, and WhatsApp follow-ups for teams selling across pin codes and cities.',
    product: 'LeadEdge360',
    accent: 'text-primary',
  },
  {
    icon: Store,
    title: 'Retail & FMCG',
    description:
      'Expiry prediction, shelf-life intelligence, and margin analytics to cut wastage and lift store-level revenue.',
    product: 'RetailEdge360',
    accent: 'text-accent',
  },
  {
    icon: Handshake,
    title: 'Channel partners',
    description:
      'Unified pipeline visibility for dealers, distributors, and partner networks — score, assign, and track every opportunity.',
    product: 'LeadEdge360',
    accent: 'text-primary',
  },
  {
    icon: Building2,
    title: 'Multi-location enterprises',
    description:
      'One workspace, role-based access, and AI Copilot across sales and retail — built for Indian SMBs scaling to enterprise.',
    product: 'Suite',
    accent: 'text-foreground',
  },
]

export default function SolutionsPage() {
  return (
    <>
      <section className="container py-20">
        <Badge variant="outline" className="rounded-full border-primary/30 text-primary mb-4">
          Solutions
        </Badge>
        <h1 className="font-display font-bold text-5xl md:text-6xl max-w-3xl">
          AI automation for how India actually sells and retails.
        </h1>
        <p className="mt-5 max-w-2xl text-muted-foreground text-lg">
          Whether you run a field-sales army or a chain of stores, AsoftechInsightz maps to your operating model — not the other way around.
        </p>
      </section>

      <section className="container pb-16 grid md:grid-cols-2 gap-5">
        {solutions.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.title} className="bg-card/60 border-border/60 h-full">
              <CardContent className="p-8">
                <Icon className={`h-7 w-7 mb-3 ${item.accent}`} />
                <Badge variant="outline" className="rounded-full mb-3 text-xs">
                  {item.product}
                </Badge>
                <h2 className="font-display text-2xl font-bold">{item.title}</h2>
                <p className="mt-2 text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </section>

      <section className="container pb-24">
        <Card className="border-border/60 bg-gradient-to-br from-primary/10 via-card to-accent/10">
          <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-8">
            <div>
              <h2 className="font-display text-2xl font-bold">Ready to see it in your workspace?</h2>
              <p className="mt-2 text-muted-foreground max-w-xl">
                Sign in once to access Dashboard, LeadEdge360, RetailEdge360, and Billing from a single application shell.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Button asChild className="rounded-full bg-primary">
                <Link href="/signin">
                  Sign in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/contact">Talk to sales</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  )
}
