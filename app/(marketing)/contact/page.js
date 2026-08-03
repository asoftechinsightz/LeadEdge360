'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { toast } from 'sonner'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function Contact() {
  const [form, setForm] = useState({ name:'', email:'', company:'', message:'' })
  const [loading, setLoading] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/contact', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
    setLoading(false)
    if (res.ok) { toast.success('Thanks! We’ll reach out within 24 hours.'); setForm({ name:'', email:'', company:'', message:'' }) }
    else toast.error('Could not send. Try again.')
  }
  return (
    <>
      <section className="container py-20">
        <Badge variant="outline" className="rounded-full border-primary/30 text-primary mb-4">Contact</Badge>
        <h1 className="font-display font-bold text-5xl md:text-6xl">Let’s talk.</h1>
        <p className="mt-4 text-muted-foreground text-lg max-w-xl">Questions about LeadEdge360 or onboarding? We typically respond within a few hours.</p>
      </section>
      <section className="container pb-24 grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 bg-card/60 border-border/60"><CardContent className="p-8">
          <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
            <Input required placeholder="Full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
            <Input required type="email" placeholder="Work email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
            <Input placeholder="Company" value={form.company} onChange={e=>setForm({...form,company:e.target.value})} className="sm:col-span-2"/>
            <Textarea required rows={5} placeholder="How can we help?" value={form.message} onChange={e=>setForm({...form,message:e.target.value})} className="sm:col-span-2"/>
            <Button disabled={loading} className="sm:col-span-2 rounded-full bg-primary h-11">{loading ? 'Sending…' : 'Send message'}</Button>
          </form>
        </CardContent></Card>
        <Card className="bg-card/60 border-border/60"><CardContent className="p-8 space-y-5">
          <div className="flex items-start gap-3"><Mail className="h-5 w-5 text-primary mt-0.5"/><div><div className="font-medium">Email</div><a href="mailto:enquiry@asoftechinsightz.com" className="text-sm text-muted-foreground hover:text-primary">enquiry@asoftechinsightz.com</a></div></div>
          <div className="flex items-start gap-3"><Phone className="h-5 w-5 text-primary mt-0.5"/><div><div className="font-medium">Phone</div><a href="tel:+917307911405" className="text-sm text-muted-foreground hover:text-primary">+91-7307911405</a></div></div>
          <div className="flex items-start gap-3"><MapPin className="h-5 w-5 text-primary mt-0.5"/><div><div className="font-medium">HQ</div><div className="text-sm text-muted-foreground">Noida, India</div></div></div>
        </CardContent></Card>
      </section>
    </>
  )
}
