/**
 * MongoDB document shapes for UAT defect fixes.
 * Reference only — enforced in lib/*/service.js and API routes.
 */

/** @typedef {Object} TerritoryDoc
 * @property {string} id
 * @property {string} orgId
 * @property {string} name
 * @property {string} code
 * @property {string} region
 * @property {string} manager
 * @property {boolean} active
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string} createdBy
 * @property {string} updatedBy
 */

/** @typedef {Object} LeadSoftDeleteFields
 * @property {string} [deletedAt]   ISO timestamp — set on soft delete
 * @property {string} [deletedBy]   user id or email
 * @property {string} [restoredAt]  ISO timestamp — set on admin restore
 * @property {string} [restoredBy]  user id or email
 */

/** @typedef {Object} LeadAssignmentDoc
 * @property {string} id
 * @property {string} orgId
 * @property {string} leadId
 * @property {string} assignedTo
 * @property {string} assignedBy
 * @property {string|null} assignedAgentId
 * @property {Date|string} createdAt
 */

/** @typedef {Object} AuditLogDoc
 * @property {string} id
 * @property {string} orgId
 * @property {string|null} userId
 * @property {string} action       e.g. lead.soft_delete | lead.restore
 * @property {string|null} entity    e.g. lead
 * @property {string|null} entityId
 * @property {string|null} detail
 * @property {string} ip
 * @property {string} ua
 * @property {string} createdAt
 */

export const UAT_COLLECTIONS = {
  territories: 'territories',
  audit_logs: 'audit_logs',
}

export const LEAD_SOFT_DELETE_FIELDS = ['deletedAt', 'deletedBy', 'restoredAt', 'restoredBy']

export const TERRITORY_DEFAULTS = [
  'Bengaluru',
  'Mumbai',
  'Delhi NCR',
  'Hyderabad',
  'Chennai',
  'Pune',
]
