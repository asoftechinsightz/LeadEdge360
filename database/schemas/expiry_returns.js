/** expiry_returns collection schema */

export const EXPIRY_RETURNS_EXAMPLE = {
  id: '00000000-0000-4000-8000-000000000401',
  orgId: 'demo-org',
  returnNumber: 'RET-20250707-001',
  batchId: '00000000-0000-4000-8000-000000000201',
  batchNumber: 'BATCH-ABCD-1A2B3C',
  productId: '00000000-0000-4000-8000-000000000101',
  productName: 'Paracetamol 500mg',
  supplier: 'MedSupply Co',
  quantity: 50,
  reason: 'expired',
  status: 'pending',
  replacementRequested: false,
  creditNoteAmount: null,
  refundAmount: null,
  supplierStatus: 'pending',
  challanNumber: null,
  notes: '',
  approvedBy: null,
  approvedAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'admin-user-id',
  updatedBy: 'admin-user-id',
}

export const EXPIRY_RETURNS_INDEXES = [
  { key: { orgId: 1, id: 1 }, name: 'expiry_returns_orgId_id' },
  { key: { orgId: 1, returnNumber: 1 }, name: 'expiry_returns_org_number', unique: true },
  { key: { orgId: 1, status: 1 }, name: 'expiry_returns_org_status' },
  { key: { orgId: 1, supplier: 1 }, name: 'expiry_returns_org_supplier' },
  { key: { orgId: 1, createdAt: -1 }, name: 'expiry_returns_org_created' },
]
