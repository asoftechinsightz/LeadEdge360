import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/network/dio_client.dart';
import '../domain/billing_models.dart';

class BillingRepository {
  BillingRepository(this._dio);

  final Dio _dio;

  Future<List<BillingPlan>> fetchPlans() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/billing/plans');
      final plans = res.data?['plans'] as List? ?? [];
      return plans.map((e) => BillingPlan.fromJson(Map<String, dynamic>.from(e as Map))).toList();
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> createCheckout(String planId) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>('/billing/checkout', data: {'planId': planId});
      return Map<String, dynamic>.from(res.data ?? {});
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> verifyPayment({
    required String orderId,
    required String paymentId,
    required String signature,
    required String planId,
  }) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>('/billing/verify', data: {
        'razorpay_order_id': orderId,
        'razorpay_payment_id': paymentId,
        'razorpay_signature': signature,
        'planId': planId,
      });
      return Map<String, dynamic>.from(res.data ?? {});
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<SubscriptionRecord> startFreeTrial({String planCode = 'BUSINESS_GROWTH'}) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>('/subscriptions', data: {
        'trial': true,
        'planCode': planCode,
      });
      final sub = res.data?['subscription'] as Map? ?? res.data;
      return SubscriptionRecord.fromJson(Map<String, dynamic>.from(sub as Map));
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<List<SubscriptionRecord>> fetchSubscriptions() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/subscriptions');
      final items = res.data?['items'] as List? ?? res.data?['subscriptions'] as List? ?? [];
      return items.map((e) => SubscriptionRecord.fromJson(Map<String, dynamic>.from(e as Map))).toList();
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<List<PaymentRecord>> fetchPayments() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/payments');
      final items = res.data?['payments'] as List? ?? [];
      return items.map((e) => PaymentRecord.fromJson(Map<String, dynamic>.from(e as Map))).toList();
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }
}

final billingRepositoryProvider = Provider<BillingRepository>((ref) {
  return BillingRepository(ref.watch(dioProvider));
});
