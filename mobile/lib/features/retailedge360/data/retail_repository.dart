import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/network/dio_client.dart';
import '../domain/models/retail_models.dart';

class RetailRepository {
  RetailRepository(this._dio);

  final Dio _dio;

  Future<List<RetailSku>> fetchInventory() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/retail/inventory');
      final data = res.data ?? {};
      final raw = data['products'] as List? ?? data['items'] as List? ?? [];
      return raw.map((e) => RetailSku.fromJson(Map<String, dynamic>.from(e as Map))).toList();
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<RetailKpis> fetchKpis() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/retail/kpis');
      return RetailKpis.fromJson(res.data ?? {});
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<List<RetailStore>> fetchStores() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/retail/stores');
      final raw = res.data?['items'] as List? ?? [];
      return raw.map((e) => RetailStore.fromJson(Map<String, dynamic>.from(e as Map))).toList();
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<RetailSku> createSku({
    required String name,
    required String sku,
    String category = 'other',
    double price = 0,
    int stock = 0,
    int daysOnShelf = 0,
    String store = 'Default Store',
  }) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>('/retail/inventory', data: {
        'name': name,
        'sku': sku,
        'category': category,
        'price': price,
        'stock': stock,
        'daysOnShelf': daysOnShelf,
        'store': store,
      });
      final data = res.data ?? {};
      final product = data['product'] ?? data['data'];
      if (product is Map) {
        return RetailSku.fromJson(Map<String, dynamic>.from(product));
      }
      throw const ApiException(message: 'Invalid create SKU response');
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<RetailSku> repredict(String inventoryId) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>('/retail/inventory/$inventoryId/repredict');
      final data = res.data ?? {};
      final product = data['product'] ?? unwrapRetailPayload(data);
      if (product is Map) {
        return RetailSku.fromJson(Map<String, dynamic>.from(product));
      }
      throw const ApiException(message: 'Invalid repredict response');
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<void> deleteSku(String inventoryId) async {
    try {
      await _dio.delete('/retail/inventory/$inventoryId');
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<RetailSku> lookupSku(String sku) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>(
        '/retail/inventory/lookup',
        queryParameters: {'sku': sku},
      );
      final product = res.data?['product'] as Map? ?? res.data;
      return RetailSku.fromJson(Map<String, dynamic>.from(product as Map));
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> checkout({
    required List<Map<String, dynamic>> items,
    String paymentMethod = 'cash',
    String? razorpayOrderId,
    String? razorpayPaymentId,
    String? razorpaySignature,
  }) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>('/retail/pos/checkout', data: {
        'items': items,
        'paymentMethod': paymentMethod,
        if (razorpayOrderId != null) 'razorpay_order_id': razorpayOrderId,
        if (razorpayPaymentId != null) 'razorpay_payment_id': razorpayPaymentId,
        if (razorpaySignature != null) 'razorpay_signature': razorpaySignature,
      });
      return Map<String, dynamic>.from(res.data ?? {});
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> createPaymentOrder({
    required List<Map<String, dynamic>> items,
    String paymentMethod = 'upi',
  }) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>('/retail/pos/payment-order', data: {
        'items': items,
        'paymentMethod': paymentMethod,
      });
      return Map<String, dynamic>.from(res.data ?? {});
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<List<RetailSale>> fetchSales({int limit = 50}) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/retail/sales', queryParameters: {'limit': limit});
      final raw = res.data?['items'] as List? ?? [];
      return raw.map((e) => RetailSale.fromJson(Map<String, dynamic>.from(e as Map))).toList();
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  /// Download GST receipt PDF (base64 from API).
  Future<List<int>> fetchReceiptPdf({
    required String saleId,
    String language = 'en',
  }) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>('/retail/pos/receipt/pdf', data: {
        'saleId': saleId,
        'language': language,
        'format': 'base64',
      });
      final b64 = res.data?['pdfBase64']?.toString() ?? '';
      if (b64.isEmpty) {
        throw const ApiException(message: 'Empty PDF response');
      }
      return base64Decode(b64);
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  /// Generate PDF and send via WhatsApp Cloud API.
  Future<void> sendReceiptWhatsApp({
    required String saleId,
    required String phone,
    String language = 'en',
  }) async {
    try {
      await _dio.post<Map<String, dynamic>>('/retail/pos/receipt/pdf', data: {
        'saleId': saleId,
        'phone': phone,
        'language': language,
        'sendWhatsApp': true,
      });
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }
}

final retailRepositoryProvider = Provider<RetailRepository>(
  (ref) => RetailRepository(ref.watch(dioProvider)),
);
