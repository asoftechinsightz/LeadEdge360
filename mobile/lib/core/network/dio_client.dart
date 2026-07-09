import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config/app_config.dart';
import '../storage/secure_token_storage.dart';
import 'api_exception.dart';
import 'auth_interceptor.dart';

final secureTokenStorageProvider = Provider<SecureTokenStorage>(
  (ref) => SecureTokenStorage(),
);

final dioProvider = Provider<Dio>((ref) {
  final storage = ref.watch(secureTokenStorageProvider);
  final dio = Dio(
    BaseOptions(
      baseUrl: AppConfig.apiBaseUrl,
      connectTimeout: const Duration(seconds: 20),
      receiveTimeout: const Duration(seconds: 30),
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
    ),
  );

  dio.interceptors.add(
    AuthInterceptor(
      tokenStorage: storage,
      onRefresh: () async {
        final refresh = await storage.getRefreshToken();
        if (refresh == null) return null;
        try {
          final refreshDio = Dio(BaseOptions(baseUrl: AppConfig.apiBaseUrl));
          final res = await refreshDio.post<Map<String, dynamic>>(
            '/auth/refresh-token',
            data: {'refreshToken': refresh},
          );
          final data = res.data;
          if (data == null) return null;
          final access = data['accessToken'] as String?;
          final newRefresh = data['refreshToken'] as String?;
          if (access == null || newRefresh == null) return null;
          await storage.saveTokens(access: access, refresh: newRefresh);
          return access;
        } catch (_) {
          return null;
        }
      },
      onSessionExpired: () {
        ref.read(sessionExpiredProvider.notifier).state = true;
      },
    ),
  );

  dio.interceptors.add(LogInterceptor(requestBody: false, responseBody: false));

  return dio;
});

final sessionExpiredProvider = StateProvider<bool>((ref) => false);

extension DioSafe on Dio {
  Future<T> getJson<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    T Function(Map<String, dynamic> json)? parser,
  }) async {
    try {
      final res = await get<dynamic>(path, queryParameters: queryParameters);
      final data = res.data;
      if (parser != null && data is Map<String, dynamic>) {
        return parser(data);
      }
      return data as T;
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<T> postJson<T>(
    String path, {
    Map<String, dynamic>? data,
    T Function(Map<String, dynamic> json)? parser,
  }) async {
    try {
      final res = await post<dynamic>(path, data: data);
      final body = res.data;
      if (parser != null && body is Map<String, dynamic>) {
        return parser(body);
      }
      return body as T;
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }
}
