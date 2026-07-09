'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { apiGet, apiPost } from '@/src/lib/api'
import { toast } from 'sonner'
import { TrendingUp } from 'lucide-react'
import MarketingPageHero from '@/components/gix/enterprise/MarketingPageHero'
import { FadeIn } from '@/components/gix/enterprise/primitives'

export default function GrowthAuditPage() {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    industry: '',
    website: '',
    monthlyRevenue: '',
    challenge: '',
  })

  const statsQuery = useQuery({
    queryKey: ['growth-audit', 'stats'],
    queryFn: () => apiGet('/growth-audit'),
  })

  const auditMutation = useMutation({
    mutationFn: (payload) => apiPost('/growth-audit', payload),
    onSuccess: () => {
      toast.success('Growth Audit Request Submitted')
      setForm({
        name: '',
        company: '',
        phone: '',
        email: '',
        industry: '',
        website: '',
        monthlyRevenue: '',
        challenge: '',
      })
    },
    onError: (error) => {
      toast.error(error.message || 'Unable to submit request')
    },
    onSettled: () => {
      setLoading(false)
      statsQuery.refetch()
    },
  })

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    auditMutation.mutate(form)
  }

  return (
    <>
      <MarketingPageHero
        eyebrow="Free Growth Audit"
        title="Discover hidden"
        accent="growth opportunities"
        description="Get a free Growth Audit and uncover how AI, automation, and growth intelligence can accelerate your business."
      />

      <section className="container pb-24 grid md:grid-cols-3 gap-6">
        <FadeIn className="md:col-span-2">
          <Card className="glass border-white/10">
            <CardContent className="p-8">
              <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
                <Input required placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <Input required placeholder="Company Name" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                <Input required placeholder="Mobile Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <Input required type="email" placeholder="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <Input required placeholder="Industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
                <Input placeholder="Website URL" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
                <Input placeholder="Monthly Revenue" value={form.monthlyRevenue} onChange={(e) => setForm({ ...form, monthlyRevenue: e.target.value })} className="sm:col-span-2" />
                <Textarea required rows={5} placeholder="What is your biggest growth challenge?" value={form.challenge} onChange={(e) => setForm({ ...form, challenge: e.target.value })} className="sm:col-span-2" />
                <Button disabled={loading} className="sm:col-span-2 rounded-full bg-[#0066FF] hover:bg-[#00C6FF] h-11">
                  {loading ? 'Submitting…' : 'Get My Free Growth Audit'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Card className="glass border-white/10 h-full gix-glow">
            <CardContent className="p-8">
              <div className="flex gap-3">
                <TrendingUp className="h-6 w-6 text-[hsl(var(--brand-electric))]" />
                <div>
                  <h3 className="font-semibold">What You Will Receive</h3>
                  <ul className="mt-4 text-sm text-muted-foreground space-y-2">
                    <li>✓ Growth Opportunity Analysis</li>
                    <li>✓ Lead Generation Review</li>
                    <li>✓ Website Visibility Assessment</li>
                    <li>✓ AI &amp; Automation Recommendations</li>
                    <li>✓ Revenue Growth Roadmap</li>
                  </ul>
                  <div className="mt-5 text-xs text-muted-foreground">
                    Recent audits: {statsQuery.data?.recentAudits ?? 0}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </section>
    </>
  )
}
