'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import {
  Package, AlertTriangle, ShieldCheck, IndianRupee, Plus, RefreshCw,
  Sparkles, ChevronRight, MessageCircle, Bot
} from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

const CATEGORIES = ['dairy','bakery','produce','meat','beverage','pharma','cosmetic','electronics','household','other']
const RISK_COLORS = {
  High:   'bg-rose-500/15 text-rose-300 border-rose-500/30',
  Medium: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Low:    'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
}
const PIE_COLORS = ['#F43F5E', '#F59E0B', '#22C55E', '#38BDF8', '#A78BFA']

const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN')

const Kpi = ({ icon: Icon, label, value, sub, accent='primary' }) => (
  <Card className="bg-card/60 border-border/60 overflow-hidden relative">
    <div className={`absolute -top-10 -right-10 h-32 w-32 rounded-full bg-${accent}/20 blur-2xl`} />
    <CardContent className="p-5 relative">
      <div className="flex items-center justify-between">
        <div className="text-xs tracking-widest text-muted-foreground">{label}</div>
        <Icon className={`h-4 w-4 text-${accent}`} />
      </div>
      <div className="font-display text-3xl font-bold mt-2">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </CardContent>
  </Card>
)

export default function RetailEdge360() {
  const [products, setProducts] = useState([])
  const [kpis, setKpis] = useState(null)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    const [pr, kr] = await Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/retail-kpis').then(r => r.json()),
    ])
    setProducts(pr.products || [])
    setKpis(kr)
  }
  useEffect(() => { load() }, [])

  const repredict = async (id) => {
    toast.loading('RevenueShield AI re-predicting…', { id: 'rp' })
    const r = await fetch(`/api/products/${id}/repredict`, { method: 'POST' })
    const j = await r.json()
    toast.success(`Updated: ${j.product?.predictedShelfDays}d (${j.product?.risk} risk)`, { id: 'rp' })
    load()
  }
  const remove = async (id) => {
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    toast.success('Removed')
    load()
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs tracking-widest text-muted-foreground mb-2">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" /> RETAILEDGE360 · REVENUESHIELD AI
            </div>
            <h1 className="font-display font-bold text-2xl md:text-3xl">Expiry &amp; shelf-life intelligence</h1>
            <p className="text-muted-foreground mt-2">Every SKU. Every store. Predicted, prioritised and rescued before it becomes wastage.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-accent/15 text-accent border-0">Early Access</Badge>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full bg-accent hover:bg-accent/90"><Plus className="h-4 w-4 mr-1"/> Add SKU</Button>
              </DialogTrigger>
              <ProductDialog onDone={() => { setOpen(false); load() }} loading={loading} setLoading={setLoading}/>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Kpi icon={Package}        label="TOTAL SKUs"       value={kpis?.total ?? '—'} sub={`${kpis?.byRisk?.[0]?.value ?? 0} at risk`} accent="accent" />
          <Kpi icon={IndianRupee}    label="INVENTORY VALUE"   value={kpis ? fmt(kpis.inventoryValue) : '—'} sub="on the floor" accent="primary" />
          <Kpi icon={AlertTriangle}  label="AT-RISK VALUE"     value={kpis ? fmt(kpis.atRiskValue) : '—'} sub="expiring < 7 days" accent="primary" />
          <Kpi icon={ShieldCheck}    label="REVENUE SHIELDED"  value={kpis ? fmt(kpis.savedSoFar) : '—'} sub="AI-recommended saves" accent="accent" />
          <Kpi icon={Bot}            label="AI ENGINE"         value={products[0]?.engine === 'llm' ? 'LLM' : 'Hybrid'} sub="shelf-life predictions" accent="accent" />
        </div>

        <div className="grid lg:grid-cols-3 gap-4 mb-8">
          <Card className="bg-card/60 border-border/60 lg:col-span-2">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs tracking-widest text-muted-foreground">RISK BY CATEGORY</div>
                  <div className="font-display font-semibold text-lg">Inventory value by category</div>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer>
                  <BarChart data={kpis?.byCategory || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={{ background: '#0B1220', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }} formatter={(v)=>fmt(v)}/>
                    <Bar dataKey="value" fill="#22C55E" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/60 border-border/60">
            <CardContent className="p-5">
              <div className="text-xs tracking-widest text-muted-foreground">RISK SPLIT</div>
              <div className="font-display font-semibold text-lg mb-2">Shelf-life risk</div>
              <div className="h-64">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={kpis?.byRisk || []} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3}>
                      {(kpis?.byRisk || []).map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0B1220', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }}/>
                    <Legend wrapperStyle={{ fontSize: 11 }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card/60 border-border/60">
          <CardContent className="p-0">
            <div className="px-5 py-4 border-b border-border/40">
              <div className="text-xs tracking-widest text-muted-foreground">PRODUCT CATALOGUE</div>
              <div className="font-display font-semibold text-lg">{products.length} SKUs · sorted by shelf-life risk</div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40 hover:bg-transparent">
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Store</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead>AI Shelf-life</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map(p => (
                    <TableRow key={p.id} className="border-border/30 hover:bg-card cursor-pointer" onClick={() => setSelected(p)}>
                      <TableCell>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.sku}</div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="capitalize rounded-full">{p.category}</Badge></TableCell>
                      <TableCell className="text-sm">{p.store}</TableCell>
                      <TableCell className="text-right text-sm">{p.stock}</TableCell>
                      <TableCell className="text-right text-sm">{fmt(p.price)}</TableCell>
                      <TableCell><span className="font-display font-semibold">{p.predictedShelfDays}d</span> <span className="text-xs text-muted-foreground">predicted</span></TableCell>
                      <TableCell><Badge variant="outline" className={`border ${RISK_COLORS[p.risk] || ''}`}>{p.risk}</Badge></TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                          <Button size="icon" variant="ghost" className="h-8 w-8" title="Re-predict" onClick={() => repredict(p.id)}>
                            <RefreshCw className="h-4 w-4"/>
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-300" title="Remove" onClick={() => remove(p.id)}>
                            <Plus className="h-4 w-4 rotate-45"/>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {products.length === 0 && (
                    <TableRow><TableCell colSpan={8} className="py-12 text-center text-muted-foreground">No SKUs yet. Click <span className="text-accent">+ Add SKU</span> to capture your first product.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle className="font-display text-2xl">{selected?.name}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><div className="text-muted-foreground text-xs">SKU</div>{selected.sku}</div>
                <div><div className="text-muted-foreground text-xs">Category</div><span className="capitalize">{selected.category}</span></div>
                <div><div className="text-muted-foreground text-xs">Stock</div>{selected.stock}</div>
                <div><div className="text-muted-foreground text-xs">Price</div>{fmt(selected.price)}</div>
                <div><div className="text-muted-foreground text-xs">Store</div>{selected.store}</div>
                <div><div className="text-muted-foreground text-xs">Days on shelf</div>{selected.daysOnShelf}</div>
              </div>
              <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-accent"/>
                  <div className="font-display font-semibold">RevenueShield AI</div>
                  <Badge className="ml-auto bg-accent text-white">{selected.predictedShelfDays}d · {selected.risk} risk</Badge>
                </div>
                <div className="text-xs text-muted-foreground mb-2">Engine: {selected.engine}</div>
                <div className="text-sm mb-3"><span className="text-muted-foreground">Recommendation:</span> {selected.recommendation}</div>
                <ul className="text-sm space-y-1">
                  {(selected.reasoning || []).map((r, i) => <li key={i} className="flex gap-2"><ChevronRight className="h-4 w-4 text-accent mt-0.5"/>{r}</li>)}
                </ul>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => repredict(selected.id)} variant="outline" className="flex-1"><RefreshCw className="h-4 w-4 mr-1"/>Re-predict</Button>
                <a href={`https://wa.me/?text=${encodeURIComponent('SKU ' + selected.sku + ' — ' + selected.recommendation)}`} target="_blank" rel="noreferrer" className="flex-1">
                  <Button className="w-full bg-accent hover:bg-accent/90"><MessageCircle className="h-4 w-4 mr-1"/> Share via WhatsApp</Button>
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function ProductDialog({ onDone, loading, setLoading }) {
  const [form, setForm] = useState({
    name: '', sku: '', category: 'dairy', price: 100, stock: 50, daysOnShelf: 1, store: 'Default Store'
  })
  const submit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.sku) return toast.error('Name & SKU required')
    setLoading(true)
    toast.loading('Predicting shelf-life with RevenueShield AI…', { id: 'p' })
    const r = await fetch('/api/products', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(form) })
    const j = await r.json()
    setLoading(false)
    if (r.ok) {
      toast.success(`✨ ${j.product.predictedShelfDays}d shelf-life · ${j.product.risk} risk`, { id: 'p', duration: 5000 })
      onDone()
    } else {
      const msg = j.error || 'Failed'
      if (j.code === 'PLAN_RETAIL_DISABLED' && j.upgradeUrl) {
        toast.error(`${msg} Visit ${j.upgradeUrl} to upgrade.`, { id: 'p', duration: 8000 })
      } else {
        toast.error(msg, { id: 'p' })
      }
    }
  }
  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="font-display text-2xl flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent"/> Add SKU
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
        <div><Label>Product name *</Label><Input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required className="mt-1.5"/></div>
        <div><Label>SKU *</Label><Input value={form.sku} onChange={e=>setForm({...form,sku:e.target.value})} required className="mt-1.5"/></div>
        <div>
          <Label>Category</Label>
          <Select value={form.category} onValueChange={v=>setForm({...form,category:v})}>
            <SelectTrigger className="mt-1.5"><SelectValue/></SelectTrigger>
            <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Store</Label><Input value={form.store} onChange={e=>setForm({...form,store:e.target.value})} className="mt-1.5"/></div>
        <div><Label>Price (₹)</Label><Input type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} className="mt-1.5"/></div>
        <div><Label>Stock</Label><Input type="number" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} className="mt-1.5"/></div>
        <div><Label>Days on shelf</Label><Input type="number" value={form.daysOnShelf} onChange={e=>setForm({...form,daysOnShelf:e.target.value})} className="mt-1.5"/></div>
        <Button disabled={loading} className="sm:col-span-2 rounded-full bg-accent h-11">
          {loading ? 'Predicting…' : <><Sparkles className="h-4 w-4 mr-1"/> Add &amp; Predict Shelf-life</>}
        </Button>
      </form>
    </DialogContent>
  )
}
