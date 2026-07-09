import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/api_exception.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/storage/hive_boxes.dart';
import '../../../../core/sync/cache_providers.dart';
import '../../../../core/sync/leads_cache.dart';
import '../../auth/presentation/providers/auth_provider.dart';

class ProductInfo {
  const ProductInfo({
    required this.code,
    required this.name,
    this.displayName,
  });

  factory ProductInfo.fromDynamic(dynamic raw) {
    if (raw is String) {
      return ProductInfo(code: raw.toLowerCase(), name: raw);
    }
    final map = Map<String, dynamic>.from(raw as Map);
    final code = (map['code'] ?? map['name'] ?? '').toString().toLowerCase();
    return ProductInfo(
      code: code,
      name: map['name']?.toString() ?? code,
      displayName: map['displayName']?.toString(),
    );
  }

  final String code;
  final String name;
  final String? displayName;

  String get label => displayName ?? name;
}

class ProductsState {
  const ProductsState({
    this.products = const [],
    this.activeProduct,
    this.subscriptionTier,
    this.isLoading = false,
    this.error,
  });

  final List<ProductInfo> products;
  final String? activeProduct;
  final String? subscriptionTier;
  final bool isLoading;
  final String? error;
}

class ShellRepository {
  ShellRepository(this._dio, this._cache);

  final Dio _dio;
  final LeadsCache _cache;

  Future<ProductsState> fetchProducts() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/products');
      final data = res.data ?? {};
      final raw = data['products'] as List? ?? [];
      final products = raw.map(ProductInfo.fromDynamic).where((p) => p.code.isNotEmpty).toList();
      return ProductsState(
        products: products,
        activeProduct: data['activeProduct'] as String?,
        subscriptionTier: data['subscriptionTier'] as String?,
      );
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<String> switchProduct(String product, WidgetRef ref) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>(
        '/products/switch',
        data: {'product': product},
      );
      final active = res.data?['activeProduct'] as String? ?? product;
      await HiveBoxes.setActiveProduct(active);
      final user = ref.read(authProvider).user;
      if (user != null) {
        ref.read(authProvider.notifier).updateUser(user.copyWith(activeProduct: active));
      }
      return active;
    } on DioException catch (e) {
      parseApiError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> fetchBootstrap() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/mobile/bootstrap');
      final bootstrap = Map<String, dynamic>.from(res.data?['bootstrap'] as Map? ?? {});
      await _cache.cacheBootstrap(bootstrap);
      return bootstrap;
    } on DioException catch (e) {
      final cached = _cache.getBootstrap();
      if (cached != null) return cached;
      parseApiError(e);
      rethrow;
    }
  }
}

final shellRepositoryProvider = Provider<ShellRepository>(
  (ref) => ShellRepository(ref.watch(dioProvider), ref.watch(leadsCacheProvider)),
);

final productsProvider = FutureProvider<ProductsState>((ref) async {
  return ref.watch(shellRepositoryProvider).fetchProducts();
});

final bootstrapProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  return ref.watch(shellRepositoryProvider).fetchBootstrap();
});
