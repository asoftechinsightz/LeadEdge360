import type {
  AIInsight,
  AutomationWorkflow,
  CommandCenterData,
  GeoLead,
  GrowthAudit,
  Lead,
  RevenueIntelligenceData,
  Territory,
} from '../types';

export const MOCK_LEADS: Lead[] = [
  { id: 'L-1001', name: 'Priya Sharma', company: 'NovaTech Pvt Ltd', email: 'priya@novatech.in', phone: '+91 98765 43210', territory: 'Bengaluru', source: 'Website', status: 'Qualified', score: 92, label: 'Hot', budget: 450000, lat: 12.9716, lng: 77.5946, assignedTo: 'Arjun Mehta', createdAt: '2026-06-20T09:00:00Z' },
  { id: 'L-1002', name: 'Rahul Verma', company: 'GreenLeaf Retail', email: 'rahul@greenleaf.in', phone: '+91 99887 76655', territory: 'Mumbai', source: 'WhatsApp', status: 'Contacted', score: 78, label: 'Warm', budget: 220000, lat: 19.076, lng: 72.8777, assignedTo: 'Sneha Rao', createdAt: '2026-06-19T14:30:00Z' },
  { id: 'L-1003', name: 'Anita Desai', company: 'Skyline Properties', email: 'anita@skyline.com', phone: '+91 91234 56789', territory: 'Pune', source: 'Referral', status: 'Proposal', score: 85, label: 'Hot', budget: 890000, lat: 18.5204, lng: 73.8567, assignedTo: 'Arjun Mehta', createdAt: '2026-06-18T11:15:00Z' },
  { id: 'L-1004', name: 'Vikram Singh', company: 'AutoParts Hub', email: 'vikram@autoparts.in', phone: '+91 90123 45678', territory: 'Delhi NCR', source: 'Campaign', status: 'New', score: 64, label: 'Warm', budget: 150000, lat: 28.6139, lng: 77.209, assignedTo: 'Unassigned', createdAt: '2026-06-22T08:00:00Z' },
  { id: 'L-1005', name: 'Meera Iyer', company: 'CloudSync Solutions', email: 'meera@cloudsync.io', phone: '+91 97654 32109', territory: 'Hyderabad', source: 'LinkedIn', status: 'Won', score: 96, label: 'Hot', budget: 1200000, lat: 17.385, lng: 78.4867, assignedTo: 'Sneha Rao', createdAt: '2026-06-10T16:45:00Z' },
];

export const MOCK_TERRITORIES: Territory[] = [
  { id: 'T-01', name: 'Bengaluru', region: 'South', manager: 'Arjun Mehta', leadCount: 142, wonRevenue: 4200000, conversion: 28.5, agents: 4, status: 'active' },
  { id: 'T-02', name: 'Mumbai', region: 'West', manager: 'Sneha Rao', leadCount: 118, wonRevenue: 3800000, conversion: 24.2, agents: 3, status: 'active' },
  { id: 'T-03', name: 'Delhi NCR', region: 'North', manager: 'Karan Patel', leadCount: 95, wonRevenue: 2900000, conversion: 21.8, agents: 3, status: 'active' },
  { id: 'T-04', name: 'Pune', region: 'West', manager: 'Arjun Mehta', leadCount: 67, wonRevenue: 1850000, conversion: 19.4, agents: 2, status: 'review' },
  { id: 'T-05', name: 'Hyderabad', region: 'South', manager: 'Sneha Rao', leadCount: 54, wonRevenue: 2100000, conversion: 26.1, agents: 2, status: 'active' },
];

export const MOCK_GEO_LEADS: GeoLead[] = [
  { id: 'G-01', businessName: 'TechPark Cafe', category: 'F&B', address: 'Whitefield Main Rd', city: 'Bengaluru', phone: '+91 80 4123 4567', website: 'techparkcafe.in', score: 88, rating: 4.6, distanceKm: 1.2, lat: 12.9698, lng: 77.75 },
  { id: 'G-02', businessName: 'Elite Fitness Studio', category: 'Wellness', address: 'Koramangala 5th Block', city: 'Bengaluru', phone: '+91 80 2555 8899', score: 76, rating: 4.2, distanceKm: 3.4, lat: 12.9352, lng: 77.6245 },
  { id: 'G-03', businessName: 'SmartHome Interiors', category: 'Interior Design', address: 'HSR Layout', city: 'Bengaluru', phone: '+91 80 4567 1234', website: 'smarthome.in', score: 91, rating: 4.8, distanceKm: 2.1, lat: 12.9116, lng: 77.6389 },
  { id: 'G-04', businessName: 'Digital Marketing Pro', category: 'Agency', address: 'Indiranagar', city: 'Bengaluru', phone: '+91 80 9876 5432', score: 82, rating: 4.4, distanceKm: 5.8, lat: 12.9784, lng: 77.6408 },
  { id: 'G-05', businessName: 'Green Valley School', category: 'Education', address: 'Marathahalli', city: 'Bengaluru', phone: '+91 80 3210 9876', score: 69, rating: 4.0, distanceKm: 7.2, lat: 12.9591, lng: 77.6974 },
  { id: 'G-06', businessName: 'Prime Realty Group', category: 'Real Estate', address: 'Gomti Nagar', city: 'Lucknow', phone: '+91 80 5555 1234', website: 'primerealty.in', score: 94, rating: 4.9, distanceKm: 0.8, lat: 26.85, lng: 80.95 },
  { id: 'G-07', businessName: 'Skyline Properties', category: 'Real Estate', address: 'Hazratganj', city: 'Lucknow', phone: '+91 80 4444 5678', website: 'skylineprops.com', score: 87, rating: 4.5, distanceKm: 2.3, lat: 26.8467, lng: 80.9462 },
];

export const MOCK_AUTOMATIONS: AutomationWorkflow[] = [
  { id: 'A-01', name: 'Hot Lead WhatsApp Alert', trigger: 'Score ≥ 85', channel: 'WhatsApp', status: 'active', runs: 234, conversions: 42, lastRunAt: '2026-06-22T10:30:00Z' },
  { id: 'A-02', name: 'Stale Lead Nurture', trigger: 'No activity 48h', channel: 'Email', status: 'active', runs: 156, conversions: 18, lastRunAt: '2026-06-22T09:15:00Z' },
  { id: 'A-03', name: 'Proposal Follow-up', trigger: 'Proposal sent', channel: 'Email + WhatsApp', status: 'active', runs: 89, conversions: 31, lastRunAt: '2026-06-21T17:00:00Z' },
  { id: 'A-04', name: 'Geo Lead Enrichment', trigger: 'New geo scan', channel: 'Internal', status: 'paused', runs: 45, conversions: 12, lastRunAt: '2026-06-20T14:20:00Z' },
  { id: 'A-05', name: 'Won Deal Celebration', trigger: 'Status = Won', channel: 'Slack', status: 'draft', runs: 0, conversions: 0, lastRunAt: '2026-06-18T11:00:00Z' },
];

export const MOCK_GROWTH_AUDITS: GrowthAudit[] = [
  { id: 'GA-01', company: 'NovaTech Pvt Ltd', website: 'novatech.in', score: 78, grade: 'B', issues: 6, scannedAt: '2026-06-21T12:00:00Z', status: 'completed' },
  { id: 'GA-02', company: 'GreenLeaf Retail', website: 'greenleaf.in', score: 62, grade: 'C', issues: 11, scannedAt: '2026-06-20T09:30:00Z', status: 'completed' },
  { id: 'GA-03', company: 'CloudSync Solutions', website: 'cloudsync.io', score: 91, grade: 'A', issues: 2, scannedAt: '2026-06-19T15:45:00Z', status: 'completed' },
  { id: 'GA-04', company: 'AutoParts Hub', website: 'autoparts.in', score: 0, grade: 'D', issues: 0, scannedAt: '2026-06-22T08:00:00Z', status: 'running' },
];

export const MOCK_AI_INSIGHTS: AIInsight[] = [
  { id: 'I-01', type: 'opportunity', title: '3 hot leads ready for proposal', summary: 'Priya Sharma, Anita Desai, and Meera Iyer have scores above 85 with budget confirmed.', impact: 'high', confidence: 92, createdAt: '2026-06-22T10:00:00Z' },
  { id: 'I-02', type: 'risk', title: 'Delhi NCR conversion dropping', summary: 'Conversion fell 4.2% week-over-week. 12 leads unassigned in territory.', impact: 'medium', confidence: 78, createdAt: '2026-06-22T09:30:00Z' },
  { id: 'I-03', type: 'action', title: 'Enable geo scan for Whitefield cluster', summary: '47 new businesses detected within 5km radius with high fit scores.', impact: 'high', confidence: 85, createdAt: '2026-06-22T08:45:00Z' },
  { id: 'I-04', type: 'forecast', title: '₹18.5L revenue forecast this month', summary: 'Based on pipeline velocity and historical win rates across active territories.', impact: 'medium', confidence: 81, createdAt: '2026-06-22T08:00:00Z' },
  { id: 'I-05', type: 'action', title: 'Resume Geo Lead Enrichment workflow', summary: 'Workflow paused 48h ago — 12 leads pending enrichment.', impact: 'low', confidence: 70, createdAt: '2026-06-21T16:00:00Z' },
];

export const MOCK_COMMAND_CENTER: CommandCenterData = {
  kpis: {
    totalLeads: 476,
    hotLeads: 89,
    pipelineValue: 12400000,
    conversionRate: 24.8,
    revenueWon: 14850000,
    automationsActive: 3,
  },
  activityFeed: [
    { id: 'AF-1', text: 'AI scored Vikram Singh — 64 (Warm)', time: '2 min ago' },
    { id: 'AF-2', text: 'Hot Lead Alert sent to Arjun Mehta', time: '15 min ago' },
    { id: 'AF-3', text: 'Growth audit completed for NovaTech', time: '1 hr ago' },
    { id: 'AF-4', text: 'Meera Iyer marked Won — ₹12L', time: '2 hr ago' },
    { id: 'AF-5', text: 'Geo scan found 5 businesses in Whitefield', time: '3 hr ago' },
  ],
  priorityActions: [
    { id: 'PA-1', label: 'Review 3 hot leads', href: '/leads' },
    { id: 'PA-2', label: 'Run geo scan', href: '/leadedge360/geo-finder' },
    { id: 'PA-3', label: 'Check automation hub', href: '/leadedge360/automation' },
  ],
};

export const MOCK_REVENUE_INTELLIGENCE: RevenueIntelligenceData = {
  totalRevenue: 14850000,
  forecastRevenue: 18500000,
  avgDealSize: 425000,
  winRate: 24.8,
  series: [
    { month: 'Jan', revenue: 980000, forecast: 1000000 },
    { month: 'Feb', revenue: 1120000, forecast: 1100000 },
    { month: 'Mar', revenue: 1350000, forecast: 1300000 },
    { month: 'Apr', revenue: 1280000, forecast: 1400000 },
    { month: 'May', revenue: 1520000, forecast: 1500000 },
    { month: 'Jun', revenue: 1680000, forecast: 1850000 },
  ],
  byTerritory: [
    { name: 'Bengaluru', revenue: 4200000 },
    { name: 'Mumbai', revenue: 3800000 },
    { name: 'Delhi NCR', revenue: 2900000 },
    { name: 'Hyderabad', revenue: 2100000 },
    { name: 'Pune', revenue: 1850000 },
  ],
  bySource: [
    { name: 'Website', revenue: 4200000 },
    { name: 'WhatsApp', revenue: 3100000 },
    { name: 'Referral', revenue: 2800000 },
    { name: 'Campaign', revenue: 2450000 },
    { name: 'LinkedIn', revenue: 2500000 },
  ],
};
