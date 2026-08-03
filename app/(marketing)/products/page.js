import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Target, ShieldCheck, ArrowRight, Bot } from 'lucide-react'

export default function Products() {
  return (
    <>
      <section className="container py-20">
        <Badge variant="outline" className="rounded-full border-primary/30 text-primary mb-4">Products</Badge>
        <h1 className="font-display font-bold text-5xl md:text-6xl max-w-3xl">The AsoftechInsightz suite.</h1>
        <p className="mt-5 max-w-2xl text-muted-foreground text-lg">Two flagship products, one AI Copilot, infinite possibilities.</p>
      </section>
      <section className="container pb-24 grid md:grid-cols-2 gap-6">
        <Card className="bg-card/60 border-border/60"><CardContent className="p-8">
          <Target className="h-7 w-7 text-primary mb-3"/>
          <Badge className="bg-primary/15 text-primary border-0 mb-3">Live · v1.0</Badge>
          <h3 className="font-display text-3xl font-bold">LeadEdge360</h3>
          <p className="mt-2 text-muted-foreground">Geo-intelligent lead capture, AI scoring, territory routing &amp; WhatsApp automation.</p>
          <Button asChild className="mt-6 rounded-full bg-primary"><Link href="/signin">Get started <ArrowRight className="ml-2 h-4 w-4"/></Link></Button>
        </CardContent></Card>
        <Card className="bg-card/60 border-border/60"><CardContent className="p-8">
          <ShieldCheck className="h-7 w-7 text-accent mb-3"/>
          <Badge className="bg-accent/15 text-accent border-0 mb-3">Coming Soon</Badge>
          <h3 className="font-display text-3xl font-bold">RetailEdge360</h3>
          <p className="mt-2 text-muted-foreground">AI-powered expiry &amp; revenue intelligence for retail.</p>
          <Button asChild variant="outline" className="mt-6 rounded-full"><Link href="/contact">Join waitlist <ArrowRight className="ml-2 h-4 w-4"/></Link></Button>
        </CardContent></Card>
        <Card className="md:col-span-2 bg-gradient-to-br from-primary/10 via-card to-accent/10 border-border/60"><CardContent className="p-8">
          <Bot className="h-7 w-7 text-primary mb-3"/>
          <h3 className="font-display text-3xl font-bold">AI Copilot</h3>
          <p className="mt-2 text-muted-foreground max-w-2xl">A single natural-language assistant across both products. Ask “Which agent has the highest conversion in Bengaluru this week?” — and get an instant, action-ready answer.</p>
        </CardContent></Card>
      </section>
    </>
  )
}
