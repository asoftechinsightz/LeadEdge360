import { API_DELAY_MS } from '../config';
import type { LeadEdgeApiClient, Paginated, Lead } from '../types';
import {
  MOCK_AI_INSIGHTS,
  MOCK_AUTOMATIONS,
  MOCK_COMMAND_CENTER,
  MOCK_GEO_LEADS,
  MOCK_GROWTH_AUDITS,
  MOCK_LEADS,
  MOCK_REVENUE_INTELLIGENCE,
  MOCK_TERRITORIES,
} from './data';
import {
  MOCK_EXECUTIVE,
  MOCK_AI_WORKSPACE,
  MOCK_CONVERSATIONS,
  MOCK_REPORTS,
  MOCK_GROWTH_SCORES,
} from './executive';

const delay = () => new Promise((r) => setTimeout(r, API_DELAY_MS));

export const mockLeadEdgeApi: LeadEdgeApiClient = {
  async getCommandCenter() {
    await delay();
    return { ...MOCK_COMMAND_CENTER };
  },

  async getExecutiveDashboard() {
    await delay();
    return { ...MOCK_EXECUTIVE };
  },

  async getAIWorkspace() {
    await delay();
    return { ...MOCK_AI_WORKSPACE, scoringCards: [...MOCK_AI_WORKSPACE.scoringCards] };
  },

  async getAIInsights() {
    await delay();
    return [...MOCK_AI_INSIGHTS];
  },

  async getGeoLeads(params) {
    await delay();
    let items = [...MOCK_GEO_LEADS];
    if (params?.city) {
      items = items.filter((g) => g.city.toLowerCase().includes(params.city!.toLowerCase()));
    }
    return { items };
  },

  async getTerritories() {
    await delay();
    return [...MOCK_TERRITORIES];
  },

  async getGrowthAudits() {
    await delay();
    return [...MOCK_GROWTH_AUDITS];
  },

  async getGrowthScores() {
    await delay();
    return [...MOCK_GROWTH_SCORES];
  },

  async getAutomations() {
    await delay();
    return [...MOCK_AUTOMATIONS];
  },

  async getRevenueIntelligence() {
    await delay();
    return { ...MOCK_REVENUE_INTELLIGENCE };
  },

  async getLeads(params = {}) {
    await delay();
    const page = params.page || 1;
    const limit = params.limit || 20;
    const start = (page - 1) * limit;
    const slice = MOCK_LEADS.slice(start, start + limit);
    const result: Paginated<Lead> = {
      items: slice,
      total: MOCK_LEADS.length,
      page,
      pages: Math.ceil(MOCK_LEADS.length / limit) || 1,
    };
    return result;
  },

  async getConversations() {
    await delay();
    return [...MOCK_CONVERSATIONS];
  },

  async getReports() {
    await delay();
    return [...MOCK_REPORTS];
  },
};
