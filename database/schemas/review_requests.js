/**
 * Sprint 3 — review_requests collection schema (MongoDB).
 */

export const REVIEW_REQUEST_EXAMPLE = {
  id: '00000000-0000-4000-8000-000000000021',
  orgId: 'demo-org',
  campaignId: '00000000-0000-4000-8000-000000000020',
  token: 'abc123token',
  customerName: 'Demo Customer',
  customerEmail: 'customer@example.com',
  customerPhone: '',
  status: 'sent',
  rating: null,
  comment: '',
  sentAt: new Date().toISOString(),
  openedAt: null,
  completedAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'admin-user-id',
  updatedBy: 'admin-user-id',
}

export const REVIEW_REQUEST_INDEXES = [
  { key: { orgId: 1, id: 1 }, name: 'review_requests_orgId_id' },
  { key: { orgId: 1, campaignId: 1, createdAt: -1 }, name: 'review_requests_org_campaign_createdAt' },
  { key: { token: 1 }, name: 'review_requests_token_unique', unique: true },
  { key: { orgId: 1, createdAt: -1 }, name: 'review_requests_orgId_createdAt' },
]
