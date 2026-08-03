import {
  LayoutDashboard,
  Target,
  ListTodo,
  CalendarClock,
  TrendingUp,
  Briefcase,
  FileText,
  Receipt,
  Radar,
  ScanSearch,
  BarChart3,
  IndianRupee,
  CreditCard,
  Repeat,
  Handshake,
  Coins,
  Users,
  Building2,
  Palette,
} from 'lucide-react'

/**
 * Enterprise navigation map — hrefs point at existing routes wherever possible.
 * Items without a dedicated page route to the closest live workspace or marketing page.
 */
export const ENTERPRISE_NAV = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/app',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    id: 'crm',
    label: 'CRM',
    icon: Target,
    items: [
      { label: 'Leads', href: '/leadedge360', icon: Target },
      { label: 'Tasks', href: '/app/crm', icon: ListTodo },
      { label: 'Followups', href: '/app/crm', icon: CalendarClock },
    ],
  },
  {
    id: 'sales-hub',
    label: 'Sales Hub',
    icon: TrendingUp,
    items: [
      { label: 'Opportunities', href: '/app/sales', icon: Briefcase },
      { label: 'Proposals', href: '/leadedge360', icon: FileText },
      { label: 'Invoices', href: '/pricing', icon: Receipt },
    ],
  },
  {
    id: 'growth-engine',
    label: 'Growth Engine',
    icon: Radar,
    items: [
      { label: 'Website Audit', href: '/products', icon: ScanSearch },
      { label: 'Scanner Jobs', href: '/retailedge360', icon: Radar },
      { label: 'Results', href: '/retailedge360', icon: BarChart3 },
    ],
  },
  {
    id: 'revenue-center',
    label: 'Revenue Center',
    icon: IndianRupee,
    items: [
      { label: 'Revenue', href: '/app/revenue', icon: IndianRupee },
      { label: 'Payments', href: '/pricing', icon: CreditCard },
      { label: 'Subscriptions', href: '/pricing', icon: Repeat },
    ],
  },
  {
    id: 'partner-hub',
    label: 'Partner Hub',
    icon: Handshake,
    items: [
      { label: 'Partners', href: '/app/partners', icon: Handshake },
      { label: 'Commissions', href: '/app/partners', icon: Coins },
    ],
  },
  {
    id: 'administration',
    label: 'Administration',
    icon: Building2,
    items: [
      { label: 'Users', href: '/signin', icon: Users },
      { label: 'Organization', href: '/about', icon: Building2 },
      { label: 'Branding', href: '/products', icon: Palette },
    ],
  },
]

/** Flatten nav for breadcrumb / search helpers */
export function flattenEnterpriseNav(nav = ENTERPRISE_NAV) {
  const items = []
  for (const entry of nav) {
    if (entry.href) {
      items.push({ label: entry.label, href: entry.href, group: null })
    }
    if (entry.items) {
      for (const child of entry.items) {
        items.push({ label: child.label, href: child.href, group: entry.label })
      }
    }
  }
  return items
}

export function matchNavHref(pathname, href, exact = false) {
  if (!pathname || !href) return false
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function isNavItemActive(pathname, href, exact = false) {
  return matchNavHref(pathname, href, exact)
}

export function isNavGroupActive(pathname, group) {
  if (group.href && isNavItemActive(pathname, group.href, group.exact)) return true
  return group.items?.some((item) => isNavItemActive(pathname, item.href)) ?? false
}
