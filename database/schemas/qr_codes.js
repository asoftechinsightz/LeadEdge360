/**
 * Sprint 2 — qr_codes collection schema (MongoDB).
 */

export const QR_CODE_TYPES = [
  'business_card',
  'whatsapp',
  'review',
  'website',
  'lead_form',
  'custom_url',
]

export const QR_CODE_EXAMPLE = {
  id: '00000000-0000-4000-8000-000000000010',
  orgId: 'demo-org',
  code: 'abc12def',
  type: 'business_card',
  targetId: '00000000-0000-4000-8000-000000000001',
  payload: {},
  label: 'Demo business card QR',
  active: true,
  stats: { scans: 0, clicks: 0, conversions: 0 },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'admin-user-id',
  updatedBy: 'admin-user-id',
}

export const QR_CODE_INDEXES = [
  { key: { orgId: 1 }, name: 'qr_codes_orgId' },
  { key: { orgId: 1, type: 1 }, name: 'qr_codes_orgId_type' },
  { key: { orgId: 1, code: 1 }, name: 'qr_codes_orgId_code', unique: true },
  { key: { orgId: 1, createdAt: -1 }, name: 'qr_codes_orgId_createdAt' },
  { key: { code: 1 }, name: 'qr_codes_code_unique', unique: true },
]
