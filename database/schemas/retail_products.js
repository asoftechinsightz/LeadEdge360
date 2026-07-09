/**
 * Sprint 6 — retail_products catalog schema (MongoDB).
 */

export const RETAIL_PRODUCT_EXAMPLE = {
  id: '00000000-0000-4000-8000-000000000101',
  orgId: 'demo-org',
  sku: 'SKU-001',
  name: 'Amul Taaza Milk 1L',
  category: 'dairy',
  barcode: '',
  unit: 'pcs',
  price: 56,
  cost: 48,
  taxRate: 5,
  active: true,
  predictedShelfDays: 7,
  risk: 'High',
  recommendation: 'Discount 30% and feature on homepage.',
  reasoning: ['Category baseline: 7 days for dairy'],
  engine: 'rules',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'admin-user-id',
  updatedBy: 'admin-user-id',
}

export const RETAIL_PRODUCT_INDEXES = [
  { key: { orgId: 1, id: 1 }, name: 'retail_products_orgId_id' },
  { key: { orgId: 1, sku: 1 }, name: 'retail_products_org_sku', unique: true },
  { key: { orgId: 1, category: 1 }, name: 'retail_products_org_category' },
  { key: { orgId: 1, risk: 1 }, name: 'retail_products_org_risk' },
]
