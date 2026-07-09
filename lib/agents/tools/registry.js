/**
 * Approved tool registry — agents invoke tools instead of direct DB access.
 */

export const TOOL_REGISTRY = {
  crm_search: {
    id: 'crm_search',
    name: 'CRM Search',
    module: 'crm',
    description: 'Search leads and contacts in CRM.',
    actions: ['read'],
  },
  customer_lookup: {
    id: 'customer_lookup',
    name: 'Customer Lookup',
    module: 'crm',
    description: 'Look up customer profile and history.',
    actions: ['read'],
  },
  lead_search: {
    id: 'lead_search',
    name: 'Lead Search',
    module: 'crm',
    description: 'Search and filter leads by criteria.',
    actions: ['read'],
  },
  proposal_generator: {
    id: 'proposal_generator',
    name: 'Proposal Generator',
    module: 'proposals',
    description: 'Generate proposal drafts from opportunity context.',
    actions: ['read', 'create'],
  },
  invoice_generator: {
    id: 'invoice_generator',
    name: 'Invoice Generator',
    module: 'billing',
    description: 'Create invoices from won proposals.',
    actions: ['read', 'create'],
  },
  campaign_generator: {
    id: 'campaign_generator',
    name: 'Campaign Generator',
    module: 'campaigns',
    description: 'Create and configure marketing campaigns.',
    actions: ['read', 'create'],
  },
  geo_lead_finder: {
    id: 'geo_lead_finder',
    name: 'Geo Lead Finder',
    module: 'scanner',
    description: 'Discover geo-targeted leads via scanner.',
    actions: ['read', 'create'],
  },
  calendar: {
    id: 'calendar',
    name: 'Calendar',
    module: 'scheduling',
    description: 'Schedule meetings and calendar events.',
    actions: ['read', 'create'],
  },
  email: {
    id: 'email',
    name: 'Email',
    module: 'communications',
    description: 'Send email to leads and customers.',
    actions: ['create'],
  },
  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp',
    module: 'communications',
    description: 'Send WhatsApp messages.',
    actions: ['create'],
  },
  document_search: {
    id: 'document_search',
    name: 'Document Search',
    module: 'documents',
    description: 'Search uploaded documents and versions.',
    actions: ['read'],
  },
  knowledge_base: {
    id: 'knowledge_base',
    name: 'Knowledge Base',
    module: 'knowledge',
    description: 'Query organizational knowledge base.',
    actions: ['read'],
  },
  report_generator: {
    id: 'report_generator',
    name: 'Report Generator',
    module: 'analytics',
    description: 'Generate business reports and summaries.',
    actions: ['read', 'create'],
  },
}

export function getTool(toolId) {
  return TOOL_REGISTRY[toolId] || null
}

export function listTools() {
  return Object.values(TOOL_REGISTRY)
}
