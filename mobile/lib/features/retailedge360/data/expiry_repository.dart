import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/network/dio_client.dart';
import '../domain/models/expiry_models.dart';

class ExpiryRepository {
  ExpiryRepository(this._dio);

  final Dio _dio;

  Future<ExpiryDashboard> fetchDashboard() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/retail/expiry/dashboard');
      return ExpiryDashboard.fromJson(res.data ?? {});
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  /// Acknowledge / run the alert engine (recomputes batch statuses).
  Future<void> runAlerts() async {
    try {
      await _dio.post('/retail/expiry/alerts/run');
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }
}

final expiryRepositoryProvider = Provider<ExpiryRepository>(
  (ref) => ExpiryRepository(ref.watch(dioProvider)),
);
