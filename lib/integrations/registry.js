/**
 * Integration catalog — Phases 1–2 fully implemented.
 */

export const AUTH_TYPES = {
  OAUTH2: 'oauth2',
  API_KEY: 'api_key',
  WEBHOOK: 'webhook',
  HYBRID: 'hybrid',
}

export const INTEGRATIONS = [
  // Phase 1
  {
    id: 'whatsapp',
    name: 'WhatsApp Business Cloud',
    phase: 1,
    category: 'messaging',
    authType: AUTH_TYPES.API_KEY,
    description: 'Unified WhatsApp inbox, templates, and outbound messaging.',
    docsUrl: 'https://developers.facebook.com/docs/whatsapp/cloud-api',
    implemented: true,
  },
  {
    id: 'razorpay',
    name: 'Razorpay',
    phase: 1,
    category: 'payments',
    authType: AUTH_TYPES.HYBRID,
    description: 'Payment collection, subscriptions, and webhook verification.',
    docsUrl: 'https://razorpay.com/docs',
    implemented: true,
  },
  {
    id: 'gmail',
    name: 'Gmail',
    phase: 1,
    category: 'email',
    authType: AUTH_TYPES.OAUTH2,
    description: 'Send and sync email from your workspace Gmail account.',
    oauthScopes: ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly'],
    implemented: true,
  },
  {
    id: 'microsoft365',
    name: 'Microsoft 365',
    phase: 1,
    category: 'email',
    authType: AUTH_TYPES.OAUTH2,
    description: 'Outlook mail and Microsoft Graph connectivity.',
    oauthScopes: ['https://graph.microsoft.com/Mail.Read', 'https://graph.microsoft.com/Mail.Send', 'offline_access'],
    implemented: true,
  },
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    phase: 1,
    category: 'calendar',
    authType: AUTH_TYPES.OAUTH2,
    description: 'Sync meetings and follow-ups with Google Calendar.',
    oauthScopes: ['https://www.googleapis.com/auth/calendar.events'],
    implemented: true,
  },
  // Phase 2
  {
    id: 'google_ads',
    name: 'Google Ads',
    phase: 2,
    category: 'ads',
    authType: AUTH_TYPES.OAUTH2,
    description: 'Campaign performance, lead forms, and ROI sync.',
    docsUrl: 'https://developers.google.com/google-ads/api',
    oauthScopes: ['https://www.googleapis.com/auth/adwords'],
    implemented: true,
  },
  {
    id: 'facebook_leads',
    name: 'Facebook Lead Ads',
    phase: 2,
    category: 'ads',
    authType: AUTH_TYPES.OAUTH2,
    description: 'Capture and sync Facebook Lead Ad submissions.',
    docsUrl: 'https://developers.facebook.com/docs/marketing-api/guides/lead-ads',
    oauthScopes: ['pages_show_list', 'pages_read_engagement', 'leads_retrieval', 'ads_read'],
    implemented: true,
  },
  {
    id: 'instagram',
    name: 'Instagram Business',
    phase: 2,
    category: 'social',
    authType: AUTH_TYPES.OAUTH2,
    description: 'Instagram Business profile and engagement sync.',
    docsUrl: 'https://developers.facebook.com/docs/instagram-api',
    oauthScopes: ['instagram_basic', 'instagram_manage_insights', 'pages_show_list', 'pages_read_engagement'],
    implemented: true,
  },
  {
    id: 'google_business',
    name: 'Google Business Profile',
    phase: 2,
    category: 'local',
    authType: AUTH_TYPES.OAUTH2,
    description: 'Reviews, locations, and local presence management.',
    docsUrl: 'https://developers.google.com/my-business',
    oauthScopes: ['https://www.googleapis.com/auth/business.manage'],
    implemented: true,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    phase: 2,
    category: 'social',
    authType: AUTH_TYPES.OAUTH2,
    description: 'LinkedIn lead capture and company page connectivity.',
    docsUrl: 'https://learn.microsoft.com/en-us/linkedin/',
    oauthScopes: ['openid', 'profile', 'email', 'w_member_social'],
    implemented: true,
  },
  // Phase 3
  { id: 'slack', name: 'Slack', phase: 3, category: 'collaboration', authType: AUTH_TYPES.OAUTH2, implemented: false },
  { id: 'teams', name: 'Microsoft Teams', phase: 3, category: 'collaboration', authType: AUTH_TYPES.OAUTH2, implemented: false },
  { id: 'zapier', name: 'Zapier', phase: 3, category: 'automation', authType: AUTH_TYPES.WEBHOOK, implemented: false },
  { id: 'n8n', name: 'n8n', phase: 3, category: 'automation', authType: AUTH_TYPES.WEBHOOK, implemented: false },
  // Phase 4
  { id: 'tally', name: 'Tally', phase: 4, category: 'accounting', authType: AUTH_TYPES.API_KEY, implemented: false },
  { id: 'zoho_books', name: 'Zoho Books', phase: 4, category: 'accounting', authType: AUTH_TYPES.OAUTH2, implemented: false },
  { id: 'quickbooks', name: 'QuickBooks', phase: 4, category: 'accounting', authType: AUTH_TYPES.OAUTH2, implemented: false },
  { id: 'xero', name: 'Xero', phase: 4, category: 'accounting', authType: AUTH_TYPES.OAUTH2, implemented: false },
  // Phase 5
  { id: 'openai', name: 'OpenAI', phase: 5, category: 'ai', authType: AUTH_TYPES.API_KEY, implemented: false },
  { id: 'gemini', name: 'Gemini', phase: 5, category: 'ai', authType: AUTH_TYPES.API_KEY, implemented: false },
  { id: 'claude', name: 'Claude', phase: 5, category: 'ai', authType: AUTH_TYPES.API_KEY, implemented: false },
  { id: 'deepseek', name: 'DeepSeek', phase: 5, category: 'ai', authType: AUTH_TYPES.API_KEY, implemented: false },
  { id: 'grok', name: 'Grok', phase: 5, category: 'ai', authType: AUTH_TYPES.API_KEY, implemented: false },
]

export function getIntegrationDef(id) {
  return INTEGRATIONS.find((i) => i.id === id) || null
}

export function listByPhase(phase) {
  return INTEGRATIONS.filter((i) => i.phase === phase)
}
