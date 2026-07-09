/**
 * Enterprise SaaS marketing copy — single source for public website.
 */

export const COMPANY = {
  name: 'AsoftechInsightz',
  tagline: 'Empowering Businesses with AI, Automation & Enterprise Intelligence',
  mission:
    'Help Indian small businesses, retailers, SMEs, startups, and enterprises digitally transform using AI-powered products and consulting.',
  email: 'enquiry@asoftechinsightz.com',
  phone: '+91 7307911405',
  phoneTel: '+917307911405',
  location: 'Noida, Uttar Pradesh, India',
  supportHours: 'Monday–Saturday, 9:00 AM – 6:00 PM IST',
}

export const COMPANY_LEGAL = {
  legalName: 'AsoftechInsightz Pvt. Ltd.',
  businessType: 'Private Limited Company · AI SaaS & Enterprise Software',
  registeredAddress: 'Noida, Uttar Pradesh, India',
  cin: 'Available on request for enterprise procurement and payment partner verification',
  gstin: 'Available on request — contact enquiry@asoftechinsightz.com',
  grievanceEmail: 'enquiry@asoftechinsightz.com',
  grievanceOfficer: 'Data Protection Officer',
  businessModel:
    'SaaS subscriptions (RetailEdge360, LeadEdge360, Business Suite), enterprise observability (Trinetra360), AI platforms, and optional IT consulting, cloud consulting, and implementation services.',
}

export const COMPANY_POSITIONING = {
  headline: 'AI-Powered Business Growth Platform Company',
  description:
    'Helping businesses acquire customers, automate operations, and grow using AI.',
}

export const HERO = {
  eyebrow: 'AI-Powered Business Transformation Platform',
  headline: 'Empowering Businesses with',
  accent: 'AI, Automation & Enterprise Intelligence',
  subheadline:
    'From small retail stores to enterprise operations — our AI-powered platforms help you acquire customers, streamline operations, and scale your business with confidence.',
  primaryCta: { label: 'Explore Products', href: '/products' },
  secondaryCta: { label: 'Book a Demo', href: '/book-demo' },
}

export const HERO_TRUST_PILLS = [
  { label: 'AI-Powered', desc: 'Intelligent automation' },
  { label: 'Secure Cloud', desc: 'Enterprise-grade platform' },
  { label: 'Built for Growth', desc: 'Scale with confidence' },
  { label: 'DPDP Privacy First', desc: 'Privacy-by-design' },
]

export const PLATFORM_OUTCOMES = [
  { label: 'AI Powered', desc: 'Scoring, forecasting, and workflow automation' },
  { label: 'Secure Cloud Platform', desc: 'SSL/TLS, RBAC, and tenant isolation' },
  { label: 'Built for Growth', desc: 'From single store to multi-branch enterprise' },
  { label: 'Transparent Pricing', desc: 'Clear INR plans — no hidden fees' },
  { label: 'Enterprise Ready', desc: 'Procurement-friendly documentation and APIs' },
  { label: 'DPDP Privacy First', desc: 'Consent controls and data portability' },
  { label: 'Made for Indian Businesses', desc: 'GST, UPI, MSME-focused SaaS delivery' },
]

/** @deprecated Use PLATFORM_OUTCOMES */
export const PLATFORM_VALUE_PILLARS = PLATFORM_OUTCOMES

export const INDUSTRY_STRIP = [
  { name: 'Retail', icon: 'store' },
  { name: 'Healthcare', icon: 'heart' },
  { name: 'Manufacturing', icon: 'factory' },
  { name: 'Education', icon: 'graduation' },
  { name: 'BFSI', icon: 'landmark' },
  { name: 'Services', icon: 'briefcase' },
  { name: 'Logistics', icon: 'truck' },
  { name: 'Telecom', icon: 'radio' },
]

export const GROWTH_JOURNEY_STEPS = [
  {
    id: 'digitize',
    step: '01',
    title: 'Digitize operations',
    product: 'RetailEdge360',
    desc: 'POS, GST billing, inventory, and store intelligence for kirana stores, pharmacies, and retail chains.',
    href: '/products/retailedge360',
    accent: '#22C55E',
  },
  {
    id: 'customers',
    step: '02',
    title: 'Manage & grow customers',
    product: 'LeadEdge360',
    desc: 'CRM, pipeline, AI lead scoring, campaigns, and revenue dashboards for SMEs and sales teams.',
    href: '/products/leadedge360',
    accent: '#0066FF',
  },
  {
    id: 'suite',
    step: '03',
    title: 'Scale intelligently',
    product: 'Business Suite',
    desc: 'Unified login, shared customer data, and cross-platform analytics when retail and CRM work as one.',
    href: '/pricing',
    accent: '#00C6FF',
  },
  {
    id: 'observe',
    step: '04',
    title: 'Observe · Predict · Resolve',
    product: 'Trinetra360',
    desc: 'Enterprise observability for banks, telecom, and large IT teams — sold separately from the Business Suite.',
    href: '/products/trinetra360',
    accent: '#8B5CF6',
    enterprise: true,
  },
]

export const TRUST_SIGNALS = [
  { label: 'DPDP Act Ready', desc: 'Privacy-by-design consent and data controls' },
  { label: 'SSL / TLS Encryption', desc: 'Secure authentication and APIs' },
  { label: 'Razorpay Ready', desc: 'Transparent INR subscription billing' },
  { label: 'Made for India', desc: 'MSME-focused · GST · cloud-native SaaS' },
]

export const PRODUCT_ECOSYSTEM_NARRATIVE = {
  retailedge360: {
    why: 'Retail runs on speed — billing, stock, and payments cannot wait for spreadsheets.',
    who: 'Kirana stores, pharmacies, supermarkets, restaurants, and retail chains.',
    outcome: 'Digitize daily operations with POS, GST, barcode inventory, and mobile store management.',
  },
  leadedge360: {
    why: 'Revenue growth depends on knowing which leads to pursue and when to follow up.',
    who: 'SMEs, agencies, consultants, startups, and B2B sales teams.',
    outcome: 'Capture leads, score with AI, run campaigns, and close deals from one CRM workspace.',
  },
  trinetra360: {
    why: 'When systems fail, revenue stops — enterprises need visibility before users notice.',
    who: 'BFSI, telecom, manufacturing, healthcare, government, and cloud providers.',
    outcome: 'Observe infrastructure and applications, correlate alerts, and resolve incidents faster.',
    separate: true,
  },
}

/** @deprecated Use HERO — kept for gradual migration */
export const HERO_LEGACY = {
  headline: 'Build. Sell. Grow.',
  accent: 'Run Your Business with AI.',
}

export const PRODUCT_SCREENSHOTS = {
  leadedge360: '/images/products/leadedge360-dashboard.svg',
  retailedge360: '/images/products/retailedge360-dashboard.svg',
  trinetra360: '/images/products/trinetra360-dashboard.svg',
}

export const PRODUCT_GALLERY = {
  leadedge360: [
    { label: 'Executive Command Center', src: '/images/products/leadedge360-dashboard.svg' },
    { label: 'AI Command Center', src: '/images/products/leadedge360-dashboard.svg' },
    { label: 'Analytics', src: '/images/products/leadedge360-dashboard.svg' },
    { label: 'Campaigns', src: '/images/products/leadedge360-dashboard.svg' },
  ],
  retailedge360: [
    { label: 'Retail Growth Command Center', src: '/images/products/retailedge360-dashboard.svg' },
  ],
  trinetra360: [
    { label: 'Executive Home', src: '/images/products/trinetra360-dashboard.svg' },
  ],
}

export const LEADEDGE_MARKETING = {
  name: 'LeadEdge360',
  tagline: 'AI-Powered CRM & Revenue Growth Platform',
  shortDesc: 'Acquire leads, automate sales, improve conversions, and grow revenue.',
  href: '/products/leadedge360',
  suiteHref: '/dashboard',
  demoHref: '/book-demo?product=leadedge360',
  message: 'Convert pipeline into predictable revenue with AI-assisted sales, campaigns, and customer timelines.',
  highlights: [
    'AI CRM',
    'Marketing Automation',
    'AI Sales Agents',
    'Proposal Automation',
    'WhatsApp Automation',
    'Revenue Intelligence',
    'Customer Success Automation',
    'Analytics',
  ],
  modules: [
    'Lead Generation',
    'CRM',
    'Marketing Automation',
    'Sales Automation',
    'Proposal Management',
    'Customer Success',
    'Revenue Analytics',
  ],
  screenshots: [
    { label: 'Executive Dashboard', href: '/images/products/leadedge360-dashboard.svg' },
    { label: 'AI Command Center', href: '/images/products/leadedge360-dashboard.svg' },
    { label: 'Analytics', href: '/images/products/leadedge360-dashboard.svg' },
    { label: 'Campaigns', href: '/images/products/leadedge360-dashboard.svg' },
  ],
}

export const TRINETRA_MARKETING = {
  name: 'Trinetra360',
  tagline: 'Enterprise Observability Platform',
  shortDesc: 'Observe, predict, and resolve issues across modern digital infrastructure.',
  href: '/products/trinetra360',
  demoHref: '/book-demo?product=trinetra360',
  status: 'early-access',
  highlights: [
    'Infrastructure Monitoring',
    'Application Performance Monitoring',
    'Log Analytics',
    'Distributed Tracing',
    'Service Dependency Mapping',
    'Root Cause Analysis',
    'AIOps & Event Correlation',
    'Alert Intelligence',
    'Capacity Planning',
    'Executive Dashboards',
  ],
  modules: [
    'Infrastructure Monitoring',
    'APM',
    'Log Analytics',
    'Distributed Tracing',
    'Service Topology',
    'AIOps',
    'Incident Timeline',
    'Executive NOC',
  ],
  message: 'Observe everything. Predict issues. Resolve faster.',
  screenshots: [
    { label: 'Executive Home', href: '/images/products/trinetra360-dashboard.svg' },
  ],
}

export const ECOSYSTEM_HUB = {
  center: 'AsoftechInsightz',
  nodes: [
    { id: 'retail', label: 'RetailEdge360', desc: 'Smart retail & POS', href: '/products/retailedge360', color: '#FF7A00' },
    { id: 'lead', label: 'LeadEdge360', desc: 'CRM & revenue growth', href: '/products/leadedge360', color: '#0066FF' },
    { id: 'trinetra', label: 'Trinetra360', desc: 'Observability & AIOps', href: '/products/trinetra360', color: '#8B5CF6' },
    { id: 'ai', label: 'AI Engine', desc: '12+ virtual employees', href: '/leadedge360/command-center', color: '#00C6FF' },
    { id: 'cloud', label: 'Cloud Services', desc: 'Secure SaaS delivery', href: '/services', color: '#22C55E' },
    { id: 'analytics', label: 'Analytics', desc: 'Real-time intelligence', href: '/analytics', color: '#F59E0B' },
  ],
}

export const SMB_TRANSFORMATION_STEPS = [
  { title: 'Small business', desc: 'Traditional shops and SMEs running on manual billing, spreadsheets, and disconnected tools.' },
  { title: 'Digitize operations', desc: 'RetailEdge360 — Smart POS, GST billing, barcode inventory, loyalty, and mobile store operations.' },
  { title: 'Manage customers', desc: 'LeadEdge360 — CRM, sales pipeline, AI lead scoring, proposals, and WhatsApp campaigns.' },
  { title: 'Grow revenue', desc: 'Unified business intelligence across retail sales and customer growth — without fake metrics.' },
  { title: 'Enterprise customers', desc: 'Banks, telecom, manufacturing, healthcare, and government teams need always-on IT visibility.' },
  { title: 'Trinetra360 — Observe · Predict · Resolve', desc: 'Enterprise observability platform sold separately from the Business Suite. Monitor infrastructure, correlate alerts, and resolve incidents faster.' },
]

export const TRADITIONAL_VS_PLATFORM = [
  { traditional: 'Manual processes', platform: 'AI-powered automation' },
  { traditional: 'Disconnected tools', platform: 'Integrated ecosystem' },
  { traditional: 'Reactive support', platform: 'Predictive observability' },
  { traditional: 'Multiple vendors', platform: 'Unified SaaS platform' },
  { traditional: 'Static reports', platform: 'Real-time intelligence' },
]

export const ABOUT_TIMELINE = [
  { year: 'Foundation', title: 'AI-native product vision', desc: 'Founded to build indigenous SaaS for Indian SMEs — not generic IT outsourcing.' },
  { year: 'RetailEdge360', title: 'Retail intelligence platform', desc: 'POS, GST, inventory, and store operations for kirana, pharmacy, and retail chains.' },
  { year: 'LeadEdge360', title: 'CRM & revenue growth', desc: 'AI-assisted sales, campaigns, and pipeline management for B2B and service businesses.' },
  { year: 'Business Suite', title: 'Unified business platform', desc: 'RetailEdge360 + LeadEdge360 with shared data, login, and cross-platform analytics.' },
  { year: 'Trinetra360', title: 'Enterprise observability', desc: 'Separate platform for banks, telecom, and large IT teams — observe, predict, resolve.' },
  { year: 'Roadmap', title: 'Deeper AI & automation', desc: 'Expanded agent runtime, industry templates, and enterprise compliance tooling.' },
]

export const ABOUT_NARRATIVE = {
  mission: 'Help Indian businesses acquire customers, automate operations, and grow using AI-powered cloud software — from kirana stores to enterprise IT teams.',
  vision: 'Every growing business runs on an AI-native operating system where humans stay in control and intelligent platforms handle repetitive work.',
  digitalIndia: 'We build cloud-native, mobile-ready SaaS in India for India — GST-ready billing, UPI payments, DPDP-aligned privacy, and MSME-friendly pricing.',
  founderNote: 'We are operators building the platforms we wished we had while scaling B2B and retail businesses. Product quality comes before marketing claims.',
}

export const STARTUP_INDIA_NARRATIVE = {
  title: 'Built for India\'s digital economy',
  points: [
    { title: 'Innovation', desc: 'AI-first SaaS products designed and engineered in India.' },
    { title: 'MSME empowerment', desc: 'Affordable tiers for retailers and SMEs starting digital transformation.' },
    { title: 'Digital India alignment', desc: 'Cloud-native, mobile-ready platforms for Bharat\'s businesses.' },
    { title: 'Scalable architecture', desc: 'Multi-tenant, API-first design from pilot to enterprise.' },
    { title: 'Business automation', desc: 'Reduce manual work across sales, retail, and IT operations.' },
  ],
  disclaimer:
    'Startup India recognition will be displayed here only after official approval from DPIIT. We do not claim government endorsement until certified.',
}

export const OUTCOME_SCENARIOS = [
  {
    scenario: 'Retail chain pilot',
    industry: 'Retail',
    outcome: 'Unified POS, inventory, and GST billing across stores with expiry intelligence.',
    note: 'Illustrative pilot scenario — results vary by implementation scope.',
  },
  {
    scenario: 'B2B sales team',
    industry: 'Professional Services',
    outcome: 'CRM pipeline, AI lead scoring, and proposal-to-invoice workflow in one suite.',
    note: 'Based on platform capabilities demonstrated in product demos.',
  },
  {
    scenario: 'Growing SaaS operator',
    industry: 'Technology',
    outcome: 'Executive visibility into revenue plus infrastructure health as user base scales.',
    note: 'Trinetra360 available for early-access deployments.',
  },
]

export const CONSULTING_SERVICES = [
  'AI Solutions',
  'IT Consulting',
  'Cloud Consulting',
  'DevOps',
  'Enterprise Architecture',
  'Digital Transformation',
  'Observability Consulting',
  'Managed Services',
  'Custom Software Development',
]

export const RETAIL_MARKETING = {
  name: 'RetailEdge360',
  tagline: 'AI-Powered Retail Management Platform',
  shortDesc: 'Smart POS, inventory, billing, loyalty & analytics for retail businesses.',
  href: '/products/retailedge360',
  suiteHref: '/retailedge360',
  demoHref: '/book-demo?product=retailedge360',
  message: 'Turn every store visit into structured data — billing, stock, and customer loyalty in one command center.',
  highlights: [
    'Smart Billing',
    'POS',
    'Inventory Management',
    'Barcode Scanning',
    'GST Billing',
    'Customer Credit',
    'Loyalty Programs',
    'Sales Analytics',
    'Expense Tracking',
    'Multi-store Management',
    'Offline Mode',
    'QR Payments',
    'Mobile POS',
    'Business Insights',
    'Product Expiry Intelligence',
    'FEFO Automation',
  ],
  modules: [
    'Smart POS',
    'Inventory',
    'Billing',
    'Barcode',
    'Product Expiry Intelligence',
    'Batch Management',
    'Vendor Management',
    'Multi-Store Operations',
  ],
  screenshots: [
    { label: 'Growth Command Center', href: '/images/products/retailedge360-dashboard.svg' },
  ],
}

export const TRUSTED_TECH = [
  'Google Cloud',
  'Microsoft Azure',
  'AWS',
  'OpenAI',
  'Meta',
  'WhatsApp',
  'Stripe',
  'Razorpay',
  'PostgreSQL',
  'Docker',
]

export const AI_PIPELINE = [
  'AI Marketing Manager',
  'AI Sales Manager',
  'AI Proposal Writer',
  'AI Inventory Intelligence',
  'AI Revenue Analyst',
  'AI Business Assistant',
]

export const WHY_CHOOSE = [
  { title: 'Enterprise SaaS', desc: 'Multi-product suite built for scale from day one.' },
  { title: 'AI-First Architecture', desc: 'Agents, scoring, and automation woven into every workflow.' },
  { title: 'Cloud Native', desc: 'Container-ready deployments on modern cloud infrastructure.' },
  { title: 'API-First', desc: 'REST APIs and webhooks for every integration touchpoint.' },
  { title: 'Multi-Tenant', desc: 'Secure org isolation with role-based access control.' },
  { title: 'Secure', desc: 'Encryption, audit logs, and enterprise-grade auth.' },
  { title: 'Scalable', desc: 'From single-store retail to multi-branch enterprise.' },
  { title: 'Mobile Ready', desc: 'Native Flutter app for field sales and store ops.' },
  { title: 'Automation Driven', desc: 'n8n workflows, campaigns, and AI task runners.' },
]

export const INDUSTRIES = [
  { slug: 'retail', name: 'Retail', href: '/industries#retail' },
  { slug: 'healthcare', name: 'Healthcare', href: '/industries#healthcare' },
  { slug: 'manufacturing', name: 'Manufacturing', href: '/industries#manufacturing' },
  { slug: 'education', name: 'Education', href: '/industries#education' },
  { slug: 'banking', name: 'Banking', href: '/industries#banking' },
  { slug: 'insurance', name: 'Insurance', href: '/industries#insurance' },
  { slug: 'hospitality', name: 'Hospitality', href: '/industries#hospitality' },
  { slug: 'government', name: 'Government', href: '/industries#government' },
  { slug: 'logistics', name: 'Logistics', href: '/industries#logistics' },
  { slug: 'telecom', name: 'Telecommunications', href: '/industries#telecom' },
  { slug: 'real-estate', name: 'Real Estate', href: '/industries#real-estate' },
  { slug: 'startups', name: 'Startups & SMEs', href: '/industries#startups' },
]

export const FLAGSHIP_PRODUCTS = [
  { id: 'retailedge360', ...RETAIL_MARKETING, accent: '#FF7A00', icon: 'store' },
  { id: 'leadedge360', ...LEADEDGE_MARKETING, accent: '#0066FF', icon: 'crm' },
  { id: 'trinetra360', ...TRINETRA_MARKETING, accent: '#8B5CF6', icon: 'observability' },
]

export const AI_CAPABILITIES = [
  'AI Lead Scoring',
  'AI Sales Forecasting',
  'AI Marketing Automation',
  'AI Inventory Intelligence',
  'AI Demand Forecasting',
  'AI Product Expiry Prediction',
  'AI Business Insights',
  'Natural Language Reports',
]

export const INTEGRATIONS = [
  'Google',
  'Microsoft',
  'Meta',
  'WhatsApp',
  'Gmail',
  'Outlook',
  'Razorpay',
  'Stripe',
  'OpenAI',
  'n8n',
  'REST APIs',
  'Webhooks',
]

export const SECURITY_FEATURES = [
  'Encryption at rest and in transit',
  'Role-Based Access Control',
  'Multi-Tenant Isolation',
  'Daily Backups',
  'Audit Logs',
  'Secure APIs',
  'Scalable Cloud Infrastructure',
]

export const KNOWLEDGE_TOPICS = [
  { title: 'AI Sales', href: '/blog?topic=ai-sales' },
  { title: 'Marketing Automation', href: '/blog?topic=marketing-automation' },
  { title: 'Retail Intelligence', href: '/blog?topic=retail-intelligence' },
  { title: 'CRM', href: '/blog?topic=crm' },
  { title: 'Inventory Management', href: '/blog?topic=inventory' },
  { title: 'Digital Transformation', href: '/blog?topic=digital-transformation' },
  { title: 'AI for SMEs', href: '/blog?topic=ai-smes' },
]

/** V5 pricing — Razorpay-ready, market-positioned INR tiers */
export const PRICING_V5 = {
  retailedge360: {
    product: 'RetailEdge360',
    tagline: 'AI-powered retail management for Indian stores',
    href: '/products/retailedge360',
    tiers: [
      {
        id: 'business',
        name: 'Business',
        price: '₹2,999',
        period: '/month',
        setupFee: '₹9,999',
        setupLabel: 'One-Time Setup',
        idealFor: 'Small retailers and growing businesses',
        features: [
          'Smart POS', 'GST Billing', 'Barcode', 'Inventory', 'Purchase Management',
          'Expense Management', 'Customer Credit', 'Loyalty Program', 'Mobile POS',
          'QR Payments', 'Analytics Dashboard', 'WhatsApp Notifications', 'Up to 5 Users', 'Standard Support',
        ],
        cta: { label: 'Subscribe', href: '/subscribe?product=retail' },
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: '₹7,999',
        period: '/month',
        idealFor: 'Retail chains and multi-location operators',
        features: [
          'Everything in Business', 'Multi-Store Management', 'Warehouse Management',
          'Centralized Inventory', 'Unlimited Users', 'API Integration', 'Advanced Analytics',
          'Priority Support', 'Dedicated Account Manager',
        ],
        cta: { label: 'Contact sales', href: '/contact?product=retailedge360' },
      },
    ],
  },
  leadedge360: {
    product: 'LeadEdge360',
    tagline: 'AI-powered CRM & revenue growth for SMEs',
    href: '/products/leadedge360',
    tiers: [
      {
        id: 'business',
        name: 'Business',
        price: '₹14,999',
        period: '/month',
        setupFee: '₹39,999',
        setupLabel: 'One-Time Setup',
        idealFor: 'SMEs and dedicated sales teams',
        highlight: true,
        badge: 'Most Popular',
        features: [
          'AI CRM', 'Lead Management', 'Sales Pipeline', 'Opportunity Management',
          'AI Lead Scoring', 'Proposal Management', 'Revenue Dashboard', 'Customer Timeline',
          'WhatsApp Integration', 'Email Campaigns', 'Workflow Automation', 'AI Sales Recommendations',
          'Business Analytics', 'API Access', 'Priority Support',
        ],
        cta: { label: 'Subscribe', href: '/subscribe?product=lead' },
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: '₹24,999',
        period: '/month',
        idealFor: 'Large organizations with complex sales operations',
        features: [
          'Everything in Business', 'Unlimited Users', 'Multi-Organization Support',
          'AI Sales Forecasting', 'AI Revenue Prediction', 'Custom AI Models', 'ERP Integration',
          'SSO', 'White Label (Optional)', 'Advanced Security', 'Dedicated Solution Architect',
          'Premium SLA', 'Custom Integrations', 'Private Cloud / On-Premises Deployment',
        ],
        cta: { label: 'Contact sales', href: '/contact?product=leadedge360' },
      },
    ],
  },
  bundles: [
    {
      id: 'business-suite',
      name: 'Business Suite',
      price: '₹16,999',
      period: '/month',
      setupFee: '₹49,999',
      setupLabel: 'One-Time Setup',
      idealFor: 'Retailers who want store operations and CRM in one subscription',
      includes: ['RetailEdge360 Business', 'LeadEdge360 Business'],
      highlight: true,
      badge: 'Best Overall Value',
      features: [
        'Unified Login', 'Unified Dashboard', 'Cross-Platform Analytics', 'Shared Customer Database',
        'AI Business Insights', 'Business Intelligence Dashboard', 'Priority Support',
      ],
      cta: { label: 'Get Business Suite', href: '/subscribe?product=bundle' },
    },
    {
      id: 'enterprise-business-suite',
      name: 'Enterprise Business Suite',
      price: 'Custom',
      period: '',
      idealFor: 'Organizations scaling retail, CRM, and consulting together',
      includes: ['RetailEdge360 Enterprise', 'LeadEdge360 Enterprise'],
      features: [
        'Dedicated Project Manager', 'ERP Integration', 'API Gateway', 'Premium SLA',
        'Custom Development', 'Dedicated Customer Success Manager',
      ],
      cta: { label: 'Talk to sales', href: '/contact?plan=enterprise-business-suite' },
    },
  ],
  trinetra360: {
    product: 'Trinetra360',
    tagline: 'Enterprise observability — independent from the Business Suite',
    href: '/products/trinetra360',
    note: 'Trinetra360 is sold separately with custom enterprise pricing. It is not bundled with RetailEdge360 or LeadEdge360.',
    cta: { label: 'Request enterprise demo', href: '/book-demo?product=trinetra360' },
  },
}

/** @deprecated Use PRICING_V5 */
export const PRICING_V4 = PRICING_V5

export const PRICING_TIERS = {
  leadedge360: PRICING_V5.leadedge360.tiers.map((t) => ({ name: t.name, price: `${t.price}${t.period}`, features: t.features.slice(0, 4) })),
  retailedge360: PRICING_V5.retailedge360.tiers.map((t) => ({ name: t.name, price: `${t.price}${t.period}`, features: t.features.slice(0, 4) })),
}

export const SUITE_VS_ENTERPRISE = {
  businessSuite: {
    title: 'Business Suite',
    subtitle: 'For retailers, kirana stores, SMEs, and growing sales teams',
    products: ['RetailEdge360', 'LeadEdge360'],
    accent: '#00C6FF',
    features: ['POS & GST billing', 'Inventory & loyalty', 'CRM & pipeline', 'AI lead scoring', 'Business plans from ₹2,999/month'],
    cta: { label: 'Explore Business Suite', href: '/products' },
    appUrl: 'https://app.asoftechinsightz.com',
  },
  enterprisePlatform: {
    title: 'Enterprise Platform',
    subtitle: 'For banks, telecom, manufacturing, healthcare, and large IT teams',
    products: ['Trinetra360'],
    accent: '#7C3AED',
    features: ['Infrastructure & APM monitoring', 'Distributed tracing & logs', 'AIOps & root cause analysis', 'Executive command center', 'Custom deployment & SLA'],
    cta: { label: 'Explore Trinetra360', href: '/products/trinetra360' },
    appUrl: 'https://app.observability360.asoftechinsightz.com',
  },
}

export const WHATSAPP_NUMBER = '917307911405'
export const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com/asoftechinsightz/demo'
