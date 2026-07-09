/** Dashboard KPI types */



export interface DashboardKpis {

  totalLeads?: number;

  hotLeads?: number;

  wonDeals?: number;

  revenue?: number;

  followupsDue?: number;

  conversionRate?: number;

  [key: string]: number | string | undefined;

}



export interface DashboardRevenue {

  range?: string;

  total?: number;

  series?: Array<{ date: string; value: number }>;

  [key: string]: unknown;

}



export interface RecentActivity {

  id?: string;

  type?: string;

  title?: string;

  summary?: string;

  leadName?: string;

  companyName?: string;

  opportunityName?: string | null;

  proposalNumber?: string | null;

  invoiceNumber?: string | null;

  contactName?: string | null;

  organizationName?: string | null;

  actorType?: 'user' | 'agent' | 'system';

  actorName?: string;

  actorLabel?: string;

  agentId?: string | null;

  icon?: string;

  message?: string;

  text?: string;

  time?: string;

  relativeTime?: string;

  timestamp?: string;

  createdAt?: string;

  leadHref?: string | null;

}



export interface RecentActivitiesResponse {

  success?: boolean;

  count?: number;

  activities?: RecentActivity[];

}

