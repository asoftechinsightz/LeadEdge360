import { USE_MOCK_API } from './config';
import { mockLeadEdgeApi } from './mock/client';
import { httpLeadEdgeApi } from './adapters/httpClient';
import type { LeadEdgeApiClient } from './types';

export type { LeadEdgeApiClient } from './types';
export type * from './types';
export { USE_MOCK_API } from './config';

let _client: LeadEdgeApiClient | null = null;

export function getLeadEdgeApi(): LeadEdgeApiClient {
  if (!_client) {
    _client = USE_MOCK_API ? mockLeadEdgeApi : httpLeadEdgeApi;
  }
  return _client;
}

/** Reset client (e.g. after toggling mock mode in tests) */
export function resetLeadEdgeApi() {
  _client = null;
}

export const leadEdgeApi = {
  commandCenter: () => getLeadEdgeApi().getCommandCenter(),
  executiveDashboard: () => getLeadEdgeApi().getExecutiveDashboard(),
  aiWorkspace: () => getLeadEdgeApi().getAIWorkspace(),
  aiInsights: () => getLeadEdgeApi().getAIInsights(),
  geoLeads: (params?: Parameters<LeadEdgeApiClient['getGeoLeads']>[0]) =>
    getLeadEdgeApi().getGeoLeads(params),
  territories: () => getLeadEdgeApi().getTerritories(),
  growthAudits: () => getLeadEdgeApi().getGrowthAudits(),
  growthScores: () => getLeadEdgeApi().getGrowthScores(),
  automations: () => getLeadEdgeApi().getAutomations(),
  revenueIntelligence: () => getLeadEdgeApi().getRevenueIntelligence(),
  leads: (params?: Parameters<LeadEdgeApiClient['getLeads']>[0]) =>
    getLeadEdgeApi().getLeads(params),
  conversations: () => getLeadEdgeApi().getConversations(),
  reports: () => getLeadEdgeApi().getReports(),
};
