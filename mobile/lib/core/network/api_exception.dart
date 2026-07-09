import 'package:dio/dio.dart';

class ApiException implements Exception {
  const ApiException({
    required this.message,
    this.statusCode,
    this.code,
  });

  final String message;
  final int? statusCode;
  final String? code;

  bool get isUnauthorized => statusCode == 401;
  bool get isForbidden => statusCode == 403;
  bool get isNetworkError => statusCode == null;

  @override
  String toString() => 'ApiException($statusCode, $code, $message)';
}

Never parseApiError(DioException error) {
  final data = error.response?.data;
  String message = error.message ?? 'Request failed';
  String? code;

  if (data is Map) {
    message = (data['message'] ?? data['error'] ?? message).toString();
    code = data['code']?.toString();
  }

  throw ApiException(
    message: message,
    statusCode: error.response?.statusCode,
    code: code,
  );
}
