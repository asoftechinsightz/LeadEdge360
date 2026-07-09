/**
 * AI Digital Marketing Employee — full agent registry
 * @see docs/platform/AI_DIGITAL_MARKETING_EMPLOYEE.md
 */

export const MARKETING_AGENTS = [
  {
    id: 'ceo-marketing-agent',
    name: 'CEO Marketing Agent',
    phase: 'core',
    schedule: 'daily_21_ist',
    description: 'Plans strategy, approves publishing queue, generates daily & monthly reports.',
    status: 'active',
  },
  {
    id: 'research-agent',
    name: 'Research Agent',
    phase: 'core',
    schedule: 'daily_06_ist',
    description: 'Morning industry research — AI, CRM, automation, SMB trends, India startup ecosystem.',
    status: 'active',
  },
  {
    id: 'content-writer-agent',
    name: 'Content Writer Agent',
    phase: 'core',
    schedule: 'daily_07_ist',
    description: 'LinkedIn, Facebook, Instagram, X, blogs, case studies — professional SEO-friendly tone.',
    status: 'active',
  },
  {
    id: 'graphic-designer-ai',
    name: 'Graphic Designer Agent',
    phase: 'core',
    schedule: 'daily_08_ist',
    description: 'Social creatives, carousels, infographics — AsoftechInsightz brand consistent.',
    status: 'active',
  },
  {
    id: 'reel-creator-agent',
    name: 'Reel Creator Agent',
    phase: 'core',
    schedule: 'daily_09_ist',
    description: '30–60s reel scripts: hook, problem, solution, CTA, voiceover, subtitles.',
    status: 'active',
  },
  {
    id: 'video-production-agent',
    name: 'Video Production Agent',
    phase: 'core',
    schedule: 'daily_18_ist',
    description: 'Reel/Shorts production briefs — logo animation, captions, end screen CTA.',
    status: 'active',
  },
  {
    id: 'social-publisher-ai',
    name: 'Publisher Agent',
    phase: 'core',
    schedule: 'hourly',
    description: 'Auto-publish LinkedIn, Facebook, Instagram, X, YouTube Shorts, Google Business.',
    status: 'active',
  },
  {
    id: 'engagement-agent',
    name: 'Engagement Agent',
    phase: 'core',
    schedule: 'every_2_hours',
    description: 'Monitor comments, messages, mentions — reply suggestions, escalate sales enquiries.',
    status: 'active',
  },
  {
    id: 'lead-capture-agent',
    name: 'Lead Capture Agent',
    phase: 'core',
    schedule: 'realtime',
    description: 'Social & web leads → LeadEdge360 with AI score + founder notification.',
    status: 'active',
  },
  {
    id: 'analytics-agent',
    name: 'Analytics Agent',
    phase: 'core',
    schedule: 'daily_20_ist',
    description: 'Followers, reach, engagement, leads, top content, best posting times.',
    status: 'active',
  },
  {
    id: 'marketing-planner-ai',
    name: 'Marketing Planner',
    phase: 1,
    schedule: 'weekly_sunday',
    description: 'Weekly content calendar batch (Sunday).',
    status: 'active',
  },
  {
    id: 'lead-ingest-ai',
    name: 'Lead Ingestion',
    phase: 2,
    schedule: 'every_30_min',
    description: 'Normalizes inbound leads from all channels into LeadEdge360.',
    status: 'active',
  },
  {
    id: 'lead-scoring-ai',
    name: 'Lead Scoring',
    phase: 3,
    schedule: 'on_lead_created',
    description: 'BANT + signals scoring — delegates to lead-qualification-ai.',
    status: 'active',
  },
  {
    id: 'followup-engine-ai',
    name: 'Follow-up Engine',
    phase: 5,
    schedule: 'daily',
    description: '1/3/7/15/30 day cadence until reply.',
    status: 'active',
  },
  {
    id: 'marketing-analyst-ai',
    name: 'Business Analyst',
    phase: 8,
    schedule: 'hourly',
    description: 'Aggregates marketing + sales analytics.',
    status: 'active',
  },
]

export function getMarketingAgent(id) {
  return MARKETING_AGENTS.find((a) => a.id === id)
}

export function getCoreMarketingTeam() {
  return MARKETING_AGENTS.filter((a) => a.phase === 'core')
}
