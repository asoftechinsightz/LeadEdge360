/** Lead types — mirrors docs/openapi.json Lead + LeadInput */

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Won' | 'Lost';
export type LeadLabel = 'Hot' | 'Warm' | 'Cold' | 'Platinum';
export type LeadSource = 'website' | 'facebook' | 'google' | 'whatsapp' | 'referral' | 'manual' | string;

export interface LeadInput {
  name: string;
  phone: string;
  email?: string;
  company?: string;
  message?: string;
  source?: LeadSource;
  territory?: string;
  budget?: number;
  whatsappOptIn?: boolean;
  whatsapp?: boolean;
}

export interface Lead extends LeadInput {
  id: string;
  tenantId?: string;
  orgId?: string;
  score?: number;
  label?: LeadLabel | string;
  scoringReasons?: string[];
  reasons?: string[];
  scoringEngine?: 'llm' | 'rules' | 'rules-fallback' | string;
  engine?: string;
  status?: LeadStatus | string;
  assignedToId?: string;
  assignedTo?: string;
  assignedToName?: string;
  assignedAgentId?: string;
  nextFollowupAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeadsListResponse {
  leads: Lead[];
  meta?: {
    page: number;
    pageSize: number;
    total: number;
    hasMore?: boolean;
  };
}
