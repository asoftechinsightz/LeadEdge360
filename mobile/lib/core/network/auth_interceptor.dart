import 'package:dio/dio.dart';

import '../config/app_config.dart';
import '../storage/secure_token_storage.dart';
import 'api_exception.dart';

typedef TokenRefreshCallback = Future<String?> Function();

/// Attaches Bearer token and handles 401 refresh rotation.
class AuthInterceptor extends Interceptor {
  AuthInterceptor({
    required SecureTokenStorage tokenStorage,
    required TokenRefreshCallback onRefresh,
    required void Function() onSessionExpired,
  })  : _tokenStorage = tokenStorage,
        _onRefresh = onRefresh,
        _onSessionExpired = onSessionExpired;

  final SecureTokenStorage _tokenStorage;
  final TokenRefreshCallback _onRefresh;
  final void Function() _onSessionExpired;

  Future<String?>? _refreshFuture;

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await _tokenStorage.getAccessToken();
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    final response = err.response;
    if (response?.statusCode != 401) {
      handler.next(err);
      return;
    }

    final opts = err.requestOptions;
    if (opts.extra['_retried'] == true) {
      await _tokenStorage.clearTokens();
      _onSessionExpired();
      handler.next(err);
      return;
    }

    try {
      _refreshFuture ??= _onRefresh();
      final newToken = await _refreshFuture;
      _refreshFuture = null;

      if (newToken == null || newToken.isEmpty) {
        await _tokenStorage.clearTokens();
        _onSessionExpired();
        handler.next(err);
        return;
      }

      opts.headers['Authorization'] = 'Bearer $newToken';
      opts.extra['_retried'] = true;

      final dio = Dio(BaseOptions(baseUrl: AppConfig.apiBaseUrl));
      final clone = await dio.fetch(opts);
      handler.resolve(clone);
    } catch (e) {
      _refreshFuture = null;
      await _tokenStorage.clearTokens();
      _onSessionExpired();
      handler.next(err);
    }
  }
}
