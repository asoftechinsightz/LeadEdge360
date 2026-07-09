/**
 * Sprint 1 — business_cards collection schema (MongoDB).
 * Used by lib/growth/business-card/service.js
 *
 * Run indexes + seed: node scripts/mongo-bootstrap.mjs
 */

/** @typedef {Object} BusinessCardProfile */
export const BUSINESS_CARD_PROFILE_FIELDS = [
  'businessName',
  'tagline',
  'description',
  'phone',
  'email',
  'whatsapp',
  'website',
  'address',
  'city',
  'state',
  'pincode',
  'latitude',
  'longitude',
  'logoUrl',
  'coverUrl',
]

/**
 * Example document (insert via app API or mongo-bootstrap.mjs)
 * @type {import('mongodb').Document}
 */
export const BUSINESS_CARD_EXAMPLE = {
  id: '00000000-0000-4000-8000-000000000001',
  orgId: 'demo-org',
  slug: 'asoftech-demo',
  published: true,
  profile: {
    businessName: 'AsoftechInsightz',
    tagline: 'AI-powered growth for SMEs',
    description: 'CRM, marketing automation, and digital business tools.',
    phone: '+919999999999',
    email: 'admin@asoftechinsightz.com',
    whatsapp: '+919999999999',
    website: 'https://asoftechinsightz.com',
    address: 'Bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    logoUrl: '/images/brand/asoftechinsightz-logo.png',
    coverUrl: '',
  },
  socialLinks: {
    google: '',
    facebook: '',
    instagram: '',
    linkedin: '',
  },
  theme: {
    primaryColor: '#FF8A3D',
    layout: 'classic',
  },
  stats: {
    views: 0,
    clicks: 0,
    clicksBy: {},
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'admin-user-id',
  updatedBy: 'admin-user-id',
}

/** Indexes for business_cards — applied by scripts/mongo-bootstrap.mjs */
export const BUSINESS_CARD_INDEXES = [
  { key: { orgId: 1, id: 1 }, name: 'business_cards_orgId_id' },
  { key: { slug: 1 }, name: 'business_cards_slug_unique', unique: true },
  { key: { orgId: 1, updatedAt: -1 }, name: 'business_cards_orgId_updatedAt' },
]
