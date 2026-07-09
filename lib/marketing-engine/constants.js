/** AsoftechInsightz AI Marketing Engine — shared constants */

export const PRODUCTS = {
  LEADEDGE360: {
    id: 'leadedge360',
    name: 'LeadEdge360',
    tagline: 'Capture. Engage. Convert.',
    description: 'AI-powered CRM & revenue platform for growing businesses',
    cta: 'Book a free growth audit → asoftechinsightz.com/growth-audit',
    href: '/leadedge360',
  },
  RETAILEDGE360: {
    id: 'retailedge360',
    name: 'RetailEdge360',
    tagline: 'Smart Retail. Simplified Growth.',
    description: 'Retail intelligence, inventory & customer engagement in one suite',
    cta: 'See RetailEdge360 in action → asoftechinsightz.com/retailedge360',
    href: '/retailedge360',
  },
}

export const BRAND = {
  company: 'AsoftechInsightz',
  website: 'https://asoftechinsightz.com',
  email: 'admin@asoftechinsightz.com',
  demoCta: 'Book a Demo → asoftechinsightz.com/contact',
  promise: 'Innovate • Integrate • Deliver • Satisfy',
  primaryColor: '#0066FF',
  navy: '#0A1F44',
  darkGrey: '#333333',
  white: '#FFFFFF',
  logo: '/images/brand/asoftechinsightz-logo.png',
  logoSvg: '/images/brand/asoftechinsightz-logo.svg',
  fonts: ['Inter', 'Segoe UI', 'system-ui'],
  personality: ['Professional', 'Premium', 'Technology First', 'Enterprise Ready'],
}

/** Content mix — brand + product pitches (LeadEdge360 + RetailEdge360) */
export const CONTENT_STRATEGY_MIX = [
  { category: 'educational', weight: 25, label: 'Educational' },
  { category: 'product_pitch_leadedge', weight: 25, label: 'LeadEdge360 product pitch' },
  { category: 'product_pitch_retail', weight: 15, label: 'RetailEdge360 product pitch' },
  { category: 'product_demo', weight: 15, label: 'Product demonstrations' },
  { category: 'problem_solution', weight: 10, label: 'Problems & solutions' },
  { category: 'company_updates', weight: 5, label: 'AsoftechInsightz brand' },
  { category: 'industry_news', weight: 5, label: 'Industry news' },
]

/** Daily IST automation — AI Marketing Department schedule */
export const DAILY_AUTOMATION_IST = [
  { hour: 6, minute: 0, agentId: 'research-agent', job: 'research', label: 'Industry research' },
  { hour: 7, minute: 0, agentId: 'content-writer-agent', job: 'content', label: 'Generate today\'s content' },
  { hour: 8, minute: 0, agentId: 'graphic-designer-ai', job: 'graphics', label: 'Create graphics' },
  { hour: 9, minute: 0, agentId: 'reel-creator-agent', job: 'reel', label: 'Create reel script' },
  { hour: 10, minute: 0, agentId: 'social-publisher-ai', job: 'publish_linkedin', platform: 'linkedin', label: 'Publish LinkedIn' },
  { hour: 11, minute: 0, agentId: 'social-publisher-ai', job: 'publish_facebook', platform: 'facebook', label: 'Publish Facebook' },
  { hour: 12, minute: 0, agentId: 'social-publisher-ai', job: 'publish_instagram', platform: 'instagram', label: 'Publish Instagram' },
  { hour: 13, minute: 0, agentId: 'social-publisher-ai', job: 'publish_twitter', platform: 'twitter', label: 'Publish X' },
  { hour: 18, minute: 0, agentId: 'video-production-agent', job: 'publish_reel', platform: 'instagram', label: 'Publish Reel' },
  { hour: 20, minute: 0, agentId: 'analytics-agent', job: 'analytics', label: 'Collect analytics' },
  { hour: 21, minute: 0, agentId: 'ceo-marketing-agent', job: 'daily_report', label: 'Daily report' },
]

export const RESEARCH_TOPICS = [
  'AI', 'CRM', 'Business Automation', 'Sales', 'Digital Marketing',
  'Technology', 'SMBs', 'India Startup ecosystem',
]

export const TARGET_INDUSTRIES = [
  'Retail', 'Manufacturing', 'Healthcare', 'Education', 'Real Estate',
  'Financial Services', 'IT Services', 'Startups',
]

export const TARGET_PERSONAS = [
  'Business Owners', 'Sales Managers', 'Marketing Managers', 'IT Managers', 'CXOs',
]

export const PLATFORMS = [
  'linkedin',
  'facebook',
  'instagram',
  'twitter',
  'youtube_shorts',
  'google_business',
]

export const PUBLISH_SLOTS_IST = ['09:00', '12:00', '15:00', '18:00', '20:00']

export const CONTENT_TYPES = {
  LINKEDIN_POST: 'linkedin_post',
  FACEBOOK_POST: 'facebook_post',
  INSTAGRAM_POST: 'instagram_post',
  TWITTER_POST: 'twitter_post',
  BLOG: 'blog',
  CUSTOMER_SUCCESS: 'customer_success_story',
  INDUSTRY_NEWS: 'industry_news',
  PRODUCT_TIP: 'product_tip',
  INFOGRAPHIC: 'infographic',
  WHITEPAPER: 'whitepaper',
  CASE_STUDY: 'case_study',
}

/** Weekly planner quotas (Phase 1 — Sunday batch) */
export const WEEKLY_QUOTAS = [
  { type: CONTENT_TYPES.LINKEDIN_POST, count: 30, platform: 'linkedin', format: 'text' },
  { type: CONTENT_TYPES.FACEBOOK_POST, count: 30, platform: 'facebook', format: 'text' },
  { type: CONTENT_TYPES.INSTAGRAM_POST, count: 30, platform: 'instagram', format: 'text' },
  { type: CONTENT_TYPES.TWITTER_POST, count: 30, platform: 'twitter', format: 'text' },
  { type: CONTENT_TYPES.BLOG, count: 10, platform: 'blog', format: 'longform' },
  { type: CONTENT_TYPES.CUSTOMER_SUCCESS, count: 8, platform: 'linkedin', format: 'story' },
  { type: CONTENT_TYPES.INDUSTRY_NEWS, count: 10, platform: 'linkedin', format: 'news' },
  { type: CONTENT_TYPES.PRODUCT_TIP, count: 10, platform: 'instagram', format: 'tip' },
  { type: CONTENT_TYPES.INFOGRAPHIC, count: 10, platform: 'instagram', format: 'infographic' },
  { type: CONTENT_TYPES.WHITEPAPER, count: 5, platform: 'linkedin', format: 'whitepaper' },
  { type: CONTENT_TYPES.CASE_STUDY, count: 5, platform: 'linkedin', format: 'case_study' },
]

export const GRAPHIC_SPECS = {
  square: { width: 1080, height: 1080, format: 'png' },
  landscape: { width: 1920, height: 1080, format: 'png' },
}

export const VIDEO_DURATIONS_SEC = [30, 60, 90]

export const HASHTAG_POOLS = {
  leadedge360: [
    '#LeadEdge360', '#AICRM', '#SalesAutomation', '#B2BSaaS', '#RevenueGrowth',
    '#IndianSaaS', '#CRMIndia', '#LeadGeneration', '#AsoftechInsightz',
  ],
  retailedge360: [
    '#RetailEdge360', '#RetailTech', '#RetailAI', '#InventoryManagement',
    '#Omnichannel', '#IndianRetail', '#AsoftechInsightz',
  ],
  general: [
    '#DigitalTransformation', '#SMEGrowth', '#BusinessAutomation', '#SaaS',
  ],
}

export const LEAD_SOURCES = [
  'website', 'landing_page', 'google_forms', 'facebook_lead_ad', 'instagram_lead_ad',
  'linkedin_lead_form', 'whatsapp', 'email', 'google_maps', 'business_directory',
  'manual_upload', 'growth_audit', 'contact_form', 'qr_scan', 'business_card',
]

export const FOLLOW_UP_CADENCE_DAYS = [1, 3, 7, 15, 30]

export const COLLECTIONS = {
  CONTENT: 'marketing_content',
  CALENDAR: 'marketing_calendar',
  ASSETS: 'marketing_assets',
  VIDEO_BRIEFS: 'marketing_video_briefs',
  PUBLISH_QUEUE: 'marketing_publish_queue',
  PUBLISH_LOG: 'marketing_publish_log',
  CONFIG: 'marketing_engine_config',
  JOBS: 'marketing_engine_jobs',
  ANALYTICS: 'marketing_analytics_daily',
  RESEARCH: 'marketing_research_daily',
  REPORTS: 'marketing_reports',
  AGENT_RUNS: 'marketing_agent_runs',
  ENGAGEMENT: 'marketing_engagement_queue',
}
