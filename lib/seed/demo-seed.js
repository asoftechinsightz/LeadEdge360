import { v4 as uuid } from 'uuid'
import { aiScore } from '@/lib/scoring'
import { normalizeLeadIndustry } from '@/lib/onboarding/onboarding-flow'

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
const SOURCES = ['website', 'facebook', 'google', 'whatsapp', 'referral']
const TERRITORIES = ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Chennai', 'Pune']

const INDUSTRY_SAMPLES = {
  retail: [
    { name: 'Rajesh Kirana', email: 'rajesh@shreestores.in', phone: '+919810011001', company: 'Shree General Stores', message: 'Need POS + inventory for 3 outlets.', budget: 180000, whatsapp: true },
    { name: 'Meena Patel', email: 'meena@citypharma.in', phone: '+919810011002', company: 'City Pharma', message: 'Expiry alerts and GST billing urgent.', budget: 95000, whatsapp: true },
    { name: 'Suresh Gupta', email: 'suresh@freshmart.in', phone: '+919810011003', company: 'FreshMart Retail', message: 'Comparing billing software options.', budget: 60000, whatsapp: false },
    { name: 'Anita Desai', email: 'anita@stylehub.in', phone: '+919810011004', company: 'StyleHub Boutique', message: 'Want barcode scanning demo.', budget: 45000, whatsapp: true },
    { name: 'Vikram Joshi', email: 'vikram@organicbasket.in', phone: '+919810011005', company: 'Organic Basket', message: 'Multi-store stock sync needed.', budget: 220000, whatsapp: true },
    { name: 'Pooja Nair', email: 'pooja@sweetcorner.in', phone: '+919810011006', company: 'Sweet Corner', message: 'Trial for festival season.', budget: 25000, whatsapp: true },
    { name: 'Arjun Singh', email: 'arjun@metroelectronics.in', phone: '+919810011007', company: 'Metro Electronics', message: 'Ready to buy this month.', budget: 310000, whatsapp: true },
    { name: 'Kavita Rao', email: 'kavita@homeessentials.in', phone: '+919810011008', company: 'Home Essentials', message: 'How does udhar tracking work?', budget: 0, whatsapp: false },
    { name: 'Deepak Verma', email: 'deepak@valuemart.in', phone: '+919810011009', company: 'ValueMart', message: 'Franchise rollout — 12 stores.', budget: 500000, whatsapp: true },
    { name: 'Sneha Iyer', email: 'sneha@greenleaf.in', phone: '+919810011010', company: 'GreenLeaf Organics', message: 'Exploring CRM for repeat customers.', budget: 75000, whatsapp: false },
  ],
  healthcare: [
    { name: 'Dr. Anil Mehta', email: 'anil@lotusclinic.in', phone: '+919820011001', company: 'Lotus Clinic', message: 'Patient follow-up automation.', budget: 120000, whatsapp: true },
    { name: 'Dr. Priya Shah', email: 'priya@careplus.in', phone: '+919820011002', company: 'CarePlus Diagnostics', message: 'Need appointment reminders via WhatsApp.', budget: 85000, whatsapp: true },
    { name: 'Ramesh Naidu', email: 'ramesh@wellpath.in', phone: '+919820011003', company: 'WellPath Hospital', message: 'Evaluating lead CRM for outreach.', budget: 400000, whatsapp: false },
    { name: 'Ishita Sen', email: 'ishita@ayurwell.in', phone: '+919820011004', company: 'AyurWell Centre', message: 'Curious how AI scoring works.', budget: 0, whatsapp: false },
    { name: 'Karan Bhatia', email: 'karan@medilab.in', phone: '+919820011005', company: 'MediLab Chain', message: 'Urgent demo for 5 branches.', budget: 280000, whatsapp: true },
    { name: 'Neha Kapoor', email: 'neha@smilecare.in', phone: '+919820011006', company: 'SmileCare Dental', message: 'Want trial for recall campaigns.', budget: 55000, whatsapp: true },
    { name: 'Aditya Rao', email: 'aditya@healthfirst.in', phone: '+919820011007', company: 'HealthFirst', message: 'Budget approved for Q3.', budget: 150000, whatsapp: true },
    { name: 'Meera Joshi', email: 'meera@lifeline.in', phone: '+919820011008', company: 'Lifeline Nursing', message: 'Just exploring options.', budget: 0, whatsapp: false },
    { name: 'Sahil Khan', email: 'sahil@pharmacare.in', phone: '+919820011009', company: 'PharmaCare Distributors', message: 'Decision this week.', budget: 320000, whatsapp: true },
    { name: 'Pooja Shah', email: 'pooja@novahealth.in', phone: '+919820011010', company: 'Nova Health Tech', message: 'Integration with existing EMR.', budget: 200000, whatsapp: false },
  ],
  real_estate: [
    { name: 'Rahul Verma', email: 'rahul@bharatrealty.com', phone: '+919830011001', company: 'Bharat Realty', message: 'Territory mapping for 8 agents.', budget: 250000, whatsapp: true },
    { name: 'Sneha Patel', email: 'sneha@skycity.in', phone: '+919830011002', company: 'SkyCity Developers', message: 'Site visit scheduling automation.', budget: 180000, whatsapp: true },
    { name: 'Aditya Rao', email: 'aditya@urbanhomes.in', phone: '+919830011003', company: 'Urban Homes', message: 'Need pricing for 15 reps.', budget: 120000, whatsapp: false },
    { name: 'Karan Bhatia', email: 'karan@greentowers.in', phone: '+919830011004', company: 'Green Towers', message: 'Hot leads from Facebook ads.', budget: 350000, whatsapp: true },
    { name: 'Meera Joshi', email: 'meera@nestproperties.in', phone: '+919830011005', company: 'Nest Properties', message: 'Exploring CRM options.', budget: 0, whatsapp: false },
    { name: 'Vikram Singh', email: 'vikram@primeestate.in', phone: '+919830011006', company: 'Prime Estate', message: 'Ready to sign this quarter.', budget: 500000, whatsapp: true },
    { name: 'Anjali Reddy', email: 'anjali@lakeview.in', phone: '+919830011007', company: 'Lakeview Villas', message: 'Proposal for NRI channel.', budget: 90000, whatsapp: true },
    { name: 'Rohan Mehta', email: 'rohan@metrolease.in', phone: '+919830011008', company: 'Metro Lease', message: 'Commercial leasing pipeline.', budget: 140000, whatsapp: false },
    { name: 'Neha Kapoor', email: 'neha@heritagehomes.in', phone: '+919830011009', company: 'Heritage Homes', message: 'Urgent WhatsApp follow-ups.', budget: 210000, whatsapp: true },
    { name: 'Aarav Sharma', email: 'aarav@plotline.in', phone: '+919830011010', company: 'Plotline Realty', message: 'Want AI lead scoring demo.', budget: 75000, whatsapp: true },
  ],
  education: [
    { name: 'Pooja Shah', email: 'pooja@novaedu.com', phone: '+919840011001', company: 'NovaEdu', message: 'Want a trial for admissions.', budget: 30000, whatsapp: true },
    { name: 'Sahil Khan', email: 'sahil@brightminds.in', phone: '+919840011002', company: 'BrightMinds Academy', message: 'Demo scheduling for parents.', budget: 65000, whatsapp: true },
    { name: 'Ishita Sen', email: 'ishita@skillforge.in', phone: '+919840011003', company: 'SkillForge', message: 'Lead nurture for course launches.', budget: 110000, whatsapp: false },
    { name: 'Karthik Nair', email: 'karthik@edutech.in', phone: '+919840011004', company: 'EduTech Labs', message: 'Budget approved for CRM.', budget: 200000, whatsapp: true },
    { name: 'Meera Joshi', email: 'meera@globalprep.in', phone: '+919840011005', company: 'Global Prep', message: 'Comparing 3 vendors.', budget: 0, whatsapp: false },
    { name: 'Aditya Rao', email: 'aditya@codecamp.in', phone: '+919840011006', company: 'CodeCamp India', message: 'WhatsApp inquiry automation.', budget: 85000, whatsapp: true },
    { name: 'Neha Kapoor', email: 'neha@wisdomschool.in', phone: '+919840011007', company: 'Wisdom School', message: '15 counsellors need pipeline view.', budget: 175000, whatsapp: true },
    { name: 'Rahul Verma', email: 'rahul@learnhub.in', phone: '+919840011008', company: 'LearnHub', message: 'Trial before academic year.', budget: 40000, whatsapp: true },
    { name: 'Sneha Patel', email: 'sneha@masterclass.in', phone: '+919840011009', company: 'MasterClass Coaching', message: 'Decision by end of month.', budget: 95000, whatsapp: true },
    { name: 'Vikram Singh', email: 'vikram@futureu.in', phone: '+919840011010', company: 'FutureU', message: 'AI scoring for inquiry quality.', budget: 130000, whatsapp: false },
  ],
  manufacturing: [
    { name: 'Karan Bhatia', email: 'karan@greenchem.in', phone: '+919850011001', company: 'GreenChem Industries', message: 'Urgent distributor lead tracking.', budget: 350000, whatsapp: true },
    { name: 'Sahil Khan', email: 'sahil@trinityauto.in', phone: '+919850011002', company: 'Trinity Auto Parts', message: 'Ready to buy. Decision this week.', budget: 500000, whatsapp: true },
    { name: 'Rahul Verma', email: 'rahul@acmepharma.in', phone: '+919850011003', company: 'Acme Pharma', message: 'Need demo for 20 field reps.', budget: 250000, whatsapp: true },
    { name: 'Aditya Rao', email: 'a.rao@swiftmart.com', phone: '+919850011004', company: 'Swift Components', message: 'RFQ pipeline management.', budget: 80000, whatsapp: false },
    { name: 'Meera Joshi', email: 'meera@velofin.in', phone: '+919850011005', company: 'VeloFin Metals', message: 'Exploring CRM options.', budget: 0, whatsapp: false },
    { name: 'Priya Iyer', email: 'priya@precision.in', phone: '+919850011006', company: 'Precision Tools', message: 'Export lead qualification.', budget: 190000, whatsapp: true },
    { name: 'Rohan Mehta', email: 'rohan@steelcore.in', phone: '+919850011007', company: 'SteelCore', message: 'Territory planning for dealers.', budget: 420000, whatsapp: true },
    { name: 'Anjali Reddy', email: 'anjali@packpro.in', phone: '+919850011008', company: 'PackPro', message: 'Proposal automation needed.', budget: 145000, whatsapp: false },
    { name: 'Neha Kapoor', email: 'neha@buildmat.in', phone: '+919850011009', company: 'BuildMat Supplies', message: 'Hot leads from trade show.', budget: 275000, whatsapp: true },
    { name: 'Aarav Sharma', email: 'aarav@flowtech.in', phone: '+919850011010', company: 'FlowTech Pumps', message: 'Trial for service team.', budget: 70000, whatsapp: true },
  ],
  saas: [
    { name: 'Rahul Verma', email: 'rahul@acmepharma.in', phone: '+919860011001', company: 'Acme SaaS', message: 'Need demo for our 20 reps.', budget: 250000, whatsapp: true },
    { name: 'Sneha Patel', email: 'sneha@cloudstack.in', phone: '+919860011002', company: 'CloudStack', message: 'PLG to sales handoff automation.', budget: 180000, whatsapp: true },
    { name: 'Aditya Rao', email: 'a.rao@swiftmart.com', phone: '+919860011003', company: 'SwiftMart Tech', message: 'Looking to buy a CRM.', budget: 80000, whatsapp: false },
    { name: 'Meera Joshi', email: 'meera@velofin.in', phone: '+919860011004', company: 'VeloFin', message: 'Just exploring options.', budget: 0, whatsapp: false },
    { name: 'Karan Bhatia', email: 'karan@greenchem.in', phone: '+919860011005', company: 'GreenAPI', message: 'Urgent WhatsApp follow-up automation.', budget: 350000, whatsapp: true },
    { name: 'Pooja Shah', email: 'pooja@novaedu.com', phone: '+919860011006', company: 'NovaEdu Platform', message: 'Want a trial.', budget: 30000, whatsapp: true },
    { name: 'Sahil Khan', email: 'sahil@trinityauto.in', phone: '+919860011007', company: 'Trinity Systems', message: 'Decision this week.', budget: 500000, whatsapp: true },
    { name: 'Ishita Sen', email: 'ishita@lotusclinic.in', phone: '+919860011008', company: 'Lotus HealthTech', message: 'Curious how AI scoring works.', budget: 0, whatsapp: false },
    { name: 'Vikram Singh', email: 'vikram@dataflow.in', phone: '+919860011009', company: 'DataFlow', message: 'Series A — scaling sales team.', budget: 600000, whatsapp: true },
    { name: 'Neha Kapoor', email: 'neha@pixelworks.in', phone: '+919860011010', company: 'PixelWorks', message: 'Inbound lead routing.', budget: 95000, whatsapp: true },
  ],
  hospitality: [
    { name: 'Arjun Malhotra', email: 'arjun@grandstay.in', phone: '+919870011001', company: 'GrandStay Hotels', message: 'Group booking inquiry automation.', budget: 220000, whatsapp: true },
    { name: 'Kavita Desai', email: 'kavita@spicegarden.in', phone: '+919870011002', company: 'Spice Garden Restaurants', message: 'Event catering leads pipeline.', budget: 75000, whatsapp: true },
    { name: 'Rohan Mehta', email: 'rohan@wanderlust.in', phone: '+919870011003', company: 'Wanderlust Travel', message: 'Seasonal campaign follow-ups.', budget: 110000, whatsapp: false },
    { name: 'Anjali Reddy', email: 'anjali@coastalresort.in', phone: '+919870011004', company: 'Coastal Resort', message: 'WhatsApp concierge for guests.', budget: 160000, whatsapp: true },
    { name: 'Vikram Singh', email: 'vikram@urbancafe.in', phone: '+919870011005', company: 'Urban Café Chain', message: 'Franchise inquiry tracking.', budget: 90000, whatsapp: true },
    { name: 'Meera Joshi', email: 'meera@retreatspa.in', phone: '+919870011006', company: 'Retreat Spa', message: 'Exploring CRM.', budget: 0, whatsapp: false },
    { name: 'Aditya Rao', email: 'aditya@skylinehotels.in', phone: '+919870011007', company: 'Skyline Hotels', message: 'Corporate tie-up leads.', budget: 340000, whatsapp: true },
    { name: 'Sneha Patel', email: 'sneha@foodtrails.in', phone: '+919870011008', company: 'Food Trails', message: 'Festival pop-up bookings.', budget: 45000, whatsapp: true },
    { name: 'Karan Bhatia', email: 'karan@heritageinn.in', phone: '+919870011009', company: 'Heritage Inn', message: 'OTA lead consolidation.', budget: 185000, whatsapp: false },
    { name: 'Pooja Shah', email: 'pooja@eventique.in', phone: '+919870011010', company: 'Eventique', message: 'Wedding season pipeline.', budget: 130000, whatsapp: true },
  ],
  bfsi: [
    { name: 'Ramesh Iyer', email: 'ramesh@securebank.in', phone: '+919880011001', company: 'SecureBank', message: 'Wealth advisory lead routing.', budget: 450000, whatsapp: false },
    { name: 'Priya Nambiar', email: 'priya@coverall.in', phone: '+919880011002', company: 'CoverAll Insurance', message: 'Policy renewal campaigns.', budget: 280000, whatsapp: true },
    { name: 'Amit Khanna', email: 'amit@finbridge.in', phone: '+919880011003', company: 'FinBridge', message: 'Loan application follow-ups.', budget: 320000, whatsapp: true },
    { name: 'Neha Kapoor', email: 'neha@capitalone.in', phone: '+919880011004', company: 'CapitalOne NBFC', message: 'Compliance-ready CRM demo.', budget: 500000, whatsapp: false },
    { name: 'Vikram Singh', email: 'vikram@trustinvest.in', phone: '+919880011005', company: 'Trust Invest', message: 'HNI lead scoring.', budget: 175000, whatsapp: true },
    { name: 'Meera Joshi', email: 'meera@microfund.in', phone: '+919880011006', company: 'MicroFund', message: 'Field agent pipeline.', budget: 95000, whatsapp: true },
    { name: 'Aditya Rao', email: 'aditya@payease.in', phone: '+919880011007', company: 'PayEase', message: 'Merchant onboarding leads.', budget: 210000, whatsapp: true },
    { name: 'Sahil Khan', email: 'sahil@shieldlife.in', phone: '+919880011008', company: 'Shield Life', message: 'Agency recruitment pipeline.', budget: 140000, whatsapp: false },
    { name: 'Ishita Sen', email: 'ishita@credwise.in', phone: '+919880011009', company: 'CredWise', message: 'Exploring AI scoring.', budget: 0, whatsapp: false },
    { name: 'Karan Bhatia', email: 'karan@unionmf.in', phone: '+919880011010', company: 'Union Mutual', message: 'SIP campaign leads.', budget: 260000, whatsapp: true },
  ],
  general: [
    { name: 'Rahul Verma', email: 'rahul@acmepharma.in', phone: '+919812345671', company: 'Acme Pharma', message: 'Need a demo for our 20 reps. Budget approved.', budget: 250000, whatsapp: true },
    { name: 'Sneha Patel', email: 'sneha@bharatrealty.com', phone: '+919812345672', company: 'Bharat Realty', message: 'Interested in pricing for territory mapping.', budget: 120000, whatsapp: true },
    { name: 'Aditya Rao', email: 'a.rao@swiftmart.com', phone: '+919812345673', company: 'SwiftMart', message: 'Looking to buy a CRM, please share quote.', budget: 80000, whatsapp: false },
    { name: 'Meera Joshi', email: 'meera@velofin.in', phone: '+919812345674', company: 'VeloFin', message: 'Just exploring options.', budget: 0, whatsapp: false },
    { name: 'Karan Bhatia', email: 'karan@greenchem.in', phone: '+919812345675', company: 'GreenChem', message: 'Urgent! Need WhatsApp follow-up automation.', budget: 350000, whatsapp: true },
    { name: 'Pooja Shah', email: 'pooja@novaedu.com', phone: '+919812345676', company: 'NovaEdu', message: 'Want a trial.', budget: 30000, whatsapp: true },
    { name: 'Sahil Khan', email: 'sahil@trinityauto.in', phone: '+919812345677', company: 'Trinity Auto', message: 'Ready to buy. Decision this week.', budget: 500000, whatsapp: true },
    { name: 'Ishita Sen', email: 'ishita@lotusclinic.in', phone: '+919812345678', company: 'Lotus Clinic', message: 'Curious how AI scoring works.', budget: 0, whatsapp: false },
    { name: 'Vikram Singh', email: 'vikram@dataflow.in', phone: '+919812345679', company: 'DataFlow', message: 'Inbound lead routing for growth team.', budget: 180000, whatsapp: true },
    { name: 'Neha Kapoor', email: 'neha@pixelworks.in', phone: '+919812345680', company: 'PixelWorks', message: 'Comparing CRM vendors this month.', budget: 95000, whatsapp: true },
  ],
}

function assignAgent(territory) {
  const pool = AGENTS.filter((a) => a.territory === territory)
  const list = pool.length ? pool : AGENTS
  return list[Math.floor(Math.random() * list.length)]
}

function getIndustrySamples(industry) {
  const key = normalizeLeadIndustry(industry)
  return INDUSTRY_SAMPLES[key] || INDUSTRY_SAMPLES.general
}

/**
 * Seed 10 sample leads, 1 pipeline opportunity, and 1 proposal for a new org.
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 * @param {{ industry?: string, companyName?: string }} [options]
 */
export async function seedOrgDemoData(db, orgId, options = {}) {
  const industry = normalizeLeadIndustry(options.industry)
  const existing = await db.collection('leads').countDocuments({ orgId })
  if (existing > 0) {
    const pipelineCount = await db.collection('opportunities').countDocuments({ orgId })
    const proposalCount = await db.collection('proposals').countDocuments({ orgId })
    return {
      skipped: true,
      leads: existing,
      pipeline: pipelineCount,
      proposal: proposalCount,
      industry,
    }
  }

  const samples = getIndustrySamples(industry)
  const now = Date.now()
  const docs = []

  for (let i = 0; i < samples.length; i++) {
    const s = samples[i]
    const territory = TERRITORIES[i % TERRITORIES.length]
    const source = SOURCES[i % SOURCES.length]
    const lead = { ...s, source, territory }
    const sc = await aiScore(lead)
    const agent = assignAgent(territory)
    docs.push({
      id: uuid(),
      orgId,
      ...lead,
      score: sc.score,
      label: sc.label,
      reasons: sc.reasons,
      engine: sc.engine,
      status: STATUSES[i % STATUSES.length],
      assignedTo: agent.name,
      assignedAgentId: agent.id,
      isDemoSeed: true,
      demoIndustry: industry,
      createdAt: new Date(now - (samples.length - i) * 86400000 * 1.5).toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }

  await db.collection('leads').insertMany(docs)

  const { ensureOpportunityForLead } = await import('@/lib/opportunities/service')
  const pipelineLead = docs.find((l) => l.status === 'Qualified') || docs[0]
  const opp = await ensureOpportunityForLead(db, orgId, pipelineLead)

  await db.collection('proposal_templates').updateOne(
    { orgId },
    {
      $setOnInsert: {
        orgId,
        name: 'Standard Proposal',
        body: 'Thank you for your interest. We look forward to partnering with you.',
        createdAt: new Date(),
      },
    },
    { upsert: true },
  )

  const catalogCount = await db.collection('catalogs').countDocuments({ orgId })
  if (catalogCount === 0) {
    await db.collection('catalogs').insertMany([
      { orgId, name: 'LeadEdge360 Business', price: 14999, createdAt: new Date() },
      { orgId, name: 'Implementation', price: 25000, createdAt: new Date() },
    ])
  }

  const { autoGenerateProposalFromLead } = await import('@/lib/proposals/service')
  const proposalLead = docs.find((l) => (l.score || 0) >= 70) || pipelineLead
  let proposal = null
  try {
    proposal = await autoGenerateProposalFromLead(orgId, proposalLead.id)
  } catch (e) {
    console.warn('[demo-seed] proposal generation skipped:', e.message)
  }

  return {
    skipped: false,
    leadsCreated: docs.length,
    leads: docs.length,
    pipeline: opp ? 1 : 0,
    proposal: proposal ? 1 : 0,
    industry,
    highlightedLeads: docs.slice(0, 5).map((l) => ({ id: l.id, name: l.name, score: l.score })),
  }
}

/**
 * Remove demo-seeded records for an org (leads flagged isDemoSeed).
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 */
export async function clearOrgDemoData(db, orgId) {
  const demoLeads = await db.collection('leads')
    .find({ orgId, isDemoSeed: true }, { projection: { id: 1 } })
    .toArray()
  const leadIds = demoLeads.map((l) => l.id)

  if (!leadIds.length) {
    return { cleared: false, leadsRemoved: 0, opportunitiesRemoved: 0, proposalsRemoved: 0 }
  }

  const oppResult = await db.collection('opportunities').deleteMany({
    orgId,
    leadId: { $in: leadIds },
  })
  const proposalResult = await db.collection('proposals').deleteMany({
    orgId,
    leadId: { $in: leadIds },
    isDemoSeed: true,
  })
  const leadResult = await db.collection('leads').deleteMany({ orgId, isDemoSeed: true })

  await db.collection('onboarding_progress').updateOne(
    { orgId },
    {
      $set: {
        'leadQuickSetup.demoLeadsImported': false,
        updatedAt: new Date().toISOString(),
      },
    },
  )

  return {
    cleared: true,
    leadsRemoved: leadResult.deletedCount || 0,
    opportunitiesRemoved: oppResult.deletedCount || 0,
    proposalsRemoved: proposalResult.deletedCount || 0,
  }
}

export { normalizeLeadIndustry, getIndustrySamples }
