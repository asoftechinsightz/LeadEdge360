/**
 * Industry-specific AI profiles — recommended agents, skills, and workflows.
 */

export const INDUSTRY_PROFILES = {
  bfsi: {
    id: 'bfsi',
    name: 'BFSI',
    description: 'Banking, financial services, and insurance.',
    recommendedAgents: ['lead-qualification-ai', 'proposal-ai', 'finance-ai', 'revenue-intelligence-ai', 'churn-prediction-ai', 'ceo-ai'],
    recommendedSkills: ['risk_analysis', 'compliance_validation', 'revenue_forecasting'],
    workflows: ['lead_qualify → proposal → compliance_check → finance_review'],
    confidenceThreshold: 0.75,
    requiresApproval: ['proposal-ai', 'finance-ai'],
  },
  healthcare: {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'Hospitals, clinics, and health-tech.',
    recommendedAgents: ['lead-qualification-ai', 'customer-success-ai', 'document-ai', 'meeting-scheduler-ai', 'churn-prediction-ai'],
    recommendedSkills: ['compliance_validation', 'document_extraction', 'sentiment_analysis'],
    workflows: ['lead_qualify → onboarding → document_extraction'],
    confidenceThreshold: 0.8,
    requiresApproval: ['document-ai', 'meeting-scheduler-ai'],
  },
  manufacturing: {
    id: 'manufacturing',
    name: 'Manufacturing',
    description: 'Industrial and supply-chain businesses.',
    recommendedAgents: ['lead-qualification-ai', 'proposal-ai', 'sales-ai', 'finance-ai', 'revenue-intelligence-ai'],
    recommendedSkills: ['opportunity_analysis', 'proposal_writing', 'revenue_forecasting'],
    workflows: ['lead_qualify → opportunity → proposal → invoice'],
    confidenceThreshold: 0.65,
    requiresApproval: ['proposal-ai'],
  },
  retail: {
    id: 'retail',
    name: 'Retail',
    description: 'Retail and e-commerce.',
    recommendedAgents: ['marketing-ai', 'geo-scanner-ai', 'lead-qualification-ai', 'customer-success-ai', 'churn-prediction-ai'],
    recommendedSkills: ['customer_segmentation', 'territory_planning', 'sentiment_analysis'],
    workflows: ['campaign → lead_capture → qualification → retention'],
    confidenceThreshold: 0.6,
    requiresApproval: ['marketing-ai'],
  },
  education: {
    id: 'education',
    name: 'Education',
    description: 'EdTech, schools, and training providers.',
    recommendedAgents: ['lead-qualification-ai', 'marketing-ai', 'meeting-scheduler-ai', 'customer-success-ai', 'document-ai'],
    recommendedSkills: ['lead_analysis', 'proposal_writing', 'sentiment_analysis'],
    workflows: ['inquiry → demo_schedule → onboarding'],
    confidenceThreshold: 0.65,
    requiresApproval: ['meeting-scheduler-ai'],
  },
  hospitality: {
    id: 'hospitality',
    name: 'Hospitality',
    description: 'Hotels, restaurants, and travel.',
    recommendedAgents: ['lead-qualification-ai', 'marketing-ai', 'customer-success-ai', 'meeting-scheduler-ai', 'churn-prediction-ai'],
    recommendedSkills: ['sentiment_analysis', 'customer_segmentation', 'territory_planning'],
    workflows: ['inquiry → booking → follow_up → retention'],
    confidenceThreshold: 0.6,
    requiresApproval: [],
  },
  real_estate: {
    id: 'real_estate',
    name: 'Real Estate',
    description: 'Property sales, leasing, and development.',
    recommendedAgents: ['geo-scanner-ai', 'lead-qualification-ai', 'proposal-ai', 'meeting-scheduler-ai', 'sales-ai'],
    recommendedSkills: ['territory_planning', 'lead_analysis', 'proposal_writing'],
    workflows: ['geo_scan → qualify → site_visit → proposal'],
    confidenceThreshold: 0.65,
    requiresApproval: ['proposal-ai', 'meeting-scheduler-ai'],
  },
  government: {
    id: 'government',
    name: 'Government',
    description: 'Public sector and civic organizations.',
    recommendedAgents: ['document-ai', 'lead-qualification-ai', 'proposal-ai', 'compliance-ai', 'ceo-ai'],
    recommendedSkills: ['compliance_validation', 'document_extraction', 'risk_analysis'],
    workflows: ['tender_intake → compliance → proposal → approval'],
    confidenceThreshold: 0.85,
    requiresApproval: ['proposal-ai', 'document-ai', 'finance-ai'],
  },
  it_services: {
    id: 'it_services',
    name: 'IT Services',
    description: 'Software, consulting, and managed services.',
    recommendedAgents: ['lead-qualification-ai', 'proposal-ai', 'sales-ai', 'revenue-intelligence-ai', 'document-ai', 'ceo-ai'],
    recommendedSkills: ['lead_analysis', 'proposal_writing', 'revenue_forecasting', 'opportunity_analysis'],
    workflows: ['lead_qualify → discovery → proposal → delivery'],
    confidenceThreshold: 0.7,
    requiresApproval: ['proposal-ai'],
  },
}

export function listIndustryProfiles() {
  return Object.values(INDUSTRY_PROFILES)
}

export function getIndustryProfile(profileId) {
  return INDUSTRY_PROFILES[profileId] || null
}

export async function applyIndustryProfile(db, orgId, profileId) {
  const profile = getIndustryProfile(profileId)
  if (!profile) throw new Error(`Unknown industry profile: ${profileId}`)

  const agents = {}
  for (const agentId of profile.recommendedAgents) {
    agents[agentId] = {
      enabled: true,
      requiresApproval: profile.requiresApproval?.includes(agentId) ?? undefined,
    }
  }

  const now = new Date().toISOString()
  await db.collection('org_industry_profile').updateOne(
    { orgId },
    {
      $set: {
        orgId,
        profileId: profile.id,
        profileName: profile.name,
        recommendedAgents: profile.recommendedAgents,
        recommendedSkills: profile.recommendedSkills,
        workflows: profile.workflows,
        appliedAt: now,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true },
  )

  await db.collection('org_ai_settings').updateOne(
    { orgId },
    {
      $set: {
        industryProfile: profile.id,
        confidenceThreshold: profile.confidenceThreshold,
        agents,
        updatedAt: now,
      },
      $setOnInsert: { orgId, createdAt: now, enabled: true },
    },
    { upsert: true },
  )

  return { profile, agentsApplied: Object.keys(agents).length }
}

export async function getOrgIndustryProfile(db, orgId) {
  const doc = await db.collection('org_industry_profile').findOne({ orgId }, { projection: { _id: 0 } })
  if (!doc) return null
  return { ...doc, profile: getIndustryProfile(doc.profileId) }
}
