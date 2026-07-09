import 'package:hive_flutter/hive_flutter.dart';

import '../config/app_config.dart';

class HiveBoxes {
  static Future<void> init() async {
    await Hive.initFlutter();
    await Hive.openBox<dynamic>(AppConfig.hiveBoxCache);
    await Hive.openBox<dynamic>(AppConfig.hiveBoxOfflineQueue);
  }

  static Box<dynamic> get cache => Hive.box<dynamic>(AppConfig.hiveBoxCache);
  static Box<dynamic> get offlineQueue =>
      Hive.box<dynamic>(AppConfig.hiveBoxOfflineQueue);

  static Future<void> cacheUserJson(Map<String, dynamic> user) async {
    await cache.put(AppConfig.keyCachedUser, user);
  }

  static Map<String, dynamic>? getCachedUser() {
    final raw = cache.get(AppConfig.keyCachedUser);
    if (raw is Map) {
      return Map<String, dynamic>.from(raw);
    }
    return null;
  }

  static Future<void> setActiveProduct(String product) async {
    await cache.put(AppConfig.keyActiveProduct, product);
  }

  static String? getActiveProduct() =>
      cache.get(AppConfig.keyActiveProduct) as String?;

  static Future<void> touchSession() async {
    await cache.put(
      AppConfig.keyLastActiveAt,
      DateTime.now().toIso8601String(),
    );
  }

  static DateTime? lastActiveAt() {
    final raw = cache.get(AppConfig.keyLastActiveAt) as String?;
    if (raw == null) return null;
    return DateTime.tryParse(raw);
  }
}
