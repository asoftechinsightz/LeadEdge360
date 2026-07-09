/**
 * AsoftechInsightz — canonical brand tokens
 * @see docs/brand/BRAND_GUIDELINES.md
 */

export const BRAND_NAME = 'AsoftechInsightz'
export const BRAND_PROMISE = 'Innovate • Integrate • Deliver • Satisfy'
export const BRAND_TAGLINE = 'AI-Powered Business Growth Platform'
export const BRAND_SUITE_LABEL = 'Enterprise AI SaaS Suite'

export const BRAND_LOGOS = {
  master: '/images/brand/asoftechinsightz-logo.svg',
  masterPng: '/images/brand/asoftechinsightz-logo.png',
  leadedge360: '/images/brand/leadedge360-logo.svg',
  retailedge360: '/images/brand/retailedge360-logo.svg',
  leadedge360Icon: '/images/brand/leadedge360-icon.svg',
  retailedge360Icon: '/images/brand/retailedge360-icon.svg',
}

/** @deprecated Use BRAND_LOGOS.master */
export const BRAND_LOGO_SRC = BRAND_LOGOS.master

export const BRAND_COLORS = {
  primaryBlue: '#0066FF',
  deepNavy: '#0A1F44',
  cyan: '#00C6FF',
  white: '#FFFFFF',
  lightGray: '#F5F7FA',
  leadedgeGreen: '#22C55E',
  retailOrange: '#FF7A00',
}

export const PRODUCTS = {
  leadedge360: {
    id: 'leadedge360',
    name: 'LeadEdge360',
    shortName: 'LeadEdge',
    suffix: '360',
    tagline: 'AI Sales, Marketing & Revenue Growth',
    description: 'AI-powered lead management, CRM, and revenue intelligence',
    logo: BRAND_LOGOS.leadedge360,
    marketingHref: '/products/leadedge360',
    href: '/dashboard',
    accent: 'growth',
    accentHex: BRAND_COLORS.leadedgeGreen,
  },
  retailedge360: {
    id: 'retailedge360',
    name: 'RetailEdge360',
    shortName: 'RetailEdge',
    suffix: '360',
    tagline: 'AI Retail Operations & Inventory Intelligence',
    description: 'Smart POS, inventory intelligence, and multi-store retail',
    logo: BRAND_LOGOS.retailedge360,
    marketingHref: '/products/retailedge360',
    href: '/retailedge360',
    accent: 'retail',
    accentHex: BRAND_COLORS.retailOrange,
  },
  trinetra360: {
    id: 'trinetra360',
    name: 'Trinetra360',
    shortName: 'Trinetra',
    suffix: '360',
    tagline: 'Enterprise Observability & AIOps',
    description: 'Infrastructure monitoring, logs, traces, and AIOps',
    logo: null,
    marketingHref: '/products/trinetra360',
    href: '/products/trinetra360',
    accent: 'observability',
    accentHex: '#8B5CF6',
  },
}

/** @typedef {'leadedge360' | 'retailedge360'} ProductBrandId */

export function getProductBrandFromPath(pathname) {
  if (pathname?.startsWith('/retailedge360')) return 'retailedge360'
  if (
    pathname?.startsWith('/leadedge360') ||
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/leads') ||
    pathname?.startsWith('/opportunities') ||
    pathname?.startsWith('/proposals') ||
    pathname?.startsWith('/campaigns') ||
    pathname?.startsWith('/invoices') ||
    pathname?.startsWith('/revenue') ||
    pathname?.startsWith('/analytics') ||
    pathname?.startsWith('/growth') ||
    pathname?.startsWith('/growth-audit') ||
    pathname?.startsWith('/payments')
  ) {
    return 'leadedge360'
  }
  return 'master'
}

export function getPoweredByLabel(productId) {
  return `Powered by ${BRAND_NAME}`
}
