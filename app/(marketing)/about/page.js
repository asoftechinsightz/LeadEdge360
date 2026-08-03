import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Rocket, Heart, Globe2, Award } from 'lucide-react'

const TEAM_IMG = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200'

export default function About() {
  return (
    <>
      <section className="container py-20">
        <Badge variant="outline" className="rounded-full border-primary/30 text-primary mb-4">About us</Badge>
        <h1 className="font-display font-bold text-5xl md:text-6xl max-w-3xl leading-tight">We’re building India’s <span className="gradient-text">AI-first business suite</span>.</h1>
        <p className="mt-6 max-w-2xl text-muted-foreground text-lg">AsoftechInsightz is a SaaS company founded with one mission — to give every Indian business the AI superpowers that only the largest enterprises could afford. We make AI &amp; automation simple, affordable and locally-relevant.</p>
      </section>
      <section className="container pb-20">
        <div className="rounded-3xl overflow-hidden border border-border/60 aspect-[21/9] relative">
          <Image src={TEAM_IMG} alt="Team" fill className="object-cover"/>
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"/>
        </div>
      </section>
      <section className="container pb-24 grid md:grid-cols-4 gap-5">
        {[
          { i: Rocket, t: 'Mission', d: 'Democratize AI for every Indian SMB and enterprise.'},
          { i: Heart, t: 'Values', d: 'Customer obsession, craftsmanship, transparency.'},
          { i: Globe2, t: 'Reach', d: '240+ tenants across 18 Indian states and 4 countries.'},
          { i: Award, t: 'Stack', d: 'Next.js, Node.js, Postgres, n8n, Docker, Cloud Native.'},
        ].map(v => (
          <Card key={v.t} className="bg-card/60 border-border/60"><CardContent className="p-6">
            <v.i className="h-6 w-6 text-primary mb-3"/>
            <div className="font-display font-semibold text-lg">{v.t}</div>
            <p className="mt-1 text-sm text-muted-foreground">{v.d}</p>
          </CardContent></Card>
        ))}
      </section>
    </>
  )
}
