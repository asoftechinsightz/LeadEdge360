import type { AIInsight } from '../types';

export type ExecutiveKPI = {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type QuickAccessCard = {
  href: string;
  label: string;
  stat: string;
  icon: string;
};

export type PipelineStage = {
  name: string;
  count: number;
  color: string;
};

export type RevenuePoint = {
  date: string;
  revenue: number;
};

export type LeadSourceSlice = {
  name: string;
  value: number;
  color: string;
};

export type LocationLead = {
  city: string;
  state: string;
  count: number;
};

export type ActivityItem = {
  id: string;
  text: string;
  time: string;
  type: 'lead' | 'deal' | 'invoice' | 'campaign' | 'task';
};

export type TopTerritory = {
  city: string;
  leads: number;
  growthPct: number;
  conversionPct: number;
  revenue: string;
};

export type ExecutiveOverviewItem = {
  label: string;
  value: string;
  sub: string;
  trend?: 'up' | 'down' | 'neutral';
};

export type UpcomingTask = {
  id: string;
  title: string;
  due: string;
  priority: 'high' | 'medium' | 'low';
  owner: string;
};

export type CampaignPerformancePoint = {
  week: string;
  leads: number;
  spend: number;
};

export type ExecutiveDashboardData = {
  greeting: string;
  dateLabel: string;
  workspaceName: string;
  executiveOverview: ExecutiveOverviewItem[];
  kpis: ExecutiveKPI[];
  quickAccess: QuickAccessCard[];
  pipeline: PipelineStage[];
  pipelineConversion: number;
  avgDealSize: number;
  revenueTrend: RevenuePoint[];
  revenueTotal: number;
  revenueChange: string;
  aiRecommendations: AIInsight[];
  leadSources: LeadSourceSlice[];
  locationLeads: LocationLead[];
  topTerritories: TopTerritory[];
  totalLeadCount: number;
  recentActivities: ActivityItem[];
  upcomingTasks: UpcomingTask[];
  campaignPerformance: CampaignPerformancePoint[];
};

export type AIScoringCard = {
  id: string;
  leadName: string;
  company: string;
  score: number;
  reason: string;
  recommendation: string;
  predictedRevenue: number;
  confidence: number;
  module: string;
};

export type AIWorkspaceData = {
  modules: { id: string; name: string; description: string; count: number }[];
  scoringCards: AIScoringCard[];
};

export type ConversationThread = {
  id: string;
  contact: string;
  channel: 'whatsapp' | 'email' | 'chat' | 'instagram' | 'facebook';
  preview: string;
  time: string;
  unread: boolean;
};

export type ReportItem = {
  id: string;
  name: string;
  category: string;
  lastGenerated: string;
  format: string;
};

export const MOCK_EXECUTIVE: ExecutiveDashboardData = {
  greeting: 'Good evening, Anoop!',
  dateLabel: '22 May 2026',
  workspaceName: 'AsoftechInsightz · Enterprise',
  executiveOverview: [
    { label: "Today's Leads", value: '24', sub: '+12% vs yesterday', trend: 'up' },
    { label: 'Meetings Scheduled', value: '8', sub: '+2 vs yesterday', trend: 'up' },
    { label: 'Tasks Due', value: '12', sub: '4 high priority', trend: 'neutral' },
    { label: 'Pipeline Value', value: '₹24.5L', sub: '+22% this week', trend: 'up' },
    { label: 'Forecast Revenue', value: '₹18.5L', sub: 'Month-end projection', trend: 'up' },
    { label: 'AI Recommendations', value: '4', sub: 'Actionable now', trend: 'neutral' },
  ],
  kpis: [
    { label: 'Total Leads', value: '1,248', change: '+18% vs last 7 days', trend: 'up' },
    { label: 'Pipeline Value', value: '₹24,50,000', change: '+22% vs last 7 days', trend: 'up' },
    { label: 'Won Deals', value: '56', change: '+35% vs last 7 days', trend: 'up' },
    { label: 'Revenue (This Month)', value: '₹5,80,000', change: '+32% vs last month', trend: 'up' },
    { label: 'Conversion Rate', value: '18.5%', change: '+8% vs last month', trend: 'up' },
    { label: 'AI Insights', value: '12', change: 'New recommendations', trend: 'neutral' },
  ],
  quickAccess: [
    { href: '/leads', label: 'Leads', stat: '1,248 Total', icon: 'leads' },
    { href: '/opportunities', label: 'Opportunities', stat: '94 In Pipeline', icon: 'opportunities' },
    { href: '/campaigns', label: 'Campaigns', stat: '7 Running', icon: 'campaigns' },
    { href: '/leadedge360/command-center', label: 'AI Command Center', stat: '12 Insights', icon: 'ai' },
    { href: '/leadedge360/growth-engine', label: 'Growth Audit', stat: 'Free Audit', icon: 'growth' },
    { href: '/leadedge360/automation', label: 'Automation Hub', stat: '18 Workflows', icon: 'automation' },
  ],
  pipeline: [
    { name: 'New', count: 44, color: '#38BDF8' },
    { name: 'Contacted', count: 120, color: '#6366F1' },
    { name: 'Qualified', count: 82, color: '#A78BFA' },
    { name: 'Proposal', count: 36, color: '#F59E0B' },
    { name: 'Won', count: 12, color: '#22C55E' },
    { name: 'Lost', count: 8, color: '#EF4444' },
  ],
  pipelineConversion: 12.8,
  avgDealSize: 223214,
  revenueTrend: [
    { date: 'May 1', revenue: 120000 },
    { date: 'May 5', revenue: 185000 },
    { date: 'May 10', revenue: 210000 },
    { date: 'May 15', revenue: 280000 },
    { date: 'May 20', revenue: 350000 },
    { date: 'May 25', revenue: 420000 },
    { date: 'May 30', revenue: 580000 },
  ],
  revenueTotal: 2450000,
  revenueChange: '+32%',
  aiRecommendations: [
    { id: 'R1', type: 'action', title: 'Increase Google Ads Budget', summary: 'Google Ads CPL is 40% lower than Facebook. Reallocate ₹50K for higher ROI.', impact: 'high', confidence: 92, expectedImpact: 'Expected +18% Leads', actionLabel: 'Adjust Budget', createdAt: '2026-06-22T10:00:00Z' },
    { id: 'R2', type: 'opportunity', title: 'High Conversion Opportunity', summary: '12 leads in Qualified stage have 85%+ win probability. Recommend immediate follow-up.', impact: 'high', confidence: 92, expectedImpact: 'Expected +₹4.2L pipeline', actionLabel: 'View Leads', createdAt: '2026-06-22T09:30:00Z' },
    { id: 'R3', type: 'risk', title: 'Lead Score Alert', summary: '8 hot leads have no activity in 48 hours. Risk of losing to competitors.', impact: 'high', confidence: 88, expectedImpact: 'Prevent 3 deal losses', actionLabel: 'Assign Tasks', createdAt: '2026-06-22T09:00:00Z' },
    { id: 'R4', type: 'forecast', title: 'Revenue Prediction', summary: 'Based on current pipeline velocity, projected ₹18.5L revenue this month (+32%).', impact: 'medium', confidence: 85, expectedImpact: '+32% vs last month', actionLabel: 'View Forecast', createdAt: '2026-06-22T08:30:00Z' },
  ],
  leadSources: [
    { name: 'Google Ads', value: 34, color: '#38BDF8' },
    { name: 'Website', value: 25, color: '#22C55E' },
    { name: 'Facebook', value: 21, color: '#6366F1' },
    { name: 'Instagram', value: 12, color: '#EC4899' },
    { name: 'Others', value: 8, color: '#94A3B8' },
  ],
  locationLeads: [
    { city: 'Lucknow', state: 'UP', count: 312 },
    { city: 'Kanpur', state: 'UP', count: 186 },
    { city: 'Noida', state: 'UP', count: 145 },
    { city: 'Varanasi', state: 'UP', count: 98 },
    { city: 'Prayagraj', state: 'UP', count: 76 },
  ],
  topTerritories: [
    { city: 'Lucknow', leads: 312, growthPct: 18, conversionPct: 12.4, revenue: '₹3.4L' },
    { city: 'Kanpur', leads: 186, growthPct: 11, conversionPct: 10.2, revenue: '₹2.1L' },
    { city: 'Noida', leads: 145, growthPct: 21, conversionPct: 14.8, revenue: '₹4.8L' },
    { city: 'Varanasi', leads: 98, growthPct: 9, conversionPct: 9.6, revenue: '₹1.6L' },
    { city: 'Prayagraj', leads: 76, growthPct: 7, conversionPct: 8.1, revenue: '₹1.2L' },
  ],
  totalLeadCount: 1248,
  recentActivities: [
    { id: 'A1', text: 'Lead Created — Priya Sharma from NovaTech', time: '2 min ago', type: 'lead' },
    { id: 'A2', text: 'Proposal Sent — CloudSync Solutions ₹12L', time: '1 hr ago', type: 'deal' },
    { id: 'A3', text: 'Invoice Paid — #INV-2041 ₹2,45,000', time: '3 hr ago', type: 'invoice' },
    { id: 'A4', text: 'Campaign Started — "Summer Push" generated 24 leads', time: '5 hr ago', type: 'campaign' },
    { id: 'A5', text: 'Task Completed — Follow-up with Skyline Properties', time: '6 hr ago', type: 'task' },
  ],
  upcomingTasks: [
    { id: 'T1', title: 'Follow up with 8 hot leads', due: 'Today, 4:00 PM', priority: 'high', owner: 'Anoop S.' },
    { id: 'T2', title: 'Schedule demo with Prime Co.', due: 'Tomorrow, 10:00 AM', priority: 'high', owner: 'Priya M.' },
    { id: 'T3', title: 'Review Q2 pipeline forecast', due: 'Wed, 2:00 PM', priority: 'medium', owner: 'Rahul V.' },
    { id: 'T4', title: 'Send proposal to Skyline Properties', due: 'Thu, 11:00 AM', priority: 'low', owner: 'Anita D.' },
  ],
  campaignPerformance: [
    { week: 'W1', leads: 42, spend: 28000 },
    { week: 'W2', leads: 58, spend: 32000 },
    { week: 'W3', leads: 51, spend: 35000 },
    { week: 'W4', leads: 74, spend: 38000 },
    { week: 'W5', leads: 68, spend: 36000 },
    { week: 'W6', leads: 89, spend: 41000 },
  ],
};

export const MOCK_AI_WORKSPACE: AIWorkspaceData = {
  modules: [
    { id: 'scoring', name: 'AI Lead Scoring', description: 'Real-time lead quality assessment', count: 248 },
    { id: 'recommendations', name: 'AI Recommendations', description: 'Next-best-action suggestions', count: 12 },
    { id: 'revenue', name: 'Revenue Prediction', description: 'Forecast pipeline revenue', count: 6 },
    { id: 'campaign', name: 'Campaign Generator', description: 'AI-crafted campaign copy', count: 4 },
    { id: 'followup', name: 'Follow-up Assistant', description: 'Smart nurture sequences', count: 18 },
    { id: 'opportunity', name: 'Opportunity Intelligence', description: 'Win probability analysis', count: 94 },
    { id: 'churn', name: 'Churn Risk Detection', description: 'At-risk deal alerts', count: 7 },
    { id: 'forecast', name: 'Sales Forecasting', description: 'Quarterly revenue projections', count: 3 },
  ],
  scoringCards: [
    { id: 'SC1', leadName: 'Priya Sharma', company: 'NovaTech Pvt Ltd', score: 92, reason: 'High budget, decision-maker engaged, website visit x5', recommendation: 'Send proposal within 24h', predictedRevenue: 450000, confidence: 92, module: 'AI Lead Scoring' },
    { id: 'SC2', leadName: 'Anita Desai', company: 'Skyline Properties', score: 85, reason: 'Proposal stage, 3 follow-ups completed', recommendation: 'Schedule closing call', predictedRevenue: 890000, confidence: 88, module: 'Opportunity Intelligence' },
    { id: 'SC3', leadName: 'Rahul Verma', company: 'GreenLeaf Retail', score: 78, reason: 'Warm engagement, WhatsApp responsive', recommendation: 'Share case study + demo invite', predictedRevenue: 220000, confidence: 76, module: 'Follow-up Assistant' },
    { id: 'SC4', leadName: 'Vikram Singh', company: 'AutoParts Hub', score: 64, reason: 'New lead, limited data', recommendation: 'Run growth audit on website', predictedRevenue: 150000, confidence: 58, module: 'Churn Risk Detection' },
    { id: 'SC5', leadName: 'Meera Iyer', company: 'CloudSync Solutions', score: 96, reason: 'Won deal — upsell opportunity', recommendation: 'Propose annual support plan', predictedRevenue: 180000, confidence: 91, module: 'Revenue Prediction' },
  ],
};

export const MOCK_CONVERSATIONS: ConversationThread[] = [
  { id: 'C1', contact: 'Priya Sharma', channel: 'whatsapp', preview: 'Thanks for the proposal. Can we schedule a call?', time: '2 min ago', unread: true },
  { id: 'C2', contact: 'Rahul Verma', channel: 'email', preview: 'Re: Product demo request', time: '15 min ago', unread: true },
  { id: 'C3', contact: 'Website Visitor', channel: 'chat', preview: 'Interested in enterprise pricing', time: '1 hr ago', unread: false },
  { id: 'C4', contact: 'Anita Desai', channel: 'whatsapp', preview: 'Proposal looks good. Minor revisions needed.', time: '2 hr ago', unread: false },
  { id: 'C5', contact: 'Lead from Instagram', channel: 'instagram', preview: 'DM: Want to know more about LeadEdge360', time: '3 hr ago', unread: true },
];

export const MOCK_REPORTS: ReportItem[] = [
  { id: 'RP1', name: 'Executive Summary', category: 'Executive', lastGenerated: '2026-06-22', format: 'PDF' },
  { id: 'RP2', name: 'Sales Performance', category: 'Sales', lastGenerated: '2026-06-21', format: 'PDF' },
  { id: 'RP3', name: 'Campaign ROI Analysis', category: 'Campaign', lastGenerated: '2026-06-20', format: 'XLSX' },
  { id: 'RP4', name: 'Revenue Forecast Q2', category: 'Revenue', lastGenerated: '2026-06-19', format: 'PDF' },
  { id: 'RP5', name: 'Growth Audit Summary', category: 'Growth Audit', lastGenerated: '2026-06-18', format: 'PDF' },
  { id: 'RP6', name: 'Territory Coverage', category: 'Territory', lastGenerated: '2026-06-17', format: 'PDF' },
];

export type GrowthAuditScore = {
  label: string;
  score: number;
  max: number;
  recommendation?: string;
};

export const MOCK_GROWTH_SCORES: GrowthAuditScore[] = [
  { label: 'SEO', score: 72, max: 100, recommendation: 'Improve meta tags and page speed on top 5 landing pages' },
  { label: 'Lead Generation', score: 65, max: 100, recommendation: 'Add WhatsApp capture forms on high-traffic service pages' },
  { label: 'Website', score: 78, max: 100, recommendation: 'Mobile UX score is strong — optimize checkout funnel CTAs' },
  { label: 'Social Presence', score: 81, max: 100, recommendation: 'Increase LinkedIn posting cadence to 4× per week' },
  { label: 'AI Readiness', score: 48, max: 100, recommendation: 'Integrate CRM chatbot and lead scoring automation' },
  { label: 'Revenue Potential', score: 88, max: 100, recommendation: 'Upsell enterprise tier to top 10 accounts in pipeline' },
];
