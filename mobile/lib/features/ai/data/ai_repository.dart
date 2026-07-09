import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/network/dio_client.dart';
import '../../leadedge360/domain/models/lead_models.dart';
import '../domain/models/ai_models.dart';

class AiRepository {
  AiRepository(this._dio);

  final Dio _dio;

  Future<AiSuggestResult> suggest({
    required String leadId,
    required String intent,
    Lead? lead,
    String tone = 'professional',
  }) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>(
        '/ai/suggest',
        data: {
          'leadId': leadId,
          'intent': intent,
          'tone': tone,
          if (lead != null) 'lead': lead.toJson(),
        },
      );
      final body = res.data ?? {};
      final payload = unwrapAiPayload(body);
      return AiSuggestResult.fromJson(payload);
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<AiScoreResult> scoreLead(String leadId) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>(
        '/ai/score',
        data: {'leadId': leadId},
      );
      final body = res.data ?? {};
      final payload = unwrapAiPayload(body);
      return AiScoreResult.fromJson(payload);
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }
}

final aiRepositoryProvider = Provider<AiRepository>(
  (ref) => AiRepository(ref.watch(dioProvider)),
);
