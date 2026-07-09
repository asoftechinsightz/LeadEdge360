import {
  LayoutDashboard,
  Target,
  BriefcaseBusiness,
  GitBranchPlus,
  Store,
  FileText,
  Receipt,
  Megaphone,
  Activity,
  TrendingUp,
  Settings,
  type LucideIcon,
  Rocket,
  Bot,
  MapPin,
  Map,
  Workflow,
  BarChart3,
  MessageSquare,
  FileBarChart,
  Sparkles,
  IndianRupee,
  Contact,
  QrCode,
  Package,
  ShoppingCart,
  Truck,
  Users,
  CreditCard,
  Gift,
  BarChart2,
  Star,
  Clock,
  Server,
} from 'lucide-react';

export const SUITE_ROUTES = [
  '/dashboard',
  '/leadedge360/leads',
  '/opportunities',
  '/proposals',
  '/invoices',
  '/revenue',
  '/campaigns',
  '/analytics',
  '/leadedge360',
  '/retailedge360',
  '/settings',
  '/payments',
  '/onboarding',
  '/growth-audit',
  '/growth',
  '/ops',
  '/administration',
] as const;

export type SuiteRoute = (typeof SUITE_ROUTES)[number];

export function isSuitePath(pathname: string): boolean {
  return SUITE_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export type SuiteNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  shortLabel?: string;
  badge?: 'new';
  /** Plan feature key — hidden when org lacks entitlement */
  feature?: string;
};

/** @deprecated Use SUITE_NAV_GROUPS — kept for MobileNav flat list fallback */
export const SUITE_NAV: SuiteNavItem[] = [
  { href: '/dashboard', label: 'Dashboard', shortLabel: 'Dashboard', icon: LayoutDashboard },
  { href: '/leadedge360/leads', label: 'Leads', shortLabel: 'Leads', icon: Target },
  { href: '/opportunities', label: 'Opportunities', shortLabel: 'Opp', icon: BriefcaseBusiness },
  { href: '/retailedge360', label: 'RetailEdge360', shortLabel: 'Retail', icon: Store },
  { href: '/proposals', label: 'Proposals', icon: FileText },
  { href: '/invoices', label: 'Invoices', icon: Receipt },
  { href: '/campaigns', label: 'Campaigns', icon: Megaphone },
  { href: '/growth-audit', label: 'Growth Audit', icon: Rocket },
  { href: '/analytics', label: 'Analytics', icon: Activity },
  { href: '/revenue', label: 'Revenue', icon: TrendingUp },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/payments', label: 'Payments', icon: GitBranchPlus },
];

/** Single navigation source for AppShell sidebar — all authenticated suite pages */
export const SUITE_NAV_GROUPS = [
  {
    label: 'Dashboard',
    items: [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Sales',
    items: [
      { href: '/leadedge360/leads', label: 'Leads', icon: Target },
      { href: '/leadedge360/opportunities', label: 'Opportunities', icon: BriefcaseBusiness },
    ],
  },
  {
    label: 'CRM',
    items: [
      { href: '/proposals', label: 'Proposals', icon: FileText },
      { href: '/invoices', label: 'Invoices', icon: Receipt },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { href: '/leadedge360/automation', label: 'Automation Hub', icon: Workflow, badge: 'new' as const, feature: 'campaigns' },
      { href: '/campaigns', label: 'Campaigns', icon: Megaphone, feature: 'campaigns' },
      { href: '/growth/business-card', label: 'Business Card', icon: Contact, badge: 'new' as const, feature: 'business_card' },
      { href: '/growth/qr', label: 'QR Engine', icon: QrCode, badge: 'new' as const, feature: 'qr_engine' },
      { href: '/growth/reviews', label: 'Reviews', icon: Star, badge: 'new' as const, feature: 'reviews' },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { href: '/analytics', label: 'Analytics', icon: Activity },
      { href: '/revenue', label: 'Revenue', icon: TrendingUp },
    ],
  },
  {
    label: 'AI Workspace',
    items: [
      { href: '/leadedge360', label: 'LeadEdge360 Hub', icon: Bot, badge: 'new' as const },
    ],
  },
  {
    label: 'Platform Ops',
    items: [
      { href: '/ops/agents', label: 'Agent Runtime', icon: Bot, badge: 'new' as const },
      { href: '/ops/ai-analytics', label: 'AI Analytics', icon: BarChart3, badge: 'new' as const },
      { href: '/ops/events', label: 'Event Operations', icon: Server, badge: 'new' as const },
      { href: '/ops/ai', label: 'AI Operations', icon: Bot, badge: 'new' as const },
      { href: '/ops/ai-timeline', label: 'AI Agent Timeline', icon: Activity, badge: 'new' as const },
    ],
  },
  {
    label: 'Administration',
    items: [
      { href: '/settings', label: 'Settings', icon: Settings },
      { href: '/administration/integrations', label: 'Integrations', icon: Settings, feature: 'api_access' },
      { href: '/payments', label: 'Payments', icon: GitBranchPlus },
    ],
  },
] as const;

export const RETAIL_NAV_GROUPS = [
  {
    label: 'Retail',
    items: [
      { href: '/retailedge360', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/retailedge360#products', label: 'Products', icon: Package },
      { href: '/retailedge360#inventory', label: 'Inventory', icon: Store },
      { href: '/retailedge360/expiry', label: 'Expiry Management', icon: Clock, feature: 'retail_expiry' },
      { href: '/retailedge360#suppliers', label: 'Suppliers', icon: Truck },
      { href: '/retailedge360#customers', label: 'Customers', icon: Users },
      { href: '/retailedge360#orders', label: 'Orders', icon: ShoppingCart },
      { href: '/retailedge360#billing', label: 'Billing / POS', icon: CreditCard },
      { href: '/retailedge360#loyalty', label: 'Loyalty', icon: Gift },
      { href: '/retailedge360#analytics', label: 'Inventory Analytics', icon: BarChart2 },
    ],
  },
  {
    label: 'Administration',
    items: [
      { href: '/settings', label: 'Settings', icon: Settings },
    ],
  },
] as const;

/** @deprecated Legacy LeadEdge nav — use SUITE_NAV_GROUPS */
export const LEADEDGE_NAV_GROUPS = SUITE_NAV_GROUPS;

export function isLeadEdgePath(pathname: string): boolean {
  return !pathname.startsWith('/retailedge360') && !pathname.startsWith('/partners');
}

export function getNavGroupsForPath(pathname: string) {
  if (pathname?.startsWith('/retailedge360')) return RETAIL_NAV_GROUPS;
  return SUITE_NAV_GROUPS;
}

export const PARTNER_NAV_GROUPS = [
  {
    label: 'Partner',
    items: [{ href: '/partners/dashboard', label: 'Partner Dashboard', icon: BriefcaseBusiness }],
  },
] as const;

export function filterNavGroupsByFeatures(
  groups: ReadonlyArray<{ label: string; items: ReadonlyArray<SuiteNavItem> }>,
  features: string[],
) {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.feature || features.includes(item.feature)),
    }))
    .filter((group) => group.items.length > 0);
}

export const ROUTE_LABELS: Record<string, string> = {
  leadedge360: 'LeadEdge360',
  'command-center': 'AI Command Center',
  insights: 'AI Insights',
  conversations: 'Conversations',
  reports: 'Reports',
  'geo-finder': 'Geo Lead Finder',
  territories: 'Territory Management',
  'growth-engine': 'Growth Audit Engine',
  automation: 'Automation Hub',
  'revenue-intelligence': 'Revenue Intelligence',
  dashboard: 'Dashboard',
  retailedge360: 'RetailEdge360',
  proposals: 'Proposals',
  invoices: 'Invoices',
  revenue: 'Revenue',
  payments: 'Payments',
  onboarding: 'Settings',
  campaigns: 'Campaigns',
  analytics: 'Analytics',
  settings: 'Settings',
  leads: 'Leads',
  opportunities: 'Opportunities',
  'growth-audit': 'Growth Audit',
  growth: 'Growth',
  'business-card': 'Business Card',
  qr: 'QR Engine',
  reviews: 'Reviews',
  ops: 'Platform Ops',
  events: 'Event Operations',
  ai: 'AI Operations',
  'ai-timeline': 'AI Agent Timeline',
};

export const SUITE_PRODUCTS = [
  {
    id: 'leadedge360',
    label: 'LeadEdge360',
    description: 'AI-powered lead management',
    href: '/dashboard',
  },
  {
    id: 'retailedge360',
    label: 'RetailEdge360',
    description: 'Retail intelligence & catalog',
    href: '/retailedge360',
  },
] as const;
