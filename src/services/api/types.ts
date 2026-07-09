export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Won' | 'Lost';

export type Lead = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  territory: string;
  source: string;
  status: LeadStatus;
  score: number;
  label: 'Hot' | 'Warm' | 'Cold';
  budget?: number;
  lat?: number;
  lng?: number;
  assignedTo?: string;
  createdAt: string;
};

export type Territory = {
  id: string;
  name: string;
  region: string;
  manager: string;
  leadCount: number;
  wonRevenue: number;
  conversion: number;
  agents: number;
  status: 'active' | 'review';
};

export type GeoLead = {
  id: string;
  businessName: string;
  category: string;
  address: string;
  city: string;
  phone: string;
  website?: string;
  score: number;
  rating?: number;
  distanceKm: number;
  lat: number;
  lng: number;
};

export type AutomationWorkflow = {
  id: string;
  name: string;
  trigger: string;
  channel: string;
  status: 'active' | 'paused' | 'draft';
  runs: number;
  conversions: number;
  lastRunAt: string;
};

export type GrowthAudit = {
  id: string;
  company: string;
  website: string;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D';
  issues: number;
  scannedAt: string;
  status: 'completed' | 'running' | 'queued';
};

export type AIInsight = {
  id: string;
  type: 'opportunity' | 'risk' | 'action' | 'forecast';
  title: string;
  summary: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  createdAt: string;
  expectedImpact?: string;
  actionLabel?: string;
};

export type CommandCenterData = {
  kpis: {
    totalLeads: number;
    hotLeads: number;
    pipelineValue: number;
    conversionRate: number;
    revenueWon: number;
    automationsActive: number;
  };
  activityFeed: { id: string; text: string; time: string }[];
  priorityActions: { id: string; label: string; href: string }[];
};

export type RevenueIntelligenceData = {
  totalRevenue: number;
  forecastRevenue: number;
  avgDealSize: number;
  winRate: number;
  series: { month: string; revenue: number; forecast: number }[];
  byTerritory: { name: string; revenue: number }[];
  bySource: { name: string; revenue: number }[];
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pages: number;
};

export interface LeadEdgeApiClient {
  getCommandCenter(): Promise<CommandCenterData>;
  getExecutiveDashboard(): Promise<import('./mock/executive').ExecutiveDashboardData>;
  getAIWorkspace(): Promise<import('./mock/executive').AIWorkspaceData>;
  getAIInsights(): Promise<AIInsight[]>;
  getGeoLeads(params?: { city?: string; radius?: number; state?: string; industry?: string }): Promise<GeoLead[]>;
  getTerritories(): Promise<Territory[]>;
  getGrowthAudits(): Promise<GrowthAudit[]>;
  getGrowthScores(): Promise<import('./mock/executive').GrowthAuditScore[]>;
  getAutomations(): Promise<AutomationWorkflow[]>;
  getRevenueIntelligence(): Promise<RevenueIntelligenceData>;
  getLeads(params?: { page?: number; limit?: number }): Promise<Paginated<Lead>>;
  getConversations(): Promise<import('./mock/executive').ConversationThread[]>;
  getReports(): Promise<import('./mock/executive').ReportItem[]>;
}
