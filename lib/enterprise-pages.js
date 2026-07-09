/**
 * Unified enterprise page content — single source for marketing page redesign.
 * Brand identity unchanged; copy drives product positioning (LeadEdge360 + RetailEdge360).
 */

import { INTEGRATIONS, SECURITY_FEATURES, LEADEDGE_MARKETING, RETAIL_MARKETING } from './marketing-content'

export const DEFAULT_CTA = {
  title: 'Ready to transform your business with AI?',
  description: 'Book a free demo and see how LeadEdge360 and RetailEdge360 deliver measurable ROI for your team.',
  primaryHref: '/book-demo',
  primaryLabel: 'Book Free Demo',
  secondaryHref: '/growth-audit',
  secondaryLabel: 'Free Growth Assessment',
}

export const DEFAULT_FAQ = [
  {
    q: 'Is AsoftechInsightz an IT services company or a SaaS product company?',
    a: 'We are an AI digital transformation company shipping enterprise SaaS products — LeadEdge360 for sales and marketing, RetailEdge360 for retail operations. Implementation support is included; we do not lead with generic IT staffing.',
  },
  {
    q: 'Can we start with one product and expand later?',
    a: 'Yes. Most customers begin with LeadEdge360 or RetailEdge360 and adopt the second platform as operations scale. Both share the same secure multi-tenant architecture.',
  },
  {
    q: 'How quickly can we go live?',
    a: 'Pilot deployments typically run 2–4 weeks including data migration, workflow configuration, and team onboarding. Enterprise rollouts include dedicated success management.',
  },
  {
    q: 'Do you integrate with our existing tools?',
    a: 'Native connectors for Google, Microsoft, Meta, WhatsApp, Razorpay, Stripe, and OpenAI plus REST APIs and webhooks for custom systems.',
  },
]

export const SOLUTIONS_PAGE = {
  meta: {
    title: 'AI Business Solutions',
    description:
      'AI sales, marketing, retail, analytics, and workflow automation — powered by LeadEdge360 and RetailEdge360.',
  },
  hero: {
    eyebrow: 'Solutions',
    title: 'AI solutions that',
    accent: 'drive business outcomes',
    description:
      'We solve revenue, operations, and customer engagement challenges with productized AI — not one-off consulting projects.',
    productId: 'leadedge360',
    metrics: [
      { label: 'Products', value: '2' },
      { label: 'AI workflows', value: '40+' },
      { label: 'Integrations', value: '12+' },
    ],
  },
  challenges: [
    { title: 'Disconnected sales data', desc: 'Leads spread across spreadsheets, inboxes, and ad platforms with no single source of truth.' },
    { title: 'Manual follow-ups', desc: 'Revenue teams lose deals because nurture, proposals, and meetings are not automated.' },
    { title: 'Retail blind spots', desc: 'Inventory expiry, stock-outs, and multi-store visibility erode margin silently.' },
    { title: 'AI experiments without ROI', desc: 'Pilot AI tools that never connect to CRM, billing, or executive dashboards.' },
  ],
  aiSolutions: [
    { title: 'AI Sales', desc: 'Lead scoring, pipeline forecasting, and agent-assisted qualification via LeadEdge360.', product: 'LeadEdge360' },
    { title: 'AI Marketing', desc: 'Campaign automation, WhatsApp nurture, and attribution across channels.', product: 'LeadEdge360' },
    { title: 'AI Retail', desc: 'FEFO, expiry intelligence, POS, and multi-store inventory in RetailEdge360.', product: 'RetailEdge360' },
    { title: 'AI Analytics', desc: 'Executive dashboards, natural-language reports, and revenue intelligence.', product: 'Both' },
    { title: 'AI Customer Service', desc: 'Conversation tracking, follow-up tasks, and success playbooks.', product: 'LeadEdge360' },
    { title: 'AI Workflow Automation', desc: 'n8n-ready triggers from lead created → proposal → invoice → payment.', product: 'LeadEdge360' },
    { title: 'AI Reporting', desc: 'Scheduled insights, territory performance, and retail KPI rollups.', product: 'Both' },
  ],
  products: [
    {
      name: LEADEDGE_MARKETING.name,
      href: LEADEDGE_MARKETING.href,
      desc: 'CRM, campaigns, proposals, AI agents, and revenue analytics.',
      capabilities: LEADEDGE_MARKETING.highlights.slice(0, 6),
    },
    {
      name: RETAIL_MARKETING.name,
      href: RETAIL_MARKETING.href,
      desc: 'POS, GST billing, inventory, expiry AI, and store operations.',
      capabilities: RETAIL_MARKETING.highlights.slice(0, 6),
    },
  ],
  features: [
    { title: 'Multi-tenant SaaS', desc: 'Secure org isolation with role-based access for every branch and team.' },
    { title: 'API-first', desc: 'REST APIs and webhooks for ERP, accounting, and custom integrations.' },
    { title: 'Mobile-ready', desc: 'Flutter app for field sales and store managers on Android.' },
    { title: 'AI command center', desc: 'Orchestrate agents, tasks, and approvals from one workspace.' },
  ],
  outcomes: [
    { title: 'Unified pipeline', desc: 'Replace spreadsheets with AI-scored CRM and automated follow-ups.' },
    { title: 'Retail digitization', desc: 'POS, GST billing, and inventory intelligence in one platform.' },
    { title: 'Faster decisions', desc: 'Executive dashboards and natural-language reports — no manual exports.' },
    { title: 'Secure multi-tenant SaaS', desc: 'Role-based access, audit logs, and DPDP-aligned privacy controls.' },
  ],
  integrations: INTEGRATIONS,
  customerSuccess: null,
  security: SECURITY_FEATURES,
  faq: DEFAULT_FAQ,
  cta: DEFAULT_CTA,
}

export const INDUSTRY_PROFILES = [
  {
    id: 'retail',
    name: 'Retail',
    product: 'RetailEdge360',
    productHref: '/products/retailedge360',
    challenges: ['Multi-store stock sync', 'GST billing complexity', 'Expiry and shrinkage', 'Slow checkout queues'],
    aiSolutions: ['AI demand forecasting', 'FEFO expiry automation', 'Barcode-driven inventory', 'Retail analytics dashboards'],
    workflows: ['Purchase → GRN → shelf → POS → GST invoice', 'Low-stock alerts → auto reorder', 'Expiry scan → markdown workflow'],
    integrations: ['Razorpay', 'WhatsApp', 'Barcode scanners', 'REST APIs'],
    roi: 'Typical 15–25% reduction in expiry losses within two quarters.',
    outcomes: ['Faster billing', 'Real-time stock visibility', 'Higher basket size from loyalty insights'],
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    product: 'LeadEdge360',
    productHref: '/products/leadedge360',
    challenges: ['Patient inquiry overload', 'Compliance documentation', 'Appointment no-shows', 'Referral tracking'],
    aiSolutions: ['AI follow-up scheduling', 'Secure document extraction', 'Lead scoring for services', 'Campaign nurture'],
    workflows: ['Inquiry → qualify → appointment → reminder', 'Document AI → compliance checklist'],
    integrations: ['Gmail', 'WhatsApp', 'Microsoft', 'OpenAI'],
    roi: '30% fewer missed follow-ups in pilot clinics.',
    outcomes: ['Higher appointment show rates', 'Audit-ready communication logs'],
  },
  {
    id: 'real-estate',
    name: 'Real Estate',
    product: 'LeadEdge360',
    productHref: '/products/leadedge360',
    challenges: ['Lead leakage from portals', 'Slow broker follow-up', 'Proposal turnaround', 'Territory overlap'],
    aiSolutions: ['Geo lead finder', 'AI lead scoring', 'Proposal automation', 'Pipeline forecasting'],
    workflows: ['Portal lead → CRM → AI score → broker assign → site visit', 'Proposal → e-sign → invoice'],
    integrations: ['Meta Ads', 'Google Ads', 'WhatsApp', 'Razorpay'],
    roi: 'Customers report 40%+ pipeline growth in 90 days.',
    outcomes: ['Hot lead prioritization', 'Faster deal closure'],
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy',
    product: 'RetailEdge360',
    productHref: '/products/retailedge360',
    challenges: ['Batch and expiry tracking', 'Regulatory billing', 'Supplier lead times', 'Chain-wide pricing'],
    aiSolutions: ['Product expiry prediction', 'Batch FEFO', 'Multi-store dashboards', 'GST compliance'],
    workflows: ['Batch receive → expiry tag → shelf rotation alert', 'POS with drug schedule flags'],
    integrations: ['Barcode', 'GST', 'Vendor APIs'],
    roi: '₹5–10L annual savings on expired inventory (mid-size chain).',
    outcomes: ['Compliance-ready billing', 'Reduced write-offs'],
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    product: 'LeadEdge360',
    productHref: '/products/leadedge360',
    challenges: ['Long B2B cycles', 'Distributor lead chaos', 'Quote versioning', 'Forecast accuracy'],
    aiSolutions: ['Territory mapping', 'AI revenue forecast', 'Proposal AI', 'Executive dashboards'],
    workflows: ['RFQ → qualify → technical proposal → approval → order'],
    integrations: ['ERP webhooks', 'Email', 'REST APIs'],
    roi: '20% shorter quote-to-cash on average.',
    outcomes: ['Visible pipeline risk', 'Accurate forecasts'],
  },
  {
    id: 'education',
    name: 'Education',
    product: 'LeadEdge360',
    productHref: '/products/leadedge360',
    challenges: ['Enrollment inquiry spikes', 'Counselor bandwidth', 'Campaign attribution', 'Alumni engagement'],
    aiSolutions: ['Marketing automation', 'AI nurture sequences', 'Meeting scheduler', 'Analytics'],
    workflows: ['Ad click → form → nurture → counselor → enrollment'],
    integrations: ['Meta', 'Google', 'WhatsApp', 'Gmail'],
    roi: '2× counselor productivity in peak season.',
    outcomes: ['Higher enrollment conversion', 'Clear channel ROI'],
  },
  {
    id: 'hospitality',
    name: 'Hospitality',
    product: 'LeadEdge360',
    productHref: '/products/leadedge360',
    challenges: ['Booking follow-up gaps', 'Seasonal demand swings', 'Guest retention', 'Multi-property reporting'],
    aiSolutions: ['Customer success automation', 'Campaign triggers', 'Revenue analytics', 'WhatsApp engagement'],
    workflows: ['Inquiry → offer → booking → post-stay review request'],
    integrations: ['WhatsApp', 'Stripe', 'Razorpay', 'Meta'],
    roi: '18% uplift in repeat bookings (pilot properties).',
    outcomes: ['Automated guest journeys', 'Unified property KPIs'],
  },
  {
    id: 'startups',
    name: 'Startups',
    product: 'LeadEdge360',
    productHref: '/products/leadedge360',
    challenges: ['Founder-led sales', 'No CRM discipline', 'Limited ops headcount', 'Investor reporting'],
    aiSolutions: ['AI CRM out of the box', 'Growth audit', 'Investor-ready dashboards', 'Automation from day one'],
    workflows: ['Lead → demo → trial → paid → success playbook'],
    integrations: ['Stripe', 'Razorpay', 'OpenAI', 'n8n'],
    roi: 'Replace 3+ tools in first month; startup-program friendly.',
    outcomes: ['Faster GTM', 'Investor-grade metrics'],
  },
]

export const INDUSTRIES_PAGE = {
  meta: {
    title: 'Industry Solutions',
    description: 'AI digital transformation for retail, healthcare, real estate, pharmacy, and more — with LeadEdge360 and RetailEdge360.',
  },
  hero: {
    eyebrow: 'Industries',
    title: 'Vertical AI for',
    accent: 'your industry',
    description: 'Every sector gets tailored challenges, AI workflows, product mapping, and ROI — not generic feature lists.',
    productId: 'retailedge360',
    metrics: [
      { label: 'Industries', value: '8+' },
      { label: 'Workflows', value: '30+' },
      { label: 'Avg. ROI window', value: '90 days' },
    ],
  },
  challenges: [
    { title: 'One-size-fits-all software', desc: 'Generic CRM and POS tools ignore industry compliance, workflows, and KPIs.' },
    { title: 'Data silos by branch', desc: 'Franchise, store, and sales teams operate on disconnected systems.' },
    { title: 'Slow digital adoption', desc: 'Leadership buys AI pilots that never reach frontline staff.' },
  ],
  aiSolutions: INDUSTRY_PROFILES.map((i) => ({
    title: i.name,
    desc: i.roi,
    product: i.product,
  })),
  products: SOLUTIONS_PAGE.products,
  outcomes: SOLUTIONS_PAGE.outcomes,
  integrations: INTEGRATIONS,
  security: SECURITY_FEATURES,
  faq: [
    ...DEFAULT_FAQ,
    {
      q: 'Do you customize workflows per industry?',
      a: 'Yes. Industry profiles pre-configure recommended agents, dashboards, and automation templates you can extend without custom code.',
    },
  ],
  cta: {
    ...DEFAULT_CTA,
    title: 'Get your industry growth blueprint',
    description: 'We map the right product — LeadEdge360, RetailEdge360, or both — for your sector.',
  },
}

export const COMPANY_PAGE = {
  meta: {
    title: 'Company',
    description: 'Mission, vision, and AI strategy — AsoftechInsightz builds enterprise SaaS for sales and retail growth.',
  },
  hero: {
    eyebrow: 'Company',
    title: 'We build AI platforms',
    accent: 'that businesses run on',
    description:
      'AsoftechInsightz is an AI-first SaaS company. We ship RetailEdge360 and LeadEdge360 as the Business Suite, plus Trinetra360 for enterprise observability.',
    productId: 'leadedge360',
    metrics: [
      { label: 'Focus', value: 'AI SaaS' },
      { label: 'Platforms', value: '3' },
      { label: 'HQ', value: 'India' },
    ],
  },
  mission: {
    title: 'Mission',
    text: 'Help businesses acquire customers, automate operations, and grow using AI-powered SaaS — accessible to SMEs and scalable to enterprise.',
  },
  vision: {
    title: 'Vision',
    text: 'Every growing business runs on an AI-native operating system — with humans in control and agents doing the repetitive work.',
  },
  values: [
    { title: 'Product-first', desc: 'We ship software, not slide decks. Dogfooding LeadEdge360 is non-negotiable.' },
    { title: 'AI with accountability', desc: 'Agents act with approval gates, audit logs, and clear ownership.' },
    { title: 'Customer outcomes', desc: 'Success is measured in pipeline, margin, and time saved — not feature count.' },
    { title: 'Secure by design', desc: 'Multi-tenant isolation, encryption, and compliance-ready architecture.' },
  ],
  leadership: [
    { name: 'Leadership Team', role: 'Founders & product leadership', bio: 'Operators building the platforms they wished they had scaling B2B and retail businesses in India.' },
  ],
  innovation: [
    'Agentic AI workforce integrated with CRM and retail ops',
    'Geo lead intelligence for territory-based sales',
    'Expiry and FEFO intelligence for retail margin protection',
    'Mobile-first field and store experiences',
  ],
  careers: {
    text: 'We hire builders passionate about AI, SaaS, and customer outcomes.',
    href: '/contact',
    label: 'Contact us about careers',
  },
  challenges: SOLUTIONS_PAGE.challenges.slice(0, 3),
  products: SOLUTIONS_PAGE.products,
  outcomes: SOLUTIONS_PAGE.outcomes,
  integrations: INTEGRATIONS,
  security: SECURITY_FEATURES,
  faq: DEFAULT_FAQ,
  cta: DEFAULT_CTA,
}

export const CUSTOMERS_PAGE = {
  meta: {
    title: 'Customer Success',
    description: 'Enterprise customer stories, ROI metrics, and adoption outcomes from LeadEdge360 and RetailEdge360.',
  },
  hero: {
    eyebrow: 'Customers',
    title: 'Outcomes our',
    accent: 'customers achieve',
    description: 'Real metrics from sales and retail teams — before and after adopting our AI SaaS platforms.',
    productId: 'leadedge360',
    metrics: [
      { label: 'Avg. pipeline lift', value: '+34%' },
      { label: 'Expiry savings', value: '₹8L+' },
      { label: 'NPS target', value: '50+' },
    ],
  },
  challenges: [
    { title: 'Tool sprawl', desc: 'Customers replaced 3–5 point solutions with one AI-native platform.' },
    { title: 'Slow time-to-value', desc: 'Pilot-to-production in weeks, not quarters.' },
  ],
  aiSolutions: [
    { title: 'Revenue growth', desc: 'LeadEdge360 pipeline and AI scoring', product: 'LeadEdge360' },
    { title: 'Retail margin', desc: 'RetailEdge360 expiry and inventory AI', product: 'RetailEdge360' },
  ],
  products: SOLUTIONS_PAGE.products,
  outcomes: SOLUTIONS_PAGE.outcomes,
  integrations: INTEGRATIONS,
  security: SECURITY_FEATURES,
  caseStudies: [
    {
      company: 'Square Meters Realtors',
      industry: 'Real Estate',
      product: 'LeadEdge360',
      before: 'Leads in spreadsheets; 48h average response time.',
      after: '+42% pipeline; AI-scored hot leads; same-day follow-up.',
      metrics: ['+42% pipeline', '2.1× faster response', '89 meetings booked / quarter'],
    },
    {
      company: 'Metro Pharmacy Chain',
      industry: 'Pharmacy',
      product: 'RetailEdge360',
      before: '₹12L annual expiry write-offs; manual stock counts.',
      after: 'FEFO automation; expiry dashboard; multi-store sync.',
      metrics: ['₹8L saved', '28 low-stock items flagged early', '24 stores live'],
    },
    {
      company: 'GrowthStack Professional Services',
      industry: 'Professional Services',
      product: 'LeadEdge360',
      before: 'Three disconnected tools; no revenue forecast.',
      after: 'Unified CRM; AI proposals; executive dashboard.',
      metrics: ['3× lead velocity', '40% less admin time', '7.5% conversion rate'],
    },
  ],
  testimonials: [
    { quote: 'LeadEdge360 replaced three tools and gave us AI scoring from day one.', author: 'VP Sales', company: 'Real Estate' },
    { quote: 'FEFO automation alone paid for RetailEdge360 in the first quarter.', author: 'Head of Operations', company: 'Multi-store Retail' },
    { quote: 'Our board finally sees pipeline and forecast in one place.', author: 'CEO', company: 'B2B Services' },
  ],
  adoptionLifecycle: [
    { phase: 'Discover', desc: 'Growth audit and industry blueprint' },
    { phase: 'Pilot', desc: '2–4 week scoped deployment' },
    { phase: 'Adopt', desc: 'Team training + workflow automation' },
    { phase: 'Scale', desc: 'Multi-branch, API, and advanced AI' },
  ],
  enterpriseTrust: [
    'Multi-tenant data isolation',
    'Role-based access control',
    'Daily backups & audit logs',
    'DPDP-ready consent flows',
  ],
  outcomes: SOLUTIONS_PAGE.outcomes,
  faq: [
    {
      q: 'Do you publish customer references?',
      a: 'Yes — upon customer approval we share case studies, metrics, and reference calls for enterprise evaluations.',
    },
    ...DEFAULT_FAQ,
  ],
  cta: {
    ...DEFAULT_CTA,
    title: 'Join our customer success stories',
    description: 'Start with a free growth assessment or book a tailored demo.',
  },
}

export const RESOURCES_PAGE = {
  meta: {
    title: 'Resources & Knowledge Center',
    description: 'Blogs, guides, case studies, webinars, and documentation for AI sales and retail intelligence.',
  },
  hero: {
    eyebrow: 'Resources',
    title: 'Knowledge for',
    accent: 'AI-driven growth',
    description: 'Practical content for founders, CIOs, and operators adopting LeadEdge360 and RetailEdge360.',
    productId: 'retailedge360',
    metrics: [
      { label: 'Topics', value: '7+' },
      { label: 'Formats', value: '8' },
      { label: 'Updated', value: 'Weekly' },
    ],
  },
  categories: [
    { title: 'Blog & Insights', desc: 'AI sales, CRM, and retail intelligence articles.', href: '/blog', type: 'Blog' },
    { title: 'Case Studies', desc: 'Customer ROI and implementation stories.', href: '/customers', type: 'Case Studies' },
    { title: 'Product Guides', desc: 'LeadEdge360 and RetailEdge360 playbooks.', href: '/products/leadedge360', type: 'Guides' },
    { title: 'Documentation', desc: 'API, mobile app, and setup guides.', href: '/download', type: 'Docs' },
    { title: 'Growth Assessment', desc: 'Free AI growth audit for your business.', href: '/growth-audit', type: 'Tool' },
    { title: 'Webinars', desc: 'Live demos and product deep-dives — contact sales to register.', href: '/book-demo', type: 'Webinars' },
    { title: 'Whitepapers', desc: 'Enterprise AI adoption and retail margin reports.', href: '/blog?topic=digital-transformation', type: 'Whitepapers' },
    { title: 'Partner Resources', desc: 'Reseller and implementation enablement.', href: '/partners', type: 'Partners' },
  ],
  featuredTopics: ['AI Sales', 'Marketing Automation', 'Retail Intelligence', 'CRM', 'Inventory', 'Digital Transformation', 'AI for SMEs'],
  challenges: [
    { title: 'Information overload', desc: 'Curated paths for sales leaders, retailers, and technical evaluators.' },
    { title: 'Scattered docs', desc: 'Centralized guides, APIs, and case studies in one knowledge hub.' },
  ],
  aiSolutions: SOLUTIONS_PAGE.aiSolutions.slice(0, 4),
  products: SOLUTIONS_PAGE.products,
  outcomes: SOLUTIONS_PAGE.outcomes.slice(0, 2),
  integrations: INTEGRATIONS,
  security: SECURITY_FEATURES,
  faq: [
    {
      q: 'Is documentation available for developers?',
      a: 'Yes — REST API references and webhook guides are available in the download center and developer docs.',
    },
    ...DEFAULT_FAQ.slice(0, 2),
  ],
  cta: DEFAULT_CTA,
}
