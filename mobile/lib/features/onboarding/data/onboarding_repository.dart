import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/network/dio_client.dart';

class OnboardingRepository {
  OnboardingRepository(this._dio);

  final Dio _dio;

  Future<Map<String, dynamic>> fetchProgress() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/onboarding/progress');
      return Map<String, dynamic>.from(res.data ?? {});
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<void> saveProgress(Map<String, dynamic> progress) async {
    try {
      await _dio.post('/onboarding/progress', data: progress);
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<void> saveCompany({required String companyName, String? industry, String? website}) async {
    try {
      await _dio.post('/onboarding/company', data: {
        'companyName': companyName,
        'industry': industry ?? '',
        'website': website ?? '',
      });
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<void> saveBranding({String? brandName, String? primaryColor, String? secondaryColor}) async {
    try {
      await _dio.post('/onboarding/branding', data: {
        'brandName': brandName ?? '',
        'primaryColor': primaryColor ?? '#0066FF',
        'secondaryColor': secondaryColor ?? '#0A1F44',
      });
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<void> saveTeamInvite({required String email, String? name}) async {
    try {
      await _dio.post('/onboarding/team', data: {
        'email': email,
        'name': name ?? email.split('@').first,
        'role': 'USER',
      });
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<void> saveWhatsApp({required String whatsappNumber}) async {
    try {
      await _dio.post('/onboarding/whatsapp', data: {'whatsappNumber': whatsappNumber});
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<void> saveEmail({required String smtpUser, String? smtpHost}) async {
    try {
      await _dio.post('/onboarding/email', data: {
        'smtpUser': smtpUser,
        'smtpHost': smtpHost ?? 'smtp.gmail.com',
        'smtpPort': 587,
      });
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<bool> needsRetailQuickSetup() async {
    try {
      final progress = await fetchProgress();
      return progress['retailQuickSetup'] != true;
    } on DioException {
      return true;
    }
  }

  Future<Map<String, dynamic>> quickSetup({
    required String shopName,
    required String city,
    required String phone,
    String? gstin,
    required bool useKiranaTemplate,
    required List<Map<String, dynamic>> scannedBarcodes,
    required bool cashOnly,
    String? upiId,
  }) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>('/onboarding/quick-setup', data: {
        'shopName': shopName,
        'city': city,
        'phone': phone,
        if (gstin != null && gstin.isNotEmpty) 'gstin': gstin,
        'useKiranaTemplate': useKiranaTemplate,
        'seedKiranaTemplate': useKiranaTemplate,
        'scannedBarcodes': scannedBarcodes,
        'cashOnly': cashOnly,
        if (upiId != null && upiId.isNotEmpty) 'upiId': upiId,
      });
      return Map<String, dynamic>.from(res.data ?? {});
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }
}

final onboardingRepositoryProvider = Provider<OnboardingRepository>((ref) {
  return OnboardingRepository(ref.watch(dioProvider));
});
