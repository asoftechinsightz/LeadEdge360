import { v4 as uuid } from 'uuid'
import { aiScore } from '@/lib/scoring'
import { DEMO_ORG_ID } from '@/lib/tenant'

const AGENTS = [
  { id: 'a1', name: 'Aarav Sharma', territory: 'Bengaluru' },
  { id: 'a2', name: 'Priya Iyer', territory: 'Bengaluru' },
  { id: 'a3', name: 'Rohan Mehta', territory: 'Mumbai' },
  { id: 'a4', name: 'Neha Kapoor', territory: 'Delhi NCR' },
  { id: 'a5', name: 'Vikram Singh', territory: 'Hyderabad' },
  { id: 'a6', name: 'Anjali Reddy', territory: 'Chennai' },
  { id: 'a7', name: 'Karthik Nair', territory: 'Pune' },
]

const STATUSES = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost']

function assignAgent(territory) {
  const pool = AGENTS.filter((a) => a.territory === territory)
  const list = pool.length ? pool : AGENTS
  return list[Math.floor(Math.random() * list.length)]
}

let migrationDone = false

export async function ensureLegacyMigration(db) {
  if (migrationDone) return
  migrationDone = true
  await db.collection('leads').updateMany({ orgId: { $exists: false } }, { $set: { orgId: DEMO_ORG_ID } })
  await db.collection('products').updateMany({ orgId: { $exists: false } }, { $set: { orgId: DEMO_ORG_ID } })
}

export async function seedDemoLeadsIfEmpty(db) {
  const c = db.collection('leads')
  const n = await c.countDocuments({ orgId: DEMO_ORG_ID })
  if (n > 0) return

  const sources = ['website', 'facebook', 'google', 'whatsapp', 'referral']
  const territories = ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Chennai', 'Pune']
  const samples = [
    { name: 'Rahul Verma', email: 'rahul@acmepharma.in', phone: '+919812345671', company: 'Acme Pharma', message: 'Need a demo of LeadEdge360 for our 20 reps. Budget approved.', budget: 250000, whatsapp: true },
    { name: 'Sneha Patel', email: 'sneha@bharatrealty.com', phone: '+919812345672', company: 'Bharat Realty', message: 'Interested in pricing for territory mapping.', budget: 120000, whatsapp: true },
    { name: 'Aditya Rao', email: 'a.rao@swiftmart.com', phone: '+919812345673', company: 'SwiftMart', message: 'Looking to buy a CRM, please share quote.', budget: 80000, whatsapp: false },
    { name: 'Meera Joshi', email: 'meera@velofin.in', phone: '+919812345674', company: 'VeloFin', message: 'Just exploring options.', budget: 0, whatsapp: false },
    { name: 'Karan Bhatia', email: 'karan@greenchem.in', phone: '+919812345675', company: 'GreenChem', message: 'Urgent! Need WhatsApp follow-up automation by next week.', budget: 350000, whatsapp: true },
    { name: 'Pooja Shah', email: 'pooja@novaedu.com', phone: '+919812345676', company: 'NovaEdu', message: 'Want a trial.', budget: 30000, whatsapp: true },
    { name: 'Sahil Khan', email: 'sahil@trinityauto.in', phone: '+919812345677', company: 'Trinity Auto', message: 'Ready to buy. Decision this week.', budget: 500000, whatsapp: true },
    { name: 'Ishita Sen', email: 'ishita@lotusclinic.in', phone: '+919812345678', company: 'Lotus Clinic', message: 'Curious how AI scoring works.', budget: 0, whatsapp: false },
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
      id: uuid(),
      orgId: DEMO_ORG_ID,
      ...lead,
      score: sc.score,
      label: sc.label,
      reasons: sc.reasons,
      engine: sc.engine,
      status: STATUSES[i % 6],
      assignedTo: agent.name,
      assignedAgentId: agent.id,
      createdAt: new Date(now - (samples.length - i) * 86400000 * 1.5).toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }
  await c.insertMany(docs)
}

/** Development-only demo data bootstrap (leads). */
export async function ensureDevDemoData(db) {
  if (process.env.NODE_ENV === 'production') return
  await ensureLegacyMigration(db)
  await seedDemoLeadsIfEmpty(db)
  const { seedDemoOpportunitiesIfEmpty } = await import('@/lib/opportunities/service')
  await seedDemoOpportunitiesIfEmpty(db)
  const { seedDemoCampaignsIfEmpty } = await import('@/lib/campaigns/campaigns')
  await seedDemoCampaignsIfEmpty(db)
  const { seedDemoProposalsIfEmpty } = await import('@/lib/proposals/service')
  await seedDemoProposalsIfEmpty(db)
  const { seedDemoRevenueIfEmpty } = await import('@/lib/revenue/service')
  await seedDemoRevenueIfEmpty(db)
  const { seedDemoCustomersIfEmpty } = await import('@/lib/customers/service')
  await seedDemoCustomersIfEmpty(db)
  const { seedDemoSubscriptionsIfEmpty, seedSubscriptionPlansIfEmpty } = await import('@/lib/subscriptions/service')
  await seedSubscriptionPlansIfEmpty(db)
  await seedDemoSubscriptionsIfEmpty(db)
  const { seedDemoPartnersIfEmpty } = await import('@/lib/partners/service')
  await seedDemoPartnersIfEmpty(db)
  const { setupPortalAccess } = await import('@/lib/portal/service')
  const demoCustomer = await db.collection('customers').findOne({ orgId: 'demo-org', email: 'billing@trinityauto.in' })
  if (demoCustomer) {
    await setupPortalAccess('demo-org', demoCustomer.id, { email: 'billing@trinityauto.in', password: 'Portal@2025' })
  }
}
