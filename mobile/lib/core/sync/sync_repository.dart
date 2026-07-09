import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/leadedge360/domain/models/lead_models.dart';
import '../network/api_exception.dart';
import '../network/dio_client.dart';

class SyncPullResult {
  const SyncPullResult({
    required this.leads,
    required this.changes,
    required this.syncedAt,
  });

  final List<Lead> leads;
  final List<TimelineEntry> changes;
  final DateTime syncedAt;
}

class SyncRepository {
  SyncRepository(this._dio);

  final Dio _dio;

  Future<SyncPullResult> pull({DateTime? since}) async {
    try {
      final sinceParam = since?.toUtc().toIso8601String();
      final leadsRes = await _dio.get<Map<String, dynamic>>(
        '/mobile/sync',
        queryParameters: sinceParam != null ? {'since': sinceParam} : null,
      );
      final changesRes = await _dio.get<Map<String, dynamic>>(
        '/mobile/sync/changes',
        queryParameters: sinceParam != null ? {'since': sinceParam} : null,
      );

      final leadRaw = leadsRes.data?['leads'] as List? ?? [];
      final changeRaw = changesRes.data?['changes'] as List? ?? [];

      return SyncPullResult(
        leads: leadRaw
            .map((e) => Lead.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList(),
        changes: changeRaw
            .map((e) => TimelineEntry.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList(),
        syncedAt: DateTime.now().toUtc(),
      );
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }
}

final syncRepositoryProvider = Provider<SyncRepository>(
  (ref) => SyncRepository(ref.watch(dioProvider)),
);
