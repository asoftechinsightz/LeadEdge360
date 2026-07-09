/**
 * Sprint 6 — retail_inventory schema (MongoDB).
 */

export const RETAIL_INVENTORY_EXAMPLE = {
  id: '00000000-0000-4000-8000-000000000102',
  orgId: 'demo-org',
  storeId: '00000000-0000-4000-8000-000000000100',
  productId: '00000000-0000-4000-8000-000000000101',
  quantity: 50,
  reservedQty: 0,
  reorderLevel: 10,
  daysOnShelf: 2,
  expiryDate: new Date().toISOString(),
  lastCountedAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'admin-user-id',
  updatedBy: 'admin-user-id',
}

export const RETAIL_INVENTORY_INDEXES = [
  { key: { orgId: 1, id: 1 }, name: 'retail_inventory_orgId_id' },
  { key: { orgId: 1, storeId: 1, productId: 1 }, name: 'retail_inventory_org_store_product', unique: true },
  { key: { orgId: 1, storeId: 1 }, name: 'retail_inventory_org_store' },
  { key: { orgId: 1, expiryDate: 1 }, name: 'retail_inventory_org_expiry' },
]
