/**
 * Sprint 6 — retail_stores collection schema (MongoDB).
 */

export const RETAIL_STORE_EXAMPLE = {
  id: '00000000-0000-4000-8000-000000000100',
  orgId: 'demo-org',
  code: 'DEFAULT',
  name: 'Default Store',
  address: '',
  city: '',
  state: '',
  pincode: '',
  phone: '',
  timezone: 'Asia/Kolkata',
  active: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'admin-user-id',
  updatedBy: 'admin-user-id',
}

export const RETAIL_STORE_INDEXES = [
  { key: { orgId: 1, id: 1 }, name: 'retail_stores_orgId_id' },
  { key: { orgId: 1, code: 1 }, name: 'retail_stores_org_code', unique: true },
]
