import {
  LayoutDashboard,
  Target,
  IndianRupee,
  CreditCard,
} from 'lucide-react'

export const PRODUCTS = [
  {
    id: 'leadedge360',
    name: 'LeadEdge360',
    shortName: 'LeadEdge360',
    description: 'CRM & lead intelligence',
    href: '/leadedge360',
    accent: 'primary',
    icon: Target,
  },
  {
    id: 'retailedge360',
    name: 'RetailEdge360',
    shortName: 'RetailEdge360',
    description: 'Expiry & shelf-life AI',
    href: '/retailedge360',
    accent: 'accent',
    icon: IndianRupee,
  },
]

/** Production-only workspace navigation (no /app/* stubs). */
export const WORKSPACE_NAV = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true, accent: 'primary' },
    ],
  },
  {
    label: 'Products',
    items: [
      { href: '/leadedge360', label: 'LeadEdge360', icon: Target, exact: true, accent: 'primary' },
      { href: '/retailedge360', label: 'RetailEdge360', icon: IndianRupee, exact: true, accent: 'accent' },
    ],
  },
  {
    label: 'Account',
    items: [
      { href: '/billing', label: 'Billing', icon: CreditCard, exact: false, accent: 'primary' },
    ],
  },
]

/** Path segment → breadcrumb label */
export const BREADCRUMB_LABELS = {
  dashboard: 'Dashboard',
  leadedge360: 'LeadEdge360',
  retailedge360: 'RetailEdge360',
  billing: 'Billing',
  success: 'Success',
}
