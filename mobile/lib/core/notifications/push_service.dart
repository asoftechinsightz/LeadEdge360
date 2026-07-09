import 'dart:io' show Platform;

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config/app_config.dart';
import '../storage/hive_boxes.dart';
import 'notifications_repository.dart';

class PushService {
  PushService(this._repo);

  final NotificationsRepository _repo;
  bool _initialized = false;

  Future<void> initializeAndRegister() async {
    if (!AppConfig.enableFcm || _initialized) return;

    try {
      await Firebase.initializeApp();
      final messaging = FirebaseMessaging.instance;

      await messaging.requestPermission(alert: true, badge: true, sound: true);

      final token = await messaging.getToken();
      if (token != null) {
        await _registerToken(token);
      }

      messaging.onTokenRefresh.listen(_registerToken);
      FirebaseMessaging.onMessage.listen((message) {
        debugPrint('FCM foreground: ${message.notification?.title}');
      });

      _initialized = true;
    } catch (e) {
      debugPrint('FCM unavailable (add google-services.json + ENABLE_FCM=true): $e');
    }
  }

  Future<void> _registerToken(String token) async {
    final cached = HiveBoxes.cache.get(AppConfig.keyFcmToken) as String?;
    if (cached == token) return;

    await _repo.registerDevice(
      token: token,
      platform: defaultTargetPlatform == TargetPlatform.iOS ? 'ios' : 'android',
      deviceName: _deviceName(),
    );
    await HiveBoxes.cache.put(AppConfig.keyFcmToken, token);
  }

  String _deviceName() {
    if (kIsWeb) return 'web';
    try {
      return '${Platform.operatingSystem} ${Platform.operatingSystemVersion}';
    } catch (_) {
      return 'android';
    }
  }
}

final pushServiceProvider = Provider<PushService>((ref) {
  return PushService(ref.watch(notificationsRepositoryProvider));
});
