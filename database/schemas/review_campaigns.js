/**
 * Sprint 3 — review_campaigns collection schema (MongoDB).
 */

export const REVIEW_CAMPAIGN_EXAMPLE = {
  id: '00000000-0000-4000-8000-000000000020',
  orgId: 'demo-org',
  name: 'Google Reviews Q2',
  description: '',
  channel: 'link',
  reviewUrl: 'https://g.page/r/example',
  message: 'We would love your feedback!',
  status: 'active',
  stats: { sent: 0, opened: 0, completed: 0, totalRating: 0, ratingCount: 0, avgRating: 0 },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'admin-user-id',
  updatedBy: 'admin-user-id',
}

export const REVIEW_CAMPAIGN_INDEXES = [
  { key: { orgId: 1, id: 1 }, name: 'review_campaigns_orgId_id' },
  { key: { orgId: 1, createdAt: -1 }, name: 'review_campaigns_orgId_createdAt' },
  { key: { orgId: 1, status: 1 }, name: 'review_campaigns_orgId_status' },
]
