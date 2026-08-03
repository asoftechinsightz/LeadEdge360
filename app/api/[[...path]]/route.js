import { NextResponse } from 'next/server'
import { v4 as uuid } from 'uuid'
import { getDb } from '@/lib/mongo'
import { aiScore } from '@/lib/scoring'
import { predictShelfLife } from '@/lib/retail-ai'
import { loginUrl, exchangeSessionId, AUTH_CONFIGURED } from '@/lib/auth'
import { resolveTenant, ensureUserOrg, DEMO_ORG_ID, resolveWebActor } from '@/lib/tenant'
import {
  getRazorpay, RZP_CONFIGURED, PLANS,
  verifyCheckoutSignature, verifyWebhookSignature,
} from '@/lib/razorpay'
import { activatePaymentSuccess } from '@/lib/billing/activate-payment'
import { getOrgBillingContext } from '@/lib/billing/org-billing'
import { checkEntitlement } from '@/lib/billing/plan-entitlements'
import { isWebJwtBridgeEnabled, resolveAuthDispatch } from '@/lib/request-actor'
import { mobileRoute, cookieBridgeRoute } from '@/lib/mobile-routes'
import {
  getCorsAllowOrigin,
  isBillingSimulateAllowed,
  isIngestWebhookAllowed,
  resolveWebhookOrgId,
} from '@/lib/security-config'

export const dynamic = 'force-dynamic'

const json = (data, init = {}) => NextResponse.json(data, init)
const err = (m, s = 400) => NextResponse.json({ error: m }, { status: s })

function entitlementErr(result) {
  return NextResponse.json(result.body, { status: result.status })
}

// ─── constants ───
const AGENTS = [
  { id: 'a1', name: 'Aarav Sharma',  territory: 'Bengaluru' },
  { id: 'a2', name: 'Priya Iyer',    territory: 'Bengaluru' },
  { id: 'a3', name: 'Rohan Mehta',   territory: 'Mumbai' },
  { id: 'a4', name: 'Neha Kapoor',   territory: 'Delhi NCR' },
  { id: 'a5', name: 'Vikram Singh',  territory: 'Hyderabad' },
  { id: 'a6', name: 'Anjali Reddy',  territory: 'Chennai' },
  { id: 'a7', name: 'Karthik Nair',  territory: 'Pune' },
]
const STATUSES = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost']

function assignAgent(territory) {
  const pool = AGENTS.filter(a => a.territory === territory)
  const list = pool.length ? pool : AGENTS
  return list[Math.floor(Math.random() * list.length)]
}

// ─── one-time demo seeding scoped to DEMO_ORG_ID ───
async function seedDemoLeadsIfEmpty(db) {
  const c = db.collection('leads')
  const n = await c.countDocuments({ orgId: DEMO_ORG_ID })
  if (n > 0) return
  const sources = ['website', 'facebook', 'google', 'whatsapp', 'referral']
  const territories = ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Chennai', 'Pune']
  const samples = [
    { name: 'Rahul Verma',  email: 'rahul@acmepharma.in', phone: '+919812345671', company: 'Acme Pharma',   message: 'Need a demo of LeadEdge360 for our 20 reps. Budget approved.', budget: 250000, whatsapp: true },
    { name: 'Sneha Patel',  email: 'sneha@bharatrealty.com', phone: '+919812345672', company: 'Bharat Realty', message: 'Interested in pricing for territory mapping.', budget: 120000, whatsapp: true },
    { name: 'Aditya Rao',   email: 'a.rao@swiftmart.com',  phone: '+919812345673', company: 'SwiftMart',    message: 'Looking to buy a CRM, please share quote.', budget: 80000,  whatsapp: false },
    { name: 'Meera Joshi',  email: 'meera@velofin.in',     phone: '+919812345674', company: 'VeloFin',      message: 'Just exploring options.', budget: 0,      whatsapp: false },
    { name: 'Karan Bhatia', email: 'karan@greenchem.in',   phone: '+919812345675', company: 'GreenChem',    message: 'Urgent! Need WhatsApp follow-up automation by next week.', budget: 350000, whatsapp: true },
    { name: 'Pooja Shah',   email: 'pooja@novaedu.com',    phone: '+919812345676', company: 'NovaEdu',      message: 'Want a trial.', budget: 30000,  whatsapp: true },
    { name: 'Sahil Khan',   email: 'sahil@trinityauto.in', phone: '+919812345677', company: 'Trinity Auto', message: 'Ready to buy. Decision this week.', budget: 500000, whatsapp: true },
    { name: 'Ishita Sen',   email: 'ishita@lotusclinic.in',phone: '+919812345678', company: 'Lotus Clinic', message: 'Curious how AI scoring works.', budget: 0,      whatsapp: false },
  ]
  const now = Date.now()
  const docs = []
  for (let i = 0; i < samples.length; i++) {
    const s = samples[i]
    const territory = territories[i % territories.length]
    const source = sources[i % sources.length]
    const lead = { ...s, source, territory }
    const sc = await aiScore(lead)
    const agent = assignAgent(territory)
    docs.push({
      id: uuid(), orgId: DEMO_ORG_ID,
      ...lead,
      score: sc.score, label: sc.label, reasons: sc.reasons, engine: sc.engine,
      status: STATUSES[i % 6],
      assignedTo: agent.name, assignedAgentId: agent.id,
      createdAt: new Date(now - (samples.length - i) * 86400000 * 1.5).toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }
  await c.insertMany(docs)
}

async function seedDemoProductsIfEmpty(db) {
  const c = db.collection('products')
  const n = await c.countDocuments({ orgId: DEMO_ORG_ID })
  if (n > 0) return
  const samples = [
    { name: 'Amul Gold Milk 1L',          sku: 'DAIRY-001', category: 'dairy',     price: 70,   stock: 240, daysOnShelf: 3,  expiryDate: addDays(5),  store: 'Bengaluru-01' },
    { name: 'Britannia Brown Bread',       sku: 'BAK-014',   category: 'bakery',    price: 45,   stock: 110, daysOnShelf: 2,  expiryDate: addDays(3),  store: 'Bengaluru-01' },
    { name: 'Tropicana Orange Juice 1L',   sku: 'BEV-202',   category: 'beverage',  price: 120,  stock: 80,  daysOnShelf: 12, expiryDate: addDays(60), store: 'Mumbai-02' },
    { name: 'Crocin Advance 500mg 15s',    sku: 'PHR-330',   category: 'pharma',    price: 35,   stock: 320, daysOnShelf: 90, expiryDate: addDays(240),store: 'Delhi-03' },
    { name: 'Lakme 9to5 Lipstick Ruby',    sku: 'COSM-501',  category: 'cosmetic',  price: 540,  stock: 45,  daysOnShelf: 180,expiryDate: addDays(400),store: 'Delhi-03' },
    { name: 'Chicken Breast 500g',         sku: 'MEAT-09',   category: 'meat',      price: 280,  stock: 25,  daysOnShelf: 2,  expiryDate: addDays(2),  store: 'Hyderabad-04' },
    { name: 'Surf Excel Matic Top 1kg',    sku: 'HHD-77',    category: 'household', price: 230,  stock: 160, daysOnShelf: 20, expiryDate: addDays(540),store: 'Chennai-05' },
    { name: 'JBL Tune 110 Earphones',      sku: 'ELEC-12',   category: 'electronics',price: 999, stock: 30,  daysOnShelf: 60, expiryDate: addDays(1500),store: 'Bengaluru-01' },
    { name: 'Bananas Robusta 1kg',          sku: 'PROD-04',   category: 'produce',   price: 60,   stock: 95,  daysOnShelf: 1,  expiryDate: addDays(3),  store: 'Pune-06' },
  ]
  // Parallelize the LLM predictions to keep first-load snappy.
  const preds = await Promise.all(samples.map(s => predictShelfLife(s)))
  const docs = samples.map((s, i) => ({
    id: uuid(), orgId: DEMO_ORG_ID, ...s, ...preds[i],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  }))
  await c.insertMany(docs)
}

// One-time migration: ensure every doc without orgId is tagged demo-org so the
// pre-tenant data still shows up in the demo dashboard.
let migrationDone = false
async function ensureLegacyMigration(db) {
  if (migrationDone) return
  migrationDone = true
  await db.collection('leads').updateMany({ orgId: { $exists: false } }, { $set: { orgId: DEMO_ORG_ID } })
  await db.collection('products').updateMany({ orgId: { $exists: false } }, { $set: { orgId: DEMO_ORG_ID } })
}
function addDays(d) { const x = new Date(); x.setDate(x.getDate() + d); return x.toISOString() }

// ─── master router ───
async function route(method, segs, request) {
  const db = await getDb()
  const [root, id, action] = segs

  // public health
  if (!root) return json({ ok: true, name: 'AsoftechInsightz API', time: new Date().toISOString() })

  // ─────────────────────────  AUTH  ─────────────────────────
  if (root === 'auth') {
    // GET /api/auth/login → redirect to Emergent hosted login
    if (id === 'login' && method === 'GET') {
      if (!AUTH_CONFIGURED) {
        // Graceful fallback when keys aren't set yet
        return NextResponse.redirect(new URL('/signin?auth_error=not_configured', request.url))
      }
      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin}/api/auth/callback`
      return NextResponse.redirect(loginUrl(redirectUri))
    }
    // GET /api/auth/callback?session_id=...
    if (id === 'callback' && method === 'GET') {
      const sessionId = new URL(request.url).searchParams.get('session_id')
      if (!sessionId) return NextResponse.redirect(new URL('/?auth_error=missing_session', request.url))
      const data = await exchangeSessionId(sessionId)
      if (!data) return NextResponse.redirect(new URL('/?auth_error=exchange_failed', request.url))
      await ensureUserOrg(data.user)
      const res = NextResponse.redirect(new URL('/dashboard', request.url))
      res.cookies.set({
        name: 'emergent_session', value: data.session_token,
        httpOnly: true, secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7,
      })
      return res
    }
    // GET /api/auth/me
    if (id === 'me' && method === 'GET') {
      const tenant = await resolveTenant(request)
      const { user, isDemo } = tenant
      let billing = null
      if (user?.orgId && !isDemo) {
        billing = await getOrgBillingContext(db, user.orgId)
      }
      return json({
        user,
        isDemo,
        configured: AUTH_CONFIGURED,
        billing,
        features: {
          aeoServerProfile: process.env.AEO_SERVER_PROFILE === 'true',
          webJwtBridge: process.env.WEB_JWT_BRIDGE === 'true',
        },
      })
    }
    // POST /api/auth/logout
    if (id === 'logout' && method === 'POST') {
      const res = json({ ok: true })
      res.cookies.delete('emergent_session')
      return res
    }
    // POST /api/auth/dpdp-consent  — record DPDP Act consent
    if (id === 'dpdp-consent' && method === 'POST') {
      const { user } = await resolveTenant(request)
      if (!user) return err('Not signed in', 401)
      const body = await request.json()
      const consent = {
        accepted: true,
        acceptedAt: new Date().toISOString(),
        version: '1.0',
        ip: request.headers.get('x-forwarded-for') || '',
        ua: request.headers.get('user-agent') || '',
        ...body,
      }
      await db.collection('users').updateOne({ email: user.email }, { $set: { dpdpConsent: consent } })
      await db.collection('consent_log').insertOne({ id: uuid(), email: user.email, ...consent })
      return json({ ok: true, consent })
    }
    // Fall through to mobileRoute for /auth/register, /auth/verify-otp, /auth/login-password, etc.
    const mAuth = await mobileRoute({ root, id, action, segs, method, request })
    if (mAuth) return mAuth
    return err('Not found', 404)
  }

  // From here, every other route resolves the tenant first.
  const tenant = await resolveTenant(request)
  let { orgId } = tenant

  if (tenant.unauthenticated) {
    if (root === 'webhooks') {
      // n8n ingest — token auth, not session
    } else if (root === 'contact' && method === 'POST') {
      orgId = DEMO_ORG_ID
    } else {
      return err('Not signed in', 401)
    }
  }

  // Seed demo data only inside the demo org (non-production public demo)
  if (orgId === DEMO_ORG_ID && process.env.NODE_ENV !== 'production') {
    await ensureLegacyMigration(db)
    await Promise.all([
      seedDemoLeadsIfEmpty(db),
      seedDemoProductsIfEmpty(db),
    ])
  }

  // ─── Mobile / bridge API routes ───
  const hasBearer = (request.headers.get('authorization') || '').startsWith('Bearer ')
  const bridgeEnabled = isWebJwtBridgeEnabled()
  const dispatch = resolveAuthDispatch({ root, hasBearer, bridgeEnabled })

  if (dispatch === 'jwt') {
    const mobileJwt = await mobileRoute({ root, id, action, segs, method, request })
    if (mobileJwt) return mobileJwt
  } else if (dispatch === 'bridge') {
    const actorRes = await resolveWebActor(request)
    if (actorRes.error) return actorRes.error
    const bridged = await cookieBridgeRoute({ root, id, action, segs, method, request, user: actorRes.user })
    if (bridged) return bridged
    return err('Not found', 404)
  } else if (dispatch === 'bridge_disabled_404') {
    return err('Not found', 404)
  }

  const mobile = await mobileRoute({ root, id, action, segs, method, request })
  if (mobile) return mobile

  // ─────────────────────────  AGENTS  ─────────────────────────
  if (root === 'agents' && method === 'GET') return json({ agents: AGENTS })

  // ─────────────────────────  LEADS  ─────────────────────────
  if (root === 'leads') {
    const col = db.collection('leads')

    // GET /leads/sources → distinct sources for this tenant
    if (method === 'GET' && id === 'sources') {
      const list = await col.distinct('source', { orgId })
      return json({ sources: list.map(code => ({ code, name: code.charAt(0).toUpperCase() + code.slice(1) })) })
    }

    if (method === 'GET' && !id) {
      const url = new URL(request.url)
      const territory = url.searchParams.get('territory')
      const status = url.searchParams.get('status')
      const label = url.searchParams.get('label')
      const source = url.searchParams.get('source')
      const role = url.searchParams.get('role')
      const agentName = url.searchParams.get('agent')
      const assignedTo = url.searchParams.get('assignedTo')
      const search = url.searchParams.get('q')
      const from = url.searchParams.get('createdFrom')
      const to = url.searchParams.get('createdTo')
      const q = { orgId }
      if (territory && territory !== 'all') q.territory = territory
      if (status && status !== 'all') q.status = status
      if (label && label !== 'all') q.label = label
      if (source && source !== 'all') q.source = source.toLowerCase()
      if (role === 'agent' && agentName) q.assignedTo = agentName
      if (assignedTo) q.assignedTo = assignedTo
      if (from || to) q.createdAt = { ...(from ? { $gte: from } : {}), ...(to ? { $lte: to } : {}) }
      if (search) {
        const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
        q.$or = [{ name: rx }, { email: rx }, { phone: rx }, { company: rx }]
      }
      const sortRaw = url.searchParams.get('sort') || '-createdAt'
      const sortField = sortRaw.replace(/^-/, '')
      const sort = { [sortField]: sortRaw.startsWith('-') ? -1 : 1 }
      const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
      const pageSize = Math.min(200, parseInt(url.searchParams.get('pageSize') || '50'))
      const total = await col.countDocuments(q)
      const list = await col.find(q, { projection: { _id: 0 } }).sort(sort).skip((page - 1) * pageSize).limit(pageSize).toArray()
      return json({ leads: list, meta: { page, pageSize, total, hasMore: page * pageSize < total } })
    }
    if (method === 'POST' && !id) {
      const gate = await checkEntitlement(db, orgId, 'lead.create')
      if (!gate.allowed) return entitlementErr(gate)
      const body = await request.json()
      if (!body?.name || !body?.phone) return err('name and phone are required')
      const territory = body.territory || 'Bengaluru'
      const lead = {
        name: body.name, email: body.email || '', phone: body.phone,
        company: body.company || '', message: body.message || '',
        budget: Number(body.budget || 0), whatsapp: !!body.whatsapp,
        source: (body.source || 'website').toLowerCase(), territory,
      }
      const sc = await aiScore(lead)
      const agent = assignAgent(territory)
      const doc = {
        id: uuid(), orgId, ...lead,
        score: sc.score, label: sc.label, reasons: sc.reasons, engine: sc.engine,
        status: 'New',
        assignedTo: agent.name, assignedAgentId: agent.id,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      }
      await col.insertOne({ ...doc })
      delete doc._id
      return json({ lead: doc }, { status: 201 })
    }
    if (method === 'PATCH' && id) {
      const body = await request.json()
      const update = { updatedAt: new Date().toISOString() }
      if (body.status && STATUSES.includes(body.status)) update.status = body.status
      if (body.assignedTo) {
        const ag = AGENTS.find(a => a.name === body.assignedTo)
        update.assignedTo = body.assignedTo
        if (ag) update.assignedAgentId = ag.id
      }
      const r = await col.findOneAndUpdate({ id, orgId }, { $set: update }, { returnDocument: 'after', projection: { _id: 0 } })
      const updated = r?.value || r
      if (!updated) return err('Lead not found', 404)
      return json({ lead: updated })
    }
    if (method === 'DELETE' && id) {
      await col.deleteOne({ id, orgId })
      return json({ ok: true })
    }
    if (method === 'POST' && id && action === 'rescore') {
      const lead = await col.findOne({ id, orgId }, { projection: { _id: 0 } })
      if (!lead) return err('Lead not found', 404)
      const sc = await aiScore(lead)
      const r = await col.findOneAndUpdate({ id, orgId },
        { $set: { score: sc.score, label: sc.label, reasons: sc.reasons, engine: sc.engine, updatedAt: new Date().toISOString() } },
        { returnDocument: 'after', projection: { _id: 0 } })
      return json({ lead: r?.value || r })
    }

    // GET /leads/:id → details with activities + follow-ups
    if (method === 'GET' && id && !action) {
      const lead = await col.findOne({ id, orgId }, { projection: { _id: 0 } })
      if (!lead) return err('Lead not found', 404)
      const activities = await db.collection('lead_activities').find({ leadId: id, orgId }, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(50).toArray()
      const followups  = await db.collection('follow_ups').find({ leadId: id, orgId }, { projection: { _id: 0 } }).sort({ dueAt: 1 }).toArray()
      return json({ ...lead, lead, activities, followups })
    }

    // POST /leads/:id/status
    if (method === 'POST' && id && action === 'status') {
      const body = await request.json()
      if (!body.status || !STATUSES.includes(body.status))
        return err('Invalid status', 400)
      const r = await col.findOneAndUpdate({ id, orgId },
        { $set: { status: body.status, updatedAt: new Date().toISOString() } },
        { returnDocument: 'after', projection: { _id: 0 } })
      await db.collection('lead_activities').insertOne({
        id: uuid(), orgId, leadId: id, type: 'status_change',
        payload: { to: body.status, reason: body.reason || '' }, createdAt: new Date().toISOString(),
      })
      return json({ lead: r?.value || r })
    }

    // POST /leads/:id/assign
    if (method === 'POST' && id && action === 'assign') {
      const body = await request.json()
      let assignedTo = body.assignedTo
      if (body.userId && !assignedTo) {
        const u = await db.collection('users').findOne({ id: body.userId, orgId })
        if (u) assignedTo = u.fullName || u.email || u.name
      }
      if (!assignedTo) return err('assignedTo or userId required', 400)
      const ag = AGENTS.find(a => a.name === assignedTo)
      const r = await col.findOneAndUpdate({ id, orgId },
        { $set: { assignedTo, assignedAgentId: ag?.id, updatedAt: new Date().toISOString() } },
        { returnDocument: 'after', projection: { _id: 0 } })
      await db.collection('lead_activities').insertOne({
        id: uuid(), orgId, leadId: id, type: 'assigned',
        payload: { to: assignedTo }, createdAt: new Date().toISOString(),
      })
      return json({ lead: r?.value || r })
    }
  }

  // ─────────────────────────  KPIs (LeadEdge)  ─────────────────────────
  if (root === 'kpis' && method === 'GET') {
    const col = db.collection('leads')
    const url = new URL(request.url)
    const role = url.searchParams.get('role')
    const agentName = url.searchParams.get('agent')
    const q = { orgId, ...(role === 'agent' && agentName ? { assignedTo: agentName } : {}) }
    const leads = await col.find(q, { projection: { _id: 0 } }).toArray()
    const total = leads.length
    const qualified = leads.filter(l => ['Qualified', 'Proposal', 'Won'].includes(l.status)).length
    const won = leads.filter(l => l.status === 'Won').length
    const hot = leads.filter(l => l.label === 'Hot').length
    const conv = total ? Math.round((won / total) * 1000) / 10 : 0
    const avgScore = total ? Math.round(leads.reduce((s, l) => s + (l.score || 0), 0) / total) : 0

    const byTerr = {}; const byStatus = Object.fromEntries(STATUSES.map(s => [s, 0]))
    const bySource = {}; const byAgent = {}
    for (const l of leads) {
      byTerr[l.territory] = (byTerr[l.territory] || 0) + 1
      byStatus[l.status] = (byStatus[l.status] || 0) + 1
      bySource[l.source] = (bySource[l.source] || 0) + 1
      const k = l.assignedTo || 'Unassigned'
      byAgent[k] = byAgent[k] || { name: k, leads: 0, won: 0 }
      byAgent[k].leads += 1
      if (l.status === 'Won') byAgent[k].won += 1
    }
    const days = 14
    const trend = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0)
      const next = new Date(d); next.setDate(next.getDate() + 1)
      const same = leads.filter(l => {
        const t = new Date(l.createdAt).getTime()
        return t >= d.getTime() && t < next.getTime()
      })
      trend.push({
        date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        leads: same.length, won: same.filter(l => l.status === 'Won').length,
      })
    }
    return json({
      total, qualified, won, hot, avgScore, conversion: conv,
      byTerritory: Object.entries(byTerr).map(([name, leads]) => ({ name, leads })),
      byStatus: Object.entries(byStatus).map(([name, value]) => ({ name, value })),
      bySource: Object.entries(bySource).map(([name, value]) => ({ name, value })),
      byAgent: Object.values(byAgent).map(a => ({ ...a, conversion: a.leads ? Math.round((a.won / a.leads) * 1000) / 10 : 0 })),
      trend,
    })
  }

  // ─────────────────────────  RETAILEDGE360 — PRODUCTS  ─────────────────────────
  if (root === 'products') {
    const col = db.collection('products')
    if (method === 'GET' && !id) {
      const list = await col.find({ orgId }, { projection: { _id: 0 } }).sort({ predictedShelfDays: 1 }).toArray()
      return json({ products: list })
    }
    if (method === 'POST' && !id) {
      const gate = await checkEntitlement(db, orgId, 'retail.create')
      if (!gate.allowed) return entitlementErr(gate)
      const body = await request.json()
      if (!body?.name || !body?.sku) return err('name and sku are required')
      const pred = await predictShelfLife(body)
      const doc = {
        id: uuid(), orgId,
        name: body.name, sku: body.sku, category: (body.category || 'other').toLowerCase(),
        price: Number(body.price || 0), stock: Number(body.stock || 0),
        daysOnShelf: Number(body.daysOnShelf || 0),
        expiryDate: body.expiryDate || addDays(30), store: body.store || 'Default Store',
        ...pred,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      }
      await col.insertOne({ ...doc })
      delete doc._id
      return json({ product: doc }, { status: 201 })
    }
    if (method === 'POST' && id && action === 'repredict') {
      const p = await col.findOne({ id, orgId }, { projection: { _id: 0 } })
      if (!p) return err('Product not found', 404)
      const pred = await predictShelfLife(p)
      const r = await col.findOneAndUpdate({ id, orgId },
        { $set: { ...pred, updatedAt: new Date().toISOString() } },
        { returnDocument: 'after', projection: { _id: 0 } })
      return json({ product: r?.value || r })
    }
    if (method === 'DELETE' && id) {
      await col.deleteOne({ id, orgId })
      return json({ ok: true })
    }
  }

  // ─── RetailEdge KPIs ───
  if (root === 'retail-kpis' && method === 'GET') {
    const products = await db.collection('products').find({ orgId }, { projection: { _id: 0 } }).toArray()
    const total = products.length
    const highRisk = products.filter(p => p.risk === 'High').length
    const medRisk  = products.filter(p => p.risk === 'Medium').length
    const lowRisk  = products.filter(p => p.risk === 'Low').length
    const inventoryValue = products.reduce((s, p) => s + (p.price || 0) * (p.stock || 0), 0)
    const atRiskValue = products
      .filter(p => p.risk === 'High')
      .reduce((s, p) => s + (p.price || 0) * (p.stock || 0), 0)
    const byCategory = {}
    for (const p of products) {
      byCategory[p.category] = byCategory[p.category] || { name: p.category, count: 0, value: 0 }
      byCategory[p.category].count += 1
      byCategory[p.category].value += (p.price || 0) * (p.stock || 0)
    }
    return json({
      total, highRisk, medRisk, lowRisk,
      inventoryValue, atRiskValue,
      savedSoFar: Math.round(atRiskValue * 0.65), // RevenueShield AI projection
      byRisk: [
        { name: 'High', value: highRisk },
        { name: 'Medium', value: medRisk },
        { name: 'Low', value: lowRisk },
      ],
      byCategory: Object.values(byCategory),
    })
  }

  // ─────────────────────────  BILLING (RAZORPAY)  ─────────────────────────
  if (root === 'billing') {
    if (id === 'plans' && method === 'GET') {
      return json({
        plans: PLANS,
        configured: RZP_CONFIGURED,
        testMode: process.env.BILLING_TEST_MODE === 'true',
      })
    }

    if (id === 'checkout' && method === 'POST') {
      if (!tenant.user || tenant.isDemo) return err('Not signed in', 401)
      const { planId } = await request.json()
      const plan = PLANS.find(p => p.id === planId)
      if (!plan || plan.custom) return err('Invalid plan or custom — please contact sales')
      const rzp = getRazorpay()
      if (!rzp) {
        return json({ error: 'razorpay-not-configured', fallback: '/contact' }, { status: 503 })
      }
      const order = await rzp.orders.create({
        amount: plan.price * 100,
        currency: plan.currency,
        receipt: `r_${Date.now()}`,
        notes: { planId: plan.id, orgId },
      })
      const paymentId = uuid()
      await db.collection('payments').insertOne({
        id: paymentId,
        orgId,
        userId: tenant.user.id,
        razorpay_order_id: order.id,
        amount: plan.price,
        plan: plan.id,
        status: 'created',
        createdAt: new Date().toISOString(),
      })
      return json({ order, key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, plan, paymentId })
    }

    if (id === 'verify' && method === 'POST') {
      if (!tenant.user || tenant.isDemo) return err('Not signed in', 401)
      const body = await request.json()
      const ok = verifyCheckoutSignature({
        order_id: body.razorpay_order_id,
        payment_id: body.razorpay_payment_id,
        signature: body.razorpay_signature,
      })
      if (!ok) return err('Invalid signature', 400)

      const pending = await db.collection('payments').findOne({ razorpay_order_id: body.razorpay_order_id })
      if (!pending) return err('Payment not found', 404)
      if (pending.orgId !== orgId) return err('Forbidden', 403)

      const result = await activatePaymentSuccess(db, {
        razorpay_order_id: body.razorpay_order_id,
        razorpay_payment_id: body.razorpay_payment_id,
        source: 'verify',
        actorUserId: tenant.user.id,
        request,
      })

      const planCode = result.subscription?.planCode || body.planId || 'growth'
      return json({
        ok: true,
        alreadyActivated: result.alreadyActivated,
        redirectUrl: `/billing/success?plan=${planCode}`,
        payment: result.payment,
        subscription: result.subscription,
        org: {
          plan: result.org?.plan,
          entitlements: {
            leadEnabled: result.entitlements.leadEnabled,
            retailEnabled: result.entitlements.retailEnabled,
          },
        },
      })
    }

    if (id === 'status' && method === 'GET') {
      if (!tenant.user || tenant.isDemo) return err('Not signed in', 401)
      const billing = await getOrgBillingContext(db, orgId)
      return json(billing)
    }

    // Dev/staging only — simulates payment success without Razorpay UI
    if (id === 'simulate' && method === 'POST') {
      if (!isBillingSimulateAllowed()) return err('Not found', 404)
      if (!tenant.user || tenant.isDemo) return err('Not signed in', 401)
      const { planId = 'starter' } = await request.json()
      const plan = PLANS.find(p => p.id === planId)
      if (!plan || plan.custom) return err('Invalid plan', 400)

      const orderId = `order_test_${uuid()}`
      const paymentRowId = uuid()
      await db.collection('payments').insertOne({
        id: paymentRowId,
        orgId,
        userId: tenant.user.id,
        razorpay_order_id: orderId,
        amount: plan.price,
        plan: plan.id,
        status: 'created',
        createdAt: new Date().toISOString(),
        testMode: true,
      })

      const result = await activatePaymentSuccess(db, {
        razorpay_order_id: orderId,
        razorpay_payment_id: `pay_test_${uuid()}`,
        source: 'verify',
        actorUserId: tenant.user.id,
        request,
      })

      return json({
        ok: true,
        testMode: true,
        alreadyActivated: result.alreadyActivated,
        redirectUrl: `/billing/success?plan=${plan.id}`,
        payment: result.payment,
        subscription: result.subscription,
        org: {
          plan: result.org?.plan,
          entitlements: result.entitlements,
        },
      })
    }
  }

  // ─────────────────────────  WEBHOOKS  ─────────────────────────
  if (root === 'webhooks') {
    // Razorpay webhook (must use raw body for signature verification)
    if (id === 'razorpay' && method === 'POST') {
      const raw = await request.text()
      const sig = request.headers.get('x-razorpay-signature') || ''
      if (!verifyWebhookSignature(raw, sig)) return err('Invalid signature', 400)
      const evt = JSON.parse(raw)
      if (evt.event === 'order.paid' || evt.event === 'payment.captured') {
        const pay = evt.payload?.payment?.entity
        if (pay?.order_id) {
          try {
            await activatePaymentSuccess(db, {
              razorpay_order_id: pay.order_id,
              razorpay_payment_id: pay.id,
              source: 'webhook',
              actorUserId: null,
              request,
            })
          } catch (e) {
            console.error('[razorpay webhook] activation failed:', e.message)
          }
        }
      }
      return json({ ok: true })
    }

    // Generic lead-ingest webhooks (WhatsApp / Facebook / Google) called by n8n
    if (['whatsapp', 'facebook', 'google'].includes(id) && method === 'POST') {
      if (!isIngestWebhookAllowed(request)) return err('Unauthorized', 401)
      const body = await request.json()
      const targetOrgId = resolveWebhookOrgId(id)
      if (!targetOrgId) return err('Webhook org not configured', 503)
      const gate = await checkEntitlement(db, targetOrgId, 'lead.create')
      if (!gate.allowed) return entitlementErr(gate)
      const lead = {
        name: body.name || body.full_name || 'Unknown Lead',
        email: body.email || '',
        phone: body.phone || body.phone_number || body.wa_id || '',
        company: body.company || '',
        message: body.message || body.text || body.note || '',
        budget: Number(body.budget || 0),
        whatsapp: id === 'whatsapp' ? true : !!body.whatsapp,
        source: id,
        territory: body.territory || 'Bengaluru',
      }
      if (!lead.phone) return err('phone required', 400)
      const sc = await aiScore(lead)
      const agent = assignAgent(lead.territory)
      const doc = {
        id: uuid(), orgId: targetOrgId, ...lead,
        score: sc.score, label: sc.label, reasons: sc.reasons, engine: sc.engine,
        status: 'New', assignedTo: agent.name, assignedAgentId: agent.id,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        meta: { ...body, _source: id },
      }
      await db.collection('leads').insertOne({ ...doc })
      delete doc._id
      return json({ ok: true, lead: doc }, { status: 201 })
    }
  }

  // ─────────────────────────  CONTACT  ─────────────────────────
  if (root === 'contact' && method === 'POST') {
    const body = await request.json()
    if (!body?.email || !body?.message) return err('email and message are required')
    await db.collection('contact_requests').insertOne({
      id: uuid(), orgId, ...body, createdAt: new Date().toISOString(),
    })
    return json({ ok: true }, { status: 201 })
  }

  // ─────────────────────────  DEV  ─────────────────────────
  if (root === 'seed-reset' && method === 'POST') {
    await db.collection('leads').deleteMany({ orgId: DEMO_ORG_ID })
    await db.collection('products').deleteMany({ orgId: DEMO_ORG_ID })
    await seedDemoLeadsIfEmpty(db)
    await seedDemoProductsIfEmpty(db)
    return json({ ok: true, reseeded: true })
  }

  return err('Not found', 404)
}

export async function GET(req, { params })    { return route('GET', params.path || [], req) }
export async function POST(req, { params })   { return route('POST', params.path || [], req) }
export async function PATCH(req, { params })  { return route('PATCH', params.path || [], req) }
export async function PUT(req, { params })    { return route('PUT', params.path || [], req) }
export async function DELETE(req, { params }) { return route('DELETE', params.path || [], req) }
export async function OPTIONS() {
  const origin = getCorsAllowOrigin()
  const headers = {
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Webhook-Token',
  }
  if (origin) headers['Access-Control-Allow-Origin'] = origin
  return new NextResponse(null, { status: 204, headers })
}
