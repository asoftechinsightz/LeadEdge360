/**
 * Canonical LeadEdge360 + RetailEdge360 module registry for Enterprise QA.
 */
export const MODULES = [
  // ─── CRM Core ─────────────────────────────────────────────────────────────
  { id: 'crm-leads', name: 'Leads', area: 'CRM', route: '/leads', apis: ['GET /api/leads', 'POST /api/leads', 'PATCH /api/leads/:id'], pat: true, e2e: true },
  { id: 'crm-opportunities', name: 'Opportunities', area: 'CRM', route: '/opportunities', apis: ['GET /api/opportunities', 'POST /api/opportunities'], pat: true, e2e: false },
  { id: 'crm-customers', name: 'Customers', area: 'CRM', route: '/customers', apis: ['GET /api/customers', 'GET /api/customers/:id'], pat: true, e2e: false },
  { id: 'crm-proposals', name: 'Proposals', area: 'CRM', route: '/proposals', apis: ['GET /api/proposals', 'POST /api/proposals', 'GET /api/proposals/:id/pdf'], pat: false, e2e: false },
  { id: 'crm-quotations', name: 'Quotations', area: 'CRM', route: '/proposals', apis: ['POST /api/proposals/auto-generate'], pat: false, e2e: false, note: 'Shares proposals UI' },
  { id: 'crm-invoices', name: 'Invoices', area: 'CRM', route: '/invoices', apis: ['GET /api/invoices', 'POST /api/invoices', 'PATCH /api/invoices/:id'], pat: false, e2e: true },
  { id: 'crm-tasks', name: 'Tasks', area: 'CRM', route: '/leads/[id]', apis: ['GET /api/leads/:id', 'PATCH /api/leads/:id'], pat: false, e2e: false, note: 'Embedded in lead detail' },
  { id: 'crm-followups', name: 'Follow-ups', area: 'CRM', route: '/leads', apis: ['POST /api/leads/:id/followups', 'GET /api/leads/:id/followups'], pat: false, e2e: false },
  { id: 'crm-notes', name: 'Notes', area: 'CRM', route: '/customers', apis: ['POST /api/customers/:id/notes'], pat: false, e2e: false },
  // ─── Revenue ──────────────────────────────────────────────────────────────
  { id: 'revenue-dashboard', name: 'Revenue', area: 'Revenue', route: '/revenue', apis: ['GET /api/revenue/dashboard', 'GET /api/revenue/summary'], pat: true, e2e: true },
  { id: 'revenue-analytics', name: 'Revenue Analytics', area: 'Analytics', route: '/revenue', apis: ['GET /api/revenue/trends', 'GET /api/revenue/forecast'], pat: false, e2e: false },
  // ─── Marketing ────────────────────────────────────────────────────────────
  { id: 'marketing-campaigns', name: 'Campaigns', area: 'Marketing', route: '/campaigns', apis: ['GET /api/campaigns', 'POST /api/campaigns'], pat: false, e2e: true },
  { id: 'marketing-engine', name: 'Marketing Engine', area: 'Marketing', route: '/marketing-engine', apis: ['GET /api/marketing-engine/config'], pat: false, e2e: false },
  { id: 'growth-business-card', name: 'Business Card', area: 'Marketing', route: '/growth/business-card', apis: ['GET /api/growth/business-card'], pat: false, e2e: false },
  { id: 'growth-qr', name: 'Lead Capture (QR)', area: 'Marketing', route: '/growth/qr', apis: ['GET /api/qr', 'POST /api/qr'], pat: false, e2e: false },
  { id: 'growth-reviews', name: 'Reviews', area: 'Marketing', route: '/growth/reviews', apis: ['GET /api/growth/reviews/summary'], pat: false, e2e: false },
  { id: 'growth-audit', name: 'Growth Audit', area: 'Marketing', route: '/growth-audit', apis: ['POST /api/growth-audit'], pat: false, e2e: false },
  { id: 'scanner-website', name: 'Website Scanner', area: 'Marketing', route: '/leadedge360/geo-finder', apis: ['GET /api/scanner/jobs', 'POST /api/scanner/run'], pat: false, e2e: false },
  // ─── Analytics ────────────────────────────────────────────────────────────
  { id: 'analytics-dashboard', name: 'Dashboard', area: 'Analytics', route: '/dashboard', apis: ['GET /api/dashboard/kpis'], pat: false, e2e: false },
  { id: 'analytics-suite', name: 'Business Analytics', area: 'Analytics', route: '/analytics', apis: ['GET /api/analytics/summary', 'GET /api/analytics/funnel'], pat: false, e2e: false },
  // ─── AI Workspace ─────────────────────────────────────────────────────────
  { id: 'ai-command-center', name: 'AI Command Center', area: 'AI Workspace', route: '/leadedge360/command-center', apis: ['GET /api/agents'], pat: false, e2e: false },
  { id: 'ai-insights', name: 'AI Insights', area: 'AI Workspace', route: '/leadedge360/insights', apis: ['GET /api/agents/analytics'], pat: false, e2e: false },
  { id: 'ai-automation', name: 'Automation Hub', area: 'AI Workspace', route: '/leadedge360/automation', apis: ['GET /api/agents/settings'], pat: false, e2e: false },
  { id: 'ai-geo-finder', name: 'Geo Lead Finder', area: 'AI Workspace', route: '/leadedge360/geo-finder', apis: ['POST /api/scanner/geo'], pat: false, e2e: false },
  { id: 'ai-territories', name: 'Territory Management', area: 'AI Workspace', route: '/leadedge360/territories', apis: ['GET /api/territories', 'POST /api/territories'], pat: false, e2e: true },
  { id: 'ai-revenue-intel', name: 'Revenue Intel', area: 'AI Workspace', route: '/leadedge360/revenue-intelligence', apis: ['GET /api/revenue/metrics'], pat: false, e2e: false },
  { id: 'ai-conversations', name: 'Conversations', area: 'AI Workspace', route: '/leadedge360/conversations', apis: ['GET /api/whatsapp/threads'], pat: false, e2e: false },
  { id: 'ai-reports', name: 'Reports', area: 'AI Workspace', route: '/leadedge360/reports', apis: ['POST /api/reports/export'], pat: false, e2e: true },
  // ─── Platform Ops ─────────────────────────────────────────────────────────
  { id: 'ops-agents', name: 'Agent Runtime', area: 'Platform Ops', route: '/ops/agents', apis: ['GET /api/agents/tasks', 'POST /api/agents/worker/run'], pat: false, e2e: false },
  { id: 'ops-events', name: 'Event Operations', area: 'Platform Ops', route: '/ops/events', apis: ['GET /api/platform/events'], pat: false, e2e: false },
  { id: 'ops-ai', name: 'AI Operations', area: 'Platform Ops', route: '/ops/ai', apis: ['GET /api/platform/ai-ops'], pat: false, e2e: false },
  { id: 'ops-ai-analytics', name: 'AI Analytics', area: 'Platform Ops', route: '/ops/ai-analytics', apis: ['GET /api/agents/analytics'], pat: false, e2e: false },
  { id: 'ops-ai-timeline', name: 'AI Agent Timeline', area: 'Platform Ops', route: '/ops/ai-timeline', apis: ['GET /api/platform/ai-timeline'], pat: false, e2e: false },
  { id: 'ops-monitoring', name: 'Monitoring', area: 'Platform Ops', route: '/ops/agents', apis: ['GET /api/metrics', 'GET /api/health/ready'], pat: true, e2e: true },
  // ─── Administration ───────────────────────────────────────────────────────
  { id: 'admin-settings', name: 'Settings', area: 'Administration', route: '/settings', apis: ['GET /api/settings/branding', 'PATCH /api/users/me'], pat: false, e2e: false },
  { id: 'admin-users', name: 'Users', area: 'Administration', route: '/settings', apis: ['GET /api/admin/users'], pat: false, e2e: false },
  { id: 'admin-roles', name: 'Roles & Permissions', area: 'Administration', route: '/settings', apis: ['GET /api/admin/roles'], pat: true, e2e: false },
  { id: 'admin-payments', name: 'Payments', area: 'Administration', route: '/payments', apis: ['GET /api/payments', 'POST /api/payments/create-order'], pat: false, e2e: false },
  { id: 'admin-subscription', name: 'Subscription', area: 'Administration', route: '/payments', apis: ['GET /api/subscriptions', 'GET /api/billing/subscription'], pat: true, e2e: false },
  { id: 'admin-organization', name: 'Organization', area: 'Administration', route: '/settings', apis: ['GET /api/onboarding/status'], pat: false, e2e: false },
  // ─── Auth ─────────────────────────────────────────────────────────────────
  { id: 'auth-signin', name: 'Authentication', area: 'Auth', route: '/signin', apis: ['POST /api/auth/login-password', 'POST /api/auth/register'], pat: true, e2e: true },
  { id: 'auth-signup-otp', name: 'Signup OTP', area: 'Auth', route: '/signup', apis: ['POST /api/auth/register', 'POST /api/auth/verify-otp'], pat: true, e2e: false },
  // ─── RetailEdge360 ────────────────────────────────────────────────────────
  { id: 'retail-dashboard', name: 'Retail Dashboard', area: 'RetailEdge360', route: '/retailedge360', apis: ['GET /api/retail/kpis'], pat: true, e2e: false },
  { id: 'retail-inventory', name: 'Inventory', area: 'RetailEdge360', route: '/retailedge360', apis: ['GET /api/retail/inventory', 'POST /api/retail/inventory'], pat: true, e2e: false },
  { id: 'retail-products', name: 'Products', area: 'RetailEdge360', route: '/retailedge360', apis: ['GET /api/catalog'], pat: false, e2e: false, note: 'Embedded in retail dashboard' },
  { id: 'retail-pos', name: 'POS Checkout', area: 'RetailEdge360', route: '/retailedge360', apis: ['POST /api/retail/pos/checkout'], pat: true, e2e: false },
  { id: 'retail-sales', name: 'Sales', area: 'RetailEdge360', route: '/retailedge360', apis: ['GET /api/retail/sales'], pat: false, e2e: false },
  { id: 'retail-stores', name: 'Stores', area: 'RetailEdge360', route: '/retailedge360', apis: ['GET /api/retail/stores'], pat: false, e2e: false },
  { id: 'retail-reports', name: 'Retail Reports', area: 'RetailEdge360', route: '/retailedge360', apis: ['GET /api/retail/kpis'], pat: false, e2e: false, note: 'RetailAnalytics section' },
]

export const QA_DIMENSIONS = [
  'UI validation',
  'Navigation',
  'API integration',
  'CRUD',
  'Search/filter/pagination',
  'Export/import',
  'Validation messages',
  'Error handling',
  'Loading/empty states',
  'RBAC',
  'Multi-tenant isolation',
  'Mobile responsiveness',
  'Performance',
  'Accessibility',
  'Security',
]
