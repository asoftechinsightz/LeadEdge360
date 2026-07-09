import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/network/dio_client.dart';
import '../domain/crm_models.dart';

class CrmRepository {
  CrmRepository(this._dio);

  final Dio _dio;

  Future<List<CrmCustomer>> fetchCustomers({String q = '', int page = 1}) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>(
        '/customers',
        queryParameters: {'page': page, 'limit': 50, if (q.isNotEmpty) 'q': q},
      );
      final items = res.data?['items'] as List? ?? [];
      return items.map((e) => CrmCustomer.fromJson(Map<String, dynamic>.from(e as Map))).toList();
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<CrmCustomer> fetchCustomer(String id) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/customers/$id');
      final data = res.data?['customer'] as Map? ?? res.data;
      return CrmCustomer.fromJson(Map<String, dynamic>.from(data as Map));
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> fetchCustomerDashboard() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/customers', queryParameters: {'dashboard': '1'});
      return Map<String, dynamic>.from(res.data ?? {});
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<List<CrmOpportunity>> fetchOpportunities() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/opportunities');
      final items = res.data?['items'] as List? ?? [];
      return items.map((e) => CrmOpportunity.fromJson(Map<String, dynamic>.from(e as Map))).toList();
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> fetchOpportunity(String id) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/opportunities/$id');
      return Map<String, dynamic>.from(res.data ?? {});
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> patchOpportunity(String id, Map<String, dynamic> data) async {
    try {
      final res = await _dio.patch<Map<String, dynamic>>('/opportunities/$id', data: data);
      return Map<String, dynamic>.from(res.data ?? {});
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> fetchOpportunityDashboard() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/opportunities/dashboard');
      return Map<String, dynamic>.from(res.data ?? {});
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<List<CrmCampaign>> fetchCampaigns() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/campaigns');
      final items = res.data?['items'] as List? ?? res.data?['campaigns'] as List? ?? [];
      return items.map((e) => CrmCampaign.fromJson(Map<String, dynamic>.from(e as Map))).toList();
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<CrmCampaign> fetchCampaign(String id) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/campaigns/$id');
      final data = res.data?['campaign'] as Map? ?? res.data;
      return CrmCampaign.fromJson(Map<String, dynamic>.from(data as Map));
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<CrmCampaign> createCampaign({
    required String name,
    String channel = 'email',
    String? scheduledAt,
  }) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>('/campaigns', data: {
        'name': name,
        'channel': channel,
        if (scheduledAt != null) 'scheduledAt': scheduledAt,
        'audience': {'leadIds': [], 'label': null, 'status': null},
      });
      final data = res.data?['campaign'] as Map? ?? res.data;
      return CrmCampaign.fromJson(Map<String, dynamic>.from(data as Map));
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<CrmCampaign> patchCampaign(String id, Map<String, dynamic> data) async {
    try {
      final res = await _dio.patch<Map<String, dynamic>>('/campaigns/$id', data: data);
      final campaign = res.data?['campaign'] as Map? ?? res.data;
      return CrmCampaign.fromJson(Map<String, dynamic>.from(campaign as Map));
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> executeCampaign(String id) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>('/campaigns/$id/execute');
      return Map<String, dynamic>.from(res.data ?? {});
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<List<CrmProposal>> fetchProposals() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/proposals');
      final items = res.data?['proposals'] as List? ?? [];
      return items.map((e) => CrmProposal.fromJson(Map<String, dynamic>.from(e as Map))).toList();
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> fetchProposal(String id) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/proposals/$id');
      return Map<String, dynamic>.from(res.data ?? {});
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<List<CrmInvoice>> fetchInvoices() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/invoices');
      final items = res.data?['invoices'] as List? ?? [];
      return items.map((e) => CrmInvoice.fromJson(Map<String, dynamic>.from(e as Map))).toList();
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<List<CrmTerritory>> fetchTerritories({bool withStats = true}) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>(
        '/territories',
        queryParameters: withStats ? {'stats': '1'} : null,
      );
      final items = res.data?['items'] as List? ?? res.data?['territories'] as List? ?? [];
      return items.map((e) => CrmTerritory.fromJson(Map<String, dynamic>.from(e as Map))).toList();
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<CrmTerritory> createTerritory({
    required String name,
    String? region,
    String? manager,
  }) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>('/territories', data: {
        'name': name,
        if (region != null && region.isNotEmpty) 'region': region,
        if (manager != null && manager.isNotEmpty) 'manager': manager,
      });
      final data = res.data?['data'] as Map? ?? res.data;
      return CrmTerritory.fromJson(Map<String, dynamic>.from(data as Map));
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<CrmTerritory> patchTerritory(String id, Map<String, dynamic> data) async {
    try {
      final res = await _dio.patch<Map<String, dynamic>>('/territories/$id', data: data);
      final territory = res.data?['data'] as Map? ?? res.data;
      return CrmTerritory.fromJson(Map<String, dynamic>.from(territory as Map));
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<List<CrmWhatsAppThread>> fetchWhatsAppThreads() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/whatsapp/threads');
      final items = res.data?['items'] as List? ?? res.data?['threads'] as List? ?? [];
      return items.map((e) => CrmWhatsAppThread.fromJson(Map<String, dynamic>.from(e as Map))).toList();
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<List<CrmActivity>> fetchActivities() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/activities');
      final items = res.data?['items'] as List? ?? res.data?['activities'] as List? ?? [];
      return items.map((e) => CrmActivity.fromJson(Map<String, dynamic>.from(e as Map))).toList();
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<List<CrmActivity>> fetchRecentActivities() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/recent-activities');
      final items = res.data?['items'] as List? ?? res.data?['activities'] as List? ?? [];
      return items.map((e) => CrmActivity.fromJson(Map<String, dynamic>.from(e as Map))).toList();
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> fetchRevenueDashboard() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/revenue/dashboard');
      return Map<String, dynamic>.from(res.data ?? {});
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> fetchAnalyticsSummary() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/analytics/summary');
      return Map<String, dynamic>.from(res.data ?? {});
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> fetchAnalyticsFunnel() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/analytics/funnel');
      return Map<String, dynamic>.from(res.data ?? {});
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> fetchCampaignAnalytics() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/campaigns/analytics');
      return Map<String, dynamic>.from(res.data ?? {});
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> fetchMarketingCalendar() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/marketing-engine/calendar');
      return Map<String, dynamic>.from(res.data ?? {});
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> fetchLeadScoringDashboard() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/lead-scoring/dashboard');
      return Map<String, dynamic>.from(res.data ?? {});
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<List<Map<String, dynamic>>> fetchLeadScoringPriority() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/lead-scoring/priority');
      final items = res.data?['items'] as List? ?? [];
      return items.map((e) => Map<String, dynamic>.from(e as Map)).toList();
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> fetchRevenueByCustomer() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/revenue/by-customer');
      return Map<String, dynamic>.from(res.data ?? {});
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> fetchRevenueBySource() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/revenue/by-source');
      return Map<String, dynamic>.from(res.data ?? {});
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> fetchRevenueByTerritory() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>(
        '/revenue/by-source',
        queryParameters: {'dimension': 'territory'},
      );
      return Map<String, dynamic>.from(res.data ?? {});
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> fetchRevenueTrends({int months = 6}) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>(
        '/revenue/trends',
        queryParameters: {'months': months},
      );
      return Map<String, dynamic>.from(res.data ?? {});
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<List<Map<String, dynamic>>> fetchEmailTemplates() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/templates/email', queryParameters: {'limit': 50});
      final items = res.data?['items'] as List? ?? [];
      return items.map((e) => Map<String, dynamic>.from(e as Map)).toList();
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<CrmCampaign> attachCampaignTemplate(String id, String templateId) async {
    try {
      final res = await _dio.put<Map<String, dynamic>>('/campaigns/$id/template', data: {'templateId': templateId});
      final campaign = res.data?['campaign'] as Map? ?? res.data;
      return CrmCampaign.fromJson(Map<String, dynamic>.from(campaign as Map));
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> fetchCampaignDetailAnalytics(String id) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/campaigns/$id/analytics');
      return Map<String, dynamic>.from(res.data ?? {});
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<CrmCustomer> createCustomer({
    required String name,
    String? company,
    String? email,
    String? phone,
  }) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>('/customers', data: {
        'name': name,
        if (company != null && company.isNotEmpty) 'company': company,
        if (email != null && email.isNotEmpty) 'email': email,
        if (phone != null && phone.isNotEmpty) 'phone': phone,
      });
      final data = res.data?['customer'] as Map? ?? res.data;
      return CrmCustomer.fromJson(Map<String, dynamic>.from(data as Map));
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<CrmCustomer> patchCustomer(String id, Map<String, dynamic> data) async {
    try {
      final res = await _dio.patch<Map<String, dynamic>>('/customers/$id', data: data);
      final customer = res.data?['customer'] as Map? ?? res.data;
      return CrmCustomer.fromJson(Map<String, dynamic>.from(customer as Map));
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<void> addCustomerNote(String id, String body) async {
    try {
      await _dio.post('/customers/$id/notes', data: {'body': body});
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> globalSearch(String q) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/global-search', queryParameters: {'q': q});
      return Map<String, dynamic>.from(res.data ?? {});
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> createProposal({
    required String clientName,
    String? company,
    required double subtotal,
    double gstPercent = 18,
  }) async {
    final gstAmount = subtotal * gstPercent / 100;
    final total = subtotal + gstAmount;
    try {
      final res = await _dio.post<Map<String, dynamic>>('/proposals', data: {
        'clientName': clientName,
        'company': company ?? '',
        'subtotal': subtotal,
        'gstPercent': gstPercent,
        'gstAmount': gstAmount,
        'totalAmount': total,
        'status': 'DRAFT',
        'items': [
          {'name': 'Professional services', 'qty': 1, 'rate': subtotal, 'amount': subtotal},
        ],
      });
      return Map<String, dynamic>.from(res.data ?? {});
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> createInvoice({
    required String clientName,
    String? company,
    required double subtotal,
    double gstPercent = 18,
    List<CrmInvoiceLineItem>? items,
  }) async {
    final lineItems = items ??
        [
          CrmInvoiceLineItem(name: 'Professional services', qty: 1, rate: subtotal, amount: subtotal),
        ];
    final computedSubtotal = lineItems.fold<double>(0, (sum, i) => sum + i.amount);
    final gstAmount = computedSubtotal * gstPercent / 100;
    final total = computedSubtotal + gstAmount;
    try {
      final res = await _dio.post<Map<String, dynamic>>('/invoices', data: {
        'clientName': clientName,
        'company': company ?? '',
        'subtotal': computedSubtotal,
        'gstPercent': gstPercent,
        'gstAmount': gstAmount,
        'totalAmount': total,
        'status': 'DRAFT',
        'items': lineItems
            .map((i) => {
                  'name': i.name,
                  'qty': i.qty,
                  'rate': i.rate,
                  'amount': i.amount,
                })
            .toList(),
      });
      return Map<String, dynamic>.from(res.data ?? {});
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<List<WhatsAppMessage>> fetchWhatsAppMessages(String threadId) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/whatsapp/threads/$threadId/messages');
      final items = res.data?['messages'] as List? ?? [];
      return items.map((e) => WhatsAppMessage.fromJson(Map<String, dynamic>.from(e as Map))).toList();
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<void> sendWhatsAppMessage(String threadId, String text) async {
    try {
      await _dio.post('/whatsapp/threads/$threadId/messages', data: {'text': text});
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<List<Map<String, dynamic>>> fetchWhatsAppTemplates() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/whatsapp/templates');
      final items = res.data?['items'] as List? ?? [];
      return items.map((e) => Map<String, dynamic>.from(e as Map)).toList();
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<void> sendWhatsAppTemplate(String threadId, {required String templateName, required List<String> params}) async {
    try {
      await _dio.post('/whatsapp/threads/$threadId/messages', data: {
        'templateName': templateName,
        'params': params,
      });
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> patchProposal(String id, Map<String, dynamic> data) async {
    try {
      final res = await _dio.patch<Map<String, dynamic>>('/proposals/$id', data: data);
      return Map<String, dynamic>.from(res.data ?? {});
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> markProposalWon(String id) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>('/proposals/$id/won');
      return Map<String, dynamic>.from(res.data ?? {});
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> convertProposalToInvoice(String id) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>('/proposals/$id/convert-to-invoice');
      return Map<String, dynamic>.from(res.data ?? {});
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<CrmInvoice?> fetchInvoice(String id) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>(
        '/invoices/$id',
        queryParameters: {'format': 'json'},
      );
      final inv = res.data?['invoice'] as Map? ?? res.data;
      if (inv is Map) {
        return CrmInvoice.fromJson(Map<String, dynamic>.from(inv));
      }
      return null;
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<CrmInvoice?> fetchInvoiceFromList(String id) async {
    try {
      return await fetchInvoice(id);
    } catch (_) {
      final invoices = await fetchInvoices();
      for (final inv in invoices) {
        if (inv.id == id) return inv;
      }
      return null;
    }
  }

  Future<Map<String, dynamic>> patchInvoice(String id, Map<String, dynamic> data) async {
    try {
      final res = await _dio.patch<Map<String, dynamic>>('/invoices/$id', data: data);
      return Map<String, dynamic>.from(res.data ?? {});
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> invoiceAction(String id, String action, {double? amount}) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>('/invoices/$id', data: {
        'action': action,
        if (amount != null) 'amount': amount,
      });
      return Map<String, dynamic>.from(res.data ?? {});
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<List<int>> downloadBytes(String path) async {
    try {
      final res = await _dio.get<List<int>>(
        path,
        options: Options(responseType: ResponseType.bytes),
      );
      return res.data ?? [];
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<List<CrmReportExport>> fetchReportExports() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/mobile/reports');
      final items = res.data?['exports'] as List? ?? [];
      return items.map((e) => CrmReportExport.fromJson(Map<String, dynamic>.from(e as Map))).toList();
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<String> createReportExport({
    String type = 'leads',
    String exportType = 'csv',
  }) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>('/reports/export', data: {
        'type': type,
        'exportType': exportType,
      });
      return res.data?['exportId']?.toString() ?? '';
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<List<int>> downloadReportExport(String exportId) async {
    return downloadBytes('/mobile/reports/$exportId/download');
  }

  Future<Map<String, dynamic>> createCalendarEntry({
    required String title,
    required String platform,
    required String scheduledAt,
  }) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>('/marketing-engine/calendar', data: {
        'title': title,
        'platform': platform,
        'scheduledAt': scheduledAt,
      });
      return Map<String, dynamic>.from(res.data ?? {});
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> updateCalendarEntry({
    required String id,
    String? scheduledAt,
    String? status,
    String? title,
  }) async {
    try {
      final res = await _dio.patch<Map<String, dynamic>>('/marketing-engine/calendar', data: {
        'id': id,
        if (scheduledAt != null) 'scheduledAt': scheduledAt,
        if (status != null) 'status': status,
        if (title != null) 'title': title,
      });
      return Map<String, dynamic>.from(res.data ?? {});
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }
}

final crmRepositoryProvider = Provider<CrmRepository>((ref) {
  return CrmRepository(ref.watch(dioProvider));
});
