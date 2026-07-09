import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config/app_config.dart';
import '../network/api_exception.dart';
import '../network/dio_client.dart';
import 'notification_models.dart';

class NotificationsRepository {
  NotificationsRepository(this._dio);

  final Dio _dio;

  Future<NotificationsPage> fetchNotifications({bool unreadOnly = false}) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>(
        '/notifications',
        queryParameters: unreadOnly ? {'unreadOnly': 'true'} : null,
      );
      final data = res.data ?? {};
      final raw = data['notifications'] as List? ?? [];
      return NotificationsPage(
        items: raw
            .map((e) => AppNotification.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList(),
        unread: (data['unread'] as num?)?.toInt() ?? 0,
      );
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<void> markRead(String id) async {
    try {
      await _dio.post('/notifications/$id/read');
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<void> registerDevice({
    required String token,
    String platform = 'android',
    String? deviceName,
  }) async {
    try {
      await _dio.post('/notifications/devices', data: {
        'platform': platform,
        'token': token,
        if (deviceName != null) 'deviceName': deviceName,
      });
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }
}

final notificationsRepositoryProvider = Provider<NotificationsRepository>(
  (ref) => NotificationsRepository(ref.watch(dioProvider)),
);
