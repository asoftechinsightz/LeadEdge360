import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/crm_repository.dart';
import '../../domain/crm_models.dart';

final customersProvider = FutureProvider.autoDispose.family<List<CrmCustomer>, String>(
  (ref, query) => ref.watch(crmRepositoryProvider).fetchCustomers(q: query),
);

final customerDetailProvider = FutureProvider.autoDispose.family<CrmCustomer, String>(
  (ref, id) => ref.watch(crmRepositoryProvider).fetchCustomer(id),
);

final opportunitiesProvider = FutureProvider.autoDispose<List<CrmOpportunity>>(
  (ref) => ref.watch(crmRepositoryProvider).fetchOpportunities(),
);

final opportunityDetailProvider = FutureProvider.autoDispose.family<Map<String, dynamic>, String>(
  (ref, id) => ref.watch(crmRepositoryProvider).fetchOpportunity(id),
);

final opportunityDashboardProvider = FutureProvider.autoDispose<Map<String, dynamic>>(
  (ref) => ref.watch(crmRepositoryProvider).fetchOpportunityDashboard(),
);

final campaignsProvider = FutureProvider.autoDispose<List<CrmCampaign>>(
  (ref) => ref.watch(crmRepositoryProvider).fetchCampaigns(),
);

final campaignDetailProvider = FutureProvider.autoDispose.family<CrmCampaign, String>(
  (ref, id) => ref.watch(crmRepositoryProvider).fetchCampaign(id),
);

final proposalsProvider = FutureProvider.autoDispose<List<CrmProposal>>(
  (ref) => ref.watch(crmRepositoryProvider).fetchProposals(),
);

final proposalDetailProvider = FutureProvider.autoDispose.family<Map<String, dynamic>, String>(
  (ref, id) => ref.watch(crmRepositoryProvider).fetchProposal(id),
);

final invoicesProvider = FutureProvider.autoDispose<List<CrmInvoice>>(
  (ref) => ref.watch(crmRepositoryProvider).fetchInvoices(),
);

final territoriesProvider = FutureProvider.autoDispose<List<CrmTerritory>>(
  (ref) => ref.watch(crmRepositoryProvider).fetchTerritories(),
);

final whatsappThreadsProvider = FutureProvider.autoDispose<List<CrmWhatsAppThread>>(
  (ref) => ref.watch(crmRepositoryProvider).fetchWhatsAppThreads(),
);

final activitiesProvider = FutureProvider.autoDispose<List<CrmActivity>>(
  (ref) => ref.watch(crmRepositoryProvider).fetchRecentActivities(),
);

final revenueDashboardProvider = FutureProvider.autoDispose<Map<String, dynamic>>(
  (ref) => ref.watch(crmRepositoryProvider).fetchRevenueDashboard(),
);

final salesDashboardProvider = FutureProvider.autoDispose<Map<String, dynamic>>(
  (ref) => ref.watch(crmRepositoryProvider).fetchAnalyticsFunnel(),
);

final marketingDashboardProvider = FutureProvider.autoDispose<Map<String, dynamic>>(
  (ref) => ref.watch(crmRepositoryProvider).fetchCampaignAnalytics(),
);

final marketingCalendarProvider = FutureProvider.autoDispose<Map<String, dynamic>>(
  (ref) => ref.watch(crmRepositoryProvider).fetchMarketingCalendar(),
);

final aiInsightsProvider = FutureProvider.autoDispose<Map<String, dynamic>>(
  (ref) async {
    final repo = ref.watch(crmRepositoryProvider);
    final dashboard = await repo.fetchLeadScoringDashboard();
    final priority = await repo.fetchLeadScoringPriority();
    return {
      ...dashboard,
      'priority': priority,
      'hotLeads': priority,
    };
  },
);

final revenueByCustomerProvider = FutureProvider.autoDispose<Map<String, dynamic>>(
  (ref) => ref.watch(crmRepositoryProvider).fetchRevenueByCustomer(),
);

final revenueBySourceProvider = FutureProvider.autoDispose<Map<String, dynamic>>(
  (ref) => ref.watch(crmRepositoryProvider).fetchRevenueBySource(),
);

final revenueByTerritoryProvider = FutureProvider.autoDispose<Map<String, dynamic>>(
  (ref) => ref.watch(crmRepositoryProvider).fetchRevenueByTerritory(),
);

final revenueTrendsProvider = FutureProvider.autoDispose<Map<String, dynamic>>(
  (ref) => ref.watch(crmRepositoryProvider).fetchRevenueTrends(),
);

final campaignAnalyticsProvider = FutureProvider.autoDispose.family<Map<String, dynamic>, String>(
  (ref, id) => ref.watch(crmRepositoryProvider).fetchCampaignDetailAnalytics(id),
);

final emailTemplatesProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>(
  (ref) => ref.watch(crmRepositoryProvider).fetchEmailTemplates(),
);

final whatsappMessagesProvider = FutureProvider.autoDispose.family<List<WhatsAppMessage>, String>(
  (ref, threadId) => ref.watch(crmRepositoryProvider).fetchWhatsAppMessages(threadId),
);

final whatsappTemplatesProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>(
  (ref) => ref.watch(crmRepositoryProvider).fetchWhatsAppTemplates(),
);

final invoiceDetailProvider = FutureProvider.autoDispose.family<CrmInvoice?, String>(
  (ref, id) => ref.watch(crmRepositoryProvider).fetchInvoiceFromList(id),
);

final reportExportsProvider = FutureProvider.autoDispose<List<CrmReportExport>>(
  (ref) => ref.watch(crmRepositoryProvider).fetchReportExports(),
);
