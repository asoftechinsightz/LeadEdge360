'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import {
  Users, Target, TrendingUp, Flame, Plus, Sparkles, Phone, Mail,
  RefreshCw, MessageCircle, MapPin, ChevronRight, Bot
} from 'lucide-react'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { AeoKpiRow } from '@/components/aeo/AeoGrowthEngine'
import { hydrateAeoProfileFromApi } from '@/lib/aeo/profile'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts'

const TERRITORIES = ['Bengaluru','Mumbai','Delhi NCR','Hyderabad','Chennai','Pune']
const SOURCES = ['website','facebook','google','whatsapp','referral']
const STATUSES = ['New','Contacted','Qualified','Proposal','Won','Lost']
const ROLES = [
  { v: 'admin', label: 'Admin' },
  { v: 'manager', label: 'Sales Manager' },
  { v: 'agent', label: 'Sales Agent' },
]
const STATUS_COLORS = {
  New: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  Contacted: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  Qualified: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Proposal: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30',
  Won: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Lost: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
}
const LABEL_COLORS = {
  Hot: 'bg-primary/20 text-primary border-primary/40',
  Warm: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Cold: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
}
const PIE_COLORS = ['#FF8A3D', '#22C55E', '#38BDF8', '#A78BFA', '#F59E0B']

export default function LeadEdge360() {
  const [leads, setLeads] = useState([])
  const [kpis, setKpis] = useState(null)
  const [agents, setAgents] = useState([])
  const [billing, setBilling] = useState(null)
  const [role, setRole] = useState('admin')
  const [filterTerr, setFilterTerr] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)
  const [aeoProfile, setAeoProfile] = useState(null)

  useEffect(() => {
    hydrateAeoProfileFromApi().then((h) => setAeoProfile(h.profile))
  }, [])

  const agentName = role === 'agent' ? (agents[0]?.name || 'Aarav Sharma') : null

  const fetchAll = async () => {
    const params = new URLSearchParams()
    if (filterTerr !== 'all') params.set('territory', filterTerr)
    if (filterStatus !== 'all') params.set('status', filterStatus)
    if (role === 'agent' && agentName) { params.set('role','agent'); params.set('agent', agentName) }
    const [lr, kr, ar] = await Promise.all([
      fetch('/api/leads?' + params.toString()).then(r => r.json()),
      fetch('/api/kpis?' + params.toString()).then(r => r.json()),
      fetch('/api/agents').then(r => r.json()),
    ])
    setLeads(lr.leads || [])
    setKpis(kr)
    setAgents(ar.agents || [])
  }

  useEffect(() => { fetchAll() }, [role, filterTerr, filterStatus])

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(j => setBilling(j.billing || null)).catch(() => {})
  }, [])

  const updateStatus = async (id, status) => {
    await fetch(`/api/leads/${id}`, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ status }) })
    toast.success(`Status → ${status}`)
    fetchAll()
  }
  const rescore = async (id) => {
    toast.loading('Re-scoring with AI…', { id: 're' })
    const r = await fetch(`/api/leads/${id}/rescore`, { method: 'POST' })
    const j = await r.json()
    toast.success(`Re-scored: ${j.lead?.score} (${j.lead?.label})`, { id: 're' })
    fetchAll()
  }
  const whatsappLink = (lead) => {
    const phone = (lead.phone || '').replace(/\D/g,'')
    const msg = encodeURIComponent(`Hi ${lead.name}, this is from AsoftechInsightz. Following up on your enquiry — when can we connect?`)
    return `https://wa.me/${phone}?text=${msg}`
  }

  return (
    <>
      <div className="space-y-6">
        {billing?.activated && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3">
            <div className="text-sm">
              <span className="font-medium capitalize">{billing.plan}</span> plan active
              {billing.subscription?.currentEnd && (
                <span className="text-muted-foreground"> · until {new Date(billing.subscription.currentEnd).toLocaleDateString('en-IN')}</span>
              )}
            </div>
            <Badge className="bg-primary/20 text-primary border-primary/40">Subscribed</Badge>
          </div>
        )}
        {/* HEADER */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs tracking-widest text-muted-foreground mb-2">
              <Target className="h-3.5 w-3.5 text-primary" /> LEADEDGE360 · CRM DASHBOARD
            </div>
            <h1 className="font-display font-bold text-2xl md:text-3xl">Lead command center</h1>
            <p className="text-muted-foreground mt-2">Capture, score and convert. Every lead, every channel, every territory.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-[180px] bg-card/60"><SelectValue /></SelectTrigger>
              <SelectContent>{ROLES.map(r => <SelectItem key={r.v} value={r.v}>{r.label}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={filterTerr} onValueChange={setFilterTerr}>
              <SelectTrigger className="w-[160px] bg-card/60"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All territories</SelectItem>
                {TERRITORIES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px] bg-card/60"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full bg-primary glow-orange"><Plus className="h-4 w-4 mr-1"/> New lead</Button>
              </DialogTrigger>
              <LeadDialog onDone={() => { setOpen(false); fetchAll() }} loading={loading} setLoading={setLoading} />
            </Dialog>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          <KpiCard icon={Users} label="TOTAL LEADS" value={kpis?.total ?? '—'} sub="all sources" accent="primary" />
          <KpiCard icon={Target} label="QUALIFIED" value={kpis?.qualified ?? '—'} sub={`${kpis?.total ? Math.round((kpis.qualified/kpis.total)*100):0}% of total`} accent="accent" />
          <KpiCard icon={TrendingUp} label="CONVERSION" value={`${kpis?.conversion ?? 0}%`} sub={`${kpis?.won ?? 0} won`} accent="primary" />
          <KpiCard icon={Flame} label="HOT LEADS" value={kpis?.hot ?? '—'} sub={`avg score ${kpis?.avgScore ?? 0}`} accent="primary" />
          <KpiCard icon={Bot} label="AI ENGINE" value={leads[0]?.engine === 'llm' ? 'LLM' : 'Hybrid'} sub="auto-scoring active" accent="accent" />
        </div>

        <div className="mb-8">
          <div className="text-xs tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> AEO INTELLIGENCE
          </div>
          {aeoProfile && <AeoKpiRow profile={aeoProfile} kpis={kpis} compact />}
        </div>

        {/* CHARTS */}
        <div className="grid lg:grid-cols-3 gap-4 mb-8">
          <Card className="bg-card/60 border-border/60 lg:col-span-2">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs tracking-widest text-muted-foreground">SALES PERFORMANCE</div>
                  <div className="font-display font-semibold text-lg">Leads & wins · last 14 days</div>
                </div>
                <Badge variant="outline" className="rounded-full text-xs">Live</Badge>
              </div>
              <div className="h-64">
                <ResponsiveContainer>
                  <LineChart data={kpis?.trend || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: '#0B1220', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="leads" stroke="#FF8A3D" strokeWidth={2.5} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="won" stroke="#22C55E" strokeWidth={2.5} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/60 border-border/60">
            <CardContent className="p-5">
              <div className="text-xs tracking-widest text-muted-foreground">SOURCES</div>
              <div className="font-display font-semibold text-lg mb-2">By channel</div>
              <div className="h-64">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={kpis?.bySource || []} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3}>
                      {(kpis?.bySource || []).map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0B1220', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/60 border-border/60 lg:col-span-2">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs tracking-widest text-muted-foreground">TERRITORY PERFORMANCE</div>
                  <div className="font-display font-semibold text-lg">Leads by city</div>
                </div>
                <MapPin className="h-4 w-4 text-primary"/>
              </div>
              <div className="h-56">
                <ResponsiveContainer>
                  <BarChart data={kpis?.byTerritory || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false}/>
                    <Tooltip contentStyle={{ background: '#0B1220', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }} />
                    <Bar dataKey="leads" fill="#FF8A3D" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/60 border-border/60">
            <CardContent className="p-5">
              <div className="text-xs tracking-widest text-muted-foreground">TOP AGENTS</div>
              <div className="font-display font-semibold text-lg mb-3">Sales leaderboard</div>
              <div className="space-y-3">
                {(kpis?.byAgent || []).slice(0, 5).sort((a,b)=>b.leads-a.leads).map((a, i) => (
                  <div key={a.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/15 text-primary grid place-items-center text-xs font-semibold">{i+1}</div>
                      <div>
                        <div className="text-sm font-medium">{a.name}</div>
                        <div className="text-xs text-muted-foreground">{a.leads} leads · {a.won} won</div>
                      </div>
                    </div>
                    <Badge className="bg-accent/15 text-accent border-0">{a.conversion}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* LEADS TABLE */}
        <Card className="bg-card/60 border-border/60">
          <CardContent className="p-0">
            <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between">
              <div>
                <div className="text-xs tracking-widest text-muted-foreground">LEAD INBOX</div>
                <div className="font-display font-semibold text-lg">{leads.length} leads</div>
              </div>
              <div className="text-xs text-muted-foreground">Tip: Click a lead row to view AI scoring details</div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40 hover:bg-transparent">
                    <TableHead>Lead</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Territory</TableHead>
                    <TableHead>Assigned</TableHead>
                    <TableHead>AI Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map(l => (
                    <TableRow key={l.id} className="border-border/30 hover:bg-card cursor-pointer" onClick={() => setSelectedLead(l)}>
                      <TableCell>
                        <div className="font-medium">{l.name}</div>
                        <div className="text-xs text-muted-foreground">{l.company || '—'} · {l.phone}</div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="capitalize rounded-full">{l.source}</Badge></TableCell>
                      <TableCell className="text-sm">{l.territory}</TableCell>
                      <TableCell className="text-sm">{l.assignedTo}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-lg">{l.score}</span>
                          <Badge className={`border ${LABEL_COLORS[l.label] || ''}`} variant="outline">{l.label}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select value={l.status} onValueChange={(v) => updateStatus(l.id, v)}>
                          <SelectTrigger className={`h-8 w-[130px] text-xs border ${STATUS_COLORS[l.status] || ''}`} onClick={e => e.stopPropagation()}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                          <Button size="icon" variant="ghost" className="h-8 w-8" title="Re-score" onClick={() => rescore(l.id)}>
                            <RefreshCw className="h-4 w-4"/>
                          </Button>
                          <a href={whatsappLink(l)} target="_blank" rel="noreferrer" title="WhatsApp follow-up">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-accent"><MessageCircle className="h-4 w-4"/></Button>
                          </a>
                          <a href={`tel:${l.phone}`} title="Call">
                            <Button size="icon" variant="ghost" className="h-8 w-8"><Phone className="h-4 w-4"/></Button>
                          </a>
                          <a href={`mailto:${l.email}`} title="Email">
                            <Button size="icon" variant="ghost" className="h-8 w-8"><Mail className="h-4 w-4"/></Button>
                          </a>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {leads.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="py-12 text-center text-muted-foreground">No leads yet. Click <span className="text-primary">+ New lead</span> to capture your first one.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* LEAD DETAIL DRAWER (using Dialog) */}
      <Dialog open={!!selectedLead} onOpenChange={(o) => !o && setSelectedLead(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle className="font-display text-2xl">{selectedLead?.name}</DialogTitle></DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><div className="text-muted-foreground text-xs">Company</div>{selectedLead.company || '—'}</div>
                <div><div className="text-muted-foreground text-xs">Phone</div>{selectedLead.phone}</div>
                <div><div className="text-muted-foreground text-xs">Email</div>{selectedLead.email || '—'}</div>
                <div><div className="text-muted-foreground text-xs">Source</div><span className="capitalize">{selectedLead.source}</span></div>
                <div><div className="text-muted-foreground text-xs">Territory</div>{selectedLead.territory}</div>
                <div><div className="text-muted-foreground text-xs">Assigned to</div>{selectedLead.assignedTo}</div>
              </div>
              {selectedLead.message && (
                <div>
                  <div className="text-muted-foreground text-xs mb-1">Lead message</div>
                  <div className="rounded-lg bg-muted/30 p-3 text-sm">{selectedLead.message}</div>
                </div>
              )}
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary"/>
                  <div className="font-display font-semibold">AI Lead Score</div>
                  <Badge className="ml-auto bg-primary text-primary-foreground">{selectedLead.score} · {selectedLead.label}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mb-2">Engine: {selectedLead.engine}</div>
                <ul className="text-sm space-y-1">
                  {(selectedLead.reasons || []).map((r, i) => <li key={i} className="flex gap-2"><ChevronRight className="h-4 w-4 text-primary mt-0.5"/>{r}</li>)}
                </ul>
              </div>
              <div className="flex gap-2">
                <a href={whatsappLink(selectedLead)} target="_blank" rel="noreferrer" className="flex-1">
                  <Button className="w-full bg-accent hover:bg-accent/90"><MessageCircle className="h-4 w-4 mr-1"/> WhatsApp follow-up</Button>
                </a>
                <Button variant="outline" onClick={() => rescore(selectedLead.id)}><RefreshCw className="h-4 w-4 mr-1"/> Re-score</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function LeadDialog({ onDone, loading, setLoading }) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '', message: '',
    source: 'website', territory: 'Bengaluru', budget: 0, whatsapp: true,
  })
  const submit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.phone) return toast.error('Name & phone required')
    setLoading(true)
    toast.loading('Capturing & AI-scoring lead…', { id: 'c' })
    const r = await fetch('/api/leads', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(form) })
    const j = await r.json()
    setLoading(false)
    if (r.ok) {
      toast.success(`✨ Lead scored ${j.lead.score} (${j.lead.label}) · routed to ${j.lead.assignedTo}`, { id: 'c', duration: 5000 })
      onDone()
    } else {
      const msg = j.error || 'Failed'
      if (j.code === 'PLAN_LIMIT_LEADS' && j.upgradeUrl) {
        toast.error(`${msg} Visit ${j.upgradeUrl} to upgrade.`, { id: 'c', duration: 8000 })
      } else {
        toast.error(msg, { id: 'c' })
      }
    }
  }
  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="font-display text-2xl flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary"/> Capture a new lead
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 grid sm:grid-cols-2 gap-4">
          <div><Label>Full name *</Label><Input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required className="mt-1.5"/></div>
          <div><Label>Phone *</Label><Input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} required className="mt-1.5"/></div>
        </div>
        <div><Label>Email</Label><Input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="mt-1.5"/></div>
        <div><Label>Company</Label><Input value={form.company} onChange={e=>setForm({...form,company:e.target.value})} className="mt-1.5"/></div>
        <div>
          <Label>Source</Label>
          <Select value={form.source} onValueChange={v=>setForm({...form,source:v})}>
            <SelectTrigger className="mt-1.5"><SelectValue/></SelectTrigger>
            <SelectContent>{SOURCES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Territory</Label>
          <Select value={form.territory} onValueChange={v=>setForm({...form,territory:v})}>
            <SelectTrigger className="mt-1.5"><SelectValue/></SelectTrigger>
            <SelectContent>{TERRITORIES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Budget (₹)</Label><Input type="number" value={form.budget} onChange={e=>setForm({...form,budget:e.target.value})} className="mt-1.5"/></div>
        <div className="flex items-center gap-3 mt-7"><Switch checked={form.whatsapp} onCheckedChange={v=>setForm({...form,whatsapp:v})}/><Label>WhatsApp opt-in</Label></div>
        <div className="sm:col-span-2"><Label>Message / Intent</Label><Textarea rows={3} value={form.message} onChange={e=>setForm({...form,message:e.target.value})} className="mt-1.5" placeholder="e.g. Need a demo of LeadEdge360 for our 20 reps. Budget approved." /></div>
        <Button disabled={loading} className="sm:col-span-2 rounded-full bg-primary glow-orange h-11">
          {loading ? 'Scoring…' : <><Sparkles className="h-4 w-4 mr-1"/> Capture & AI-Score</>}
        </Button>
      </form>
    </DialogContent>
  )
}
