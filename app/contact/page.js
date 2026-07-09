'use client'

import SiteShell from '@/components/site/SiteShell'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { toast } from 'sonner'
import { Mail, Phone, MapPin } from 'lucide-react'
import MarketingPageHero from '@/components/gix/enterprise/MarketingPageHero'
import { FadeIn } from '@/components/gix/enterprise/primitives'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' })
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/marketing/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, source: 'contact', message: form.message }),
    })
    setLoading(false)
    if (res.ok) {
      toast.success("Thanks! We'll reach out within 24 hours.")
      setForm({ name: '', email: '', company: '', message: '' })
    } else {
      toast.error('Could not send. Try again.')
    }
  }

  return (
    <SiteShell>
      <MarketingPageHero
        eyebrow="Contact"
        title="Let's build your"
        accent="AI growth roadmap"
        description="Enterprise demos, pilot scoping, and partnership inquiries — we typically respond within a few hours."
      />

      <section className="container pb-24 grid md:grid-cols-3 gap-6">
        <FadeIn className="md:col-span-2">
          <Card className="glass border-white/10">
            <CardContent className="p-8">
              <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
                <Input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <Input required type="email" placeholder="Work email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <Input placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="sm:col-span-2" />
                <Textarea required rows={5} placeholder="Tell us about your goals — pilot scope, industry, team size…" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="sm:col-span-2" />
                <Button disabled={loading} className="sm:col-span-2 rounded-full bg-[#0066FF] hover:bg-[#00C6FF] h-11">
                  {loading ? 'Sending…' : 'Send message'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Card className="glass border-white/10 h-full">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-[hsl(var(--brand-electric))] mt-0.5" />
                <div>
                  <div className="font-medium text-white">Email</div>
                  <a href="mailto:enquiry@asoftechinsightz.com" className="text-sm text-muted-foreground hover:text-[hsl(var(--brand-electric))]">enquiry@asoftechinsightz.com</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-[hsl(var(--brand-electric))] mt-0.5" />
                <div>
                  <div className="font-medium text-white">Phone</div>
                  <a href="tel:+917307911405" className="text-sm text-muted-foreground hover:text-[hsl(var(--brand-electric))]">+91-7307911405</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[hsl(var(--brand-electric))] mt-0.5" />
                <div>
                  <div className="font-medium text-white">HQ</div>
                  <div className="text-sm text-muted-foreground">Noida, India</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </section>
    </SiteShell>
  )
}
