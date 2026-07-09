import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/sync/cache_providers.dart';
import '../../../core/sync/connectivity_service.dart';
import '../../../core/sync/leads_cache.dart';
import '../../../core/sync/offline_action.dart';
import '../../../core/sync/offline_queue.dart';
import '../domain/models/lead_models.dart';

class LeadsQuery {
  const LeadsQuery({
    this.page = 1,
    this.limit = 20,
    this.status = 'all',
    this.label = 'all',
    this.search = '',
  });

  final int page;
  final int limit;
  final String status;
  final String label;
  final String search;

  LeadsQuery copyWith({
    int? page,
    String? status,
    String? label,
    String? search,
  }) =>
      LeadsQuery(
        page: page ?? this.page,
        limit: limit,
        status: status ?? this.status,
        label: label ?? this.label,
        search: search ?? this.search,
      );

  Map<String, dynamic> toParams() {
    final p = <String, dynamic>{'page': page, 'limit': limit};
    if (status != 'all') p['status'] = status;
    if (label != 'all') p['label'] = label;
    if (search.trim().isNotEmpty) p['q'] = search.trim();
    return p;
  }
}

class MutationResult {
  const MutationResult({this.queued = false, this.message});

  final bool queued;
  final String? message;
}

class LeadsRepository {
  LeadsRepository(
    this._dio, {
    LeadsCache? cache,
    OfflineQueue? queue,
    ConnectivityService? connectivity,
  })  : _cache = cache ?? LeadsCache(),
        _queue = queue ?? OfflineQueue(),
        _connectivity = connectivity ?? ConnectivityService();

  final Dio _dio;
  final LeadsCache _cache;
  final OfflineQueue _queue;
  final ConnectivityService _connectivity;

  Future<LeadsPage> fetchLeads(LeadsQuery query) async {
    if (await _connectivity.isOnline) {
      try {
        final page = await _fetchLeadsNetwork(query);
        await _cache.mergeLeads(page.items);
        return page;
      } catch (e) {
        if (!_isNetworkError(e)) rethrow;
      }
    }
    return _cache.pageFromCache(query);
  }

  Future<LeadsPage> _fetchLeadsNetwork(LeadsQuery query) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>(
        '/sales/leads',
        queryParameters: query.toParams(),
      );
      final data = res.data ?? {};
      final raw = data['items'] as List? ?? [];
      return LeadsPage(
        items: raw.map((e) => Lead.fromJson(Map<String, dynamic>.from(e as Map))).toList(),
        page: (data['page'] as num?)?.toInt() ?? query.page,
        total: (data['total'] as num?)?.toInt() ?? 0,
        pages: (data['pages'] as num?)?.toInt() ?? 1,
        hasMore: query.page < ((data['pages'] as num?)?.toInt() ?? 1),
      );
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<LeadDetailBundle> fetchLeadDetail(String leadId) async {
    if (await _connectivity.isOnline) {
      try {
        final bundle = await _fetchLeadDetailNetwork(leadId);
        await _cache.cacheDetail(bundle);
        return bundle;
      } catch (e) {
        if (!_isNetworkError(e)) rethrow;
      }
    }
    final cached = _cache.getDetail(leadId);
    if (cached != null) return cached;
    final lead = _cache.getLead(leadId);
    if (lead != null) {
      return LeadDetailBundle(lead: lead);
    }
    throw const ApiException(message: 'Lead not available offline');
  }

  Future<LeadDetailBundle> _fetchLeadDetailNetwork(String leadId) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/mobile/leads/$leadId');
      return LeadDetailBundle.fromJson(res.data ?? {});
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<MutationResult> updateLeadStatus(String leadId, String status) async {
    if (await _tryOnline(() => updateLeadStatusDirect(leadId, status))) {
      await _cache.patchLeadStatus(leadId, status);
      return const MutationResult();
    }
    await _queue.enqueue(
      type: OfflineActionType.updateStatus,
      leadId: leadId,
      payload: {'status': status},
    );
    await _cache.patchLeadStatus(leadId, status);
    return const MutationResult(queued: true, message: 'Status saved offline');
  }

  Future<void> updateLeadStatusDirect(String leadId, String status) async {
    try {
      await _dio.patch('/mobile/leads/$leadId/status', data: {'status': status});
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<MutationResult> updateLeadTerritory(String leadId, String territory) async {
    if (await _tryOnline(() => updateLeadTerritoryDirect(leadId, territory))) {
      return const MutationResult();
    }
    await _queue.enqueue(
      type: OfflineActionType.updateStatus,
      leadId: leadId,
      payload: {'territory': territory},
    );
    return const MutationResult(queued: true, message: 'Territory saved offline');
  }

  Future<void> updateLeadTerritoryDirect(String leadId, String territory) async {
    try {
      await _dio.patch('/leads/$leadId', data: {'territory': territory});
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<MutationResult> addNote(String leadId, String note) async {
    if (await _tryOnline(() => addNoteDirect(leadId, note))) {
      return const MutationResult();
    }
    await _queue.enqueue(
      type: OfflineActionType.addNote,
      leadId: leadId,
      payload: {'note': note},
    );
    return const MutationResult(queued: true, message: 'Note queued for sync');
  }

  Future<LeadNote> addNoteDirect(String leadId, String note) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>(
        '/mobile/leads/$leadId/note',
        data: {'note': note},
      );
      return LeadNote.fromJson(Map<String, dynamic>.from(res.data?['note'] as Map? ?? {}));
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<MutationResult> addFollowUp(
    String leadId, {
    required String title,
    required DateTime dueAt,
  }) async {
    if (await _tryOnline(() => addFollowUpDirect(leadId, title: title, dueAt: dueAt))) {
      return const MutationResult();
    }
    await _queue.enqueue(
      type: OfflineActionType.addFollowUp,
      leadId: leadId,
      payload: {
        'title': title,
        'dueAt': dueAt.toUtc().toIso8601String(),
      },
    );
    return const MutationResult(queued: true, message: 'Follow-up queued for sync');
  }

  Future<LeadFollowUp> addFollowUpDirect(
    String leadId, {
    required String title,
    required DateTime dueAt,
  }) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>(
        '/mobile/leads/$leadId/followup',
        data: {'title': title, 'dueAt': dueAt.toUtc().toIso8601String()},
      );
      return LeadFollowUp.fromJson(Map<String, dynamic>.from(res.data?['followup'] as Map? ?? {}));
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<MutationResult> addTask(
    String leadId, {
    required String title,
    String? description,
  }) async {
    if (await _tryOnline(() => addTaskDirect(leadId, title: title, description: description))) {
      return const MutationResult();
    }
    await _queue.enqueue(
      type: OfflineActionType.addTask,
      leadId: leadId,
      payload: {
        'title': title,
        if (description != null) 'description': description,
      },
    );
    return const MutationResult(queued: true, message: 'Task queued for sync');
  }

  Future<LeadTask> addTaskDirect(
    String leadId, {
    required String title,
    String? description,
  }) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>(
        '/mobile/leads/$leadId/task',
        data: {'title': title, if (description != null) 'description': description},
      );
      return LeadTask.fromJson(Map<String, dynamic>.from(res.data?['task'] as Map? ?? {}));
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<MutationResult> createLead({
    required String name,
    required String phone,
    String? email,
    String? company,
    String? source,
    String? territory,
  }) async {
    if (await _connectivity.isOnline) {
      try {
        final lead = await createLeadDirect(
          name: name,
          phone: phone,
          email: email,
          company: company,
          source: source,
          territory: territory,
        );
        await _cache.putLead(lead);
        return const MutationResult();
      } catch (e) {
        if (!_isNetworkError(e)) rethrow;
      }
    }

    final tempId = 'local_${DateTime.now().millisecondsSinceEpoch}';
    final lead = Lead(
      id: tempId,
      name: name,
      phone: phone,
      email: email ?? '',
      company: company ?? '',
      source: source ?? 'manual',
      territory: territory ?? '',
      status: 'New',
      createdAt: DateTime.now().toUtc(),
      updatedAt: DateTime.now().toUtc(),
    );
    await _cache.putLead(lead);
    await _queue.enqueue(
      type: OfflineActionType.createLead,
      payload: {
        'tempId': tempId,
        'name': name,
        'phone': phone,
        if (email != null) 'email': email,
        if (company != null) 'company': company,
        'source': source ?? 'manual',
        if (territory != null) 'territory': territory,
      },
    );
    return const MutationResult(queued: true, message: 'Lead saved offline');
  }

  Future<Lead> createLeadDirect({
    required String name,
    required String phone,
    String? email,
    String? company,
    String? source,
    String? territory,
  }) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>('/leads', data: {
        'name': name,
        'phone': phone,
        if (email != null && email.isNotEmpty) 'email': email,
        if (company != null && company.isNotEmpty) 'company': company,
        'source': source ?? 'manual',
        if (territory != null && territory.isNotEmpty) 'territory': territory,
      });
      final lead = Lead.fromJson(Map<String, dynamic>.from(res.data?['lead'] as Map? ?? {}));
      await _cache.putLead(lead);
      return lead;
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<List<PipelineItem>> fetchPipeline() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/opportunities/pipeline');
      final raw = res.data?['items'] as List? ?? [];
      return raw.map((e) => PipelineItem.fromJson(Map<String, dynamic>.from(e as Map))).toList();
    } on DioException catch (e) {
      if (_isNetworkError(e)) {
        return _cache
            .getAllLeads()
            .where((l) => LeadFilters.pipelineStatuses.contains(l.status))
            .map(
              (l) => PipelineItem(
                id: l.id,
                name: l.name,
                company: l.company,
                phone: l.phone,
                status: l.status,
                label: l.label,
              ),
            )
            .toList();
      }
      parseApiError(e);
      rethrow;
    }
  }

  Future<MutationResult> movePipelineStage(String leadId, String status, {String? reason}) async {
    if (await _tryOnline(() => movePipelineStageDirect(leadId, status, reason: reason))) {
      await _cache.patchLeadStatus(leadId, status);
      return const MutationResult();
    }
    await _queue.enqueue(
      type: OfflineActionType.movePipeline,
      leadId: leadId,
      payload: {
        'leadId': leadId,
        'status': status,
        if (reason != null) 'reason': reason,
      },
    );
    await _cache.patchLeadStatus(leadId, status);
    return const MutationResult(queued: true, message: 'Pipeline move queued');
  }

  Future<void> uploadLeadAttachment(String leadId, String filePath, String fileName) async {
    try {
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(filePath, filename: fileName),
      });
      await _dio.post('/leads/$leadId/attachments', data: formData);
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<List<int>> downloadLeadAttachment(String leadId, String attachmentId) async {
    try {
      final res = await _dio.get<List<int>>(
        '/leads/$leadId/attachments/$attachmentId',
        options: Options(responseType: ResponseType.bytes),
      );
      return res.data ?? [];
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<void> deleteLeadAttachment(String leadId, String attachmentId) async {
    try {
      await _dio.delete('/leads/$leadId/attachments/$attachmentId');
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<void> movePipelineStageDirect(String leadId, String status, {String? reason}) async {
    try {
      await _dio.post('/opportunities/move', data: {
        'leadId': leadId,
        'status': status,
        if (reason != null) 'reason': reason,
      });
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<bool> _tryOnline(Future<void> Function() action) async {
    if (!await _connectivity.isOnline) return false;
    try {
      await action();
      return true;
    } catch (e) {
      if (_isNetworkError(e)) return false;
      rethrow;
    }
  }

  bool _isNetworkError(Object e) {
    if (e is DioException) {
      return e.type == DioExceptionType.connectionError ||
          e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout ||
          e.type == DioExceptionType.sendTimeout;
    }
    return false;
  }
}

final leadsRepositoryProvider = Provider<LeadsRepository>(
  (ref) => LeadsRepository(
    ref.watch(dioProvider),
    cache: ref.watch(leadsCacheProvider),
    queue: ref.watch(offlineQueueProvider),
    connectivity: ref.watch(connectivityServiceProvider),
  ),
);
