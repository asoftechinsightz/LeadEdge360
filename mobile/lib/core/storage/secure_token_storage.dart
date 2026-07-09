import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../config/app_config.dart';

class SecureTokenStorage {
  SecureTokenStorage({FlutterSecureStorage? storage})
      : _storage = storage ??
            const FlutterSecureStorage(
              aOptions: AndroidOptions(encryptedSharedPreferences: true),
            );

  final FlutterSecureStorage _storage;

  Future<void> saveTokens({
    required String access,
    required String refresh,
  }) async {
    await _storage.write(key: AppConfig.keyAccessToken, value: access);
    await _storage.write(key: AppConfig.keyRefreshToken, value: refresh);
  }

  Future<String?> getAccessToken() =>
      _storage.read(key: AppConfig.keyAccessToken);

  Future<String?> getRefreshToken() =>
      _storage.read(key: AppConfig.keyRefreshToken);

  Future<bool> hasRefreshToken() async {
    final t = await getRefreshToken();
    return t != null && t.isNotEmpty;
  }

  Future<void> clearTokens() async {
    await _storage.delete(key: AppConfig.keyAccessToken);
    await _storage.delete(key: AppConfig.keyRefreshToken);
  }

  Future<void> setBiometricEnabled(bool enabled) => _storage.write(
        key: AppConfig.keyBiometricEnabled,
        value: enabled.toString(),
      );

  Future<bool> isBiometricEnabled() async {
    final v = await _storage.read(key: AppConfig.keyBiometricEnabled);
    return v == 'true';
  }
}
