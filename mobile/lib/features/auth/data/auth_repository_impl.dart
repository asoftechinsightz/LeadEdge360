import 'package:dio/dio.dart';

import 'package:flutter_riverpod/flutter_riverpod.dart';



import '../../../../core/config/app_config.dart';

import '../../../../core/network/api_exception.dart';

import '../../../../core/network/dio_client.dart';

import '../../../../core/storage/hive_boxes.dart';

import '../../../../core/security/biometric_service.dart';

import '../../../../core/storage/secure_token_storage.dart';

import '../domain/models/app_user.dart';



enum OtpChannel { sms, whatsapp }



abstract class AuthRepository {

  Future<AuthTokens> loginWithPassword({

    required String email,

    required String password,

    String? device,

  });



  Future<OtpSendResult> sendLoginOtp({

    required String phone,

    OtpChannel channel = OtpChannel.sms,

  });



  Future<AuthTokens> verifyOtp({

    required String destination,

    required String code,

    required String purpose,

  });



  Future<AuthTokens> loginWithGoogle({required String idToken});



  Future<RegisterResult> register({

    required String fullName,

    required String email,

    required String phone,

    required String password,

    String? tenantName,

    OtpChannel channel = OtpChannel.sms,

  });



  Future<void> forgotPassword(String destination, {OtpChannel? channel});



  Future<void> resetPassword({

    required String destination,

    required String code,

    required String newPassword,

  });



  Future<List<AuthSession>> listSessions();



  Future<void> revokeSession(String sessionId);



  Future<void> logoutAllOtherDevices();



  Future<AppUser?> tryRestoreSession();



  Future<AppUser> fetchCurrentUser();



  Future<void> logout();



  Future<bool> authenticateWithBiometric();



  Future<void> promptEnableBiometricAfterLogin();

}



class OtpSendResult {

  const OtpSendResult({this.devOtp, this.channel});



  final String? devOtp;

  final String? channel;

}



class RegisterResult {

  const RegisterResult({required this.userId, this.devOtp});



  final String userId;

  final String? devOtp;

}



class AuthSession {

  const AuthSession({

    required this.id,

    required this.device,

    required this.createdAt,

    this.ip,

    this.lastUsedAt,

  });



  factory AuthSession.fromJson(Map<String, dynamic> json) => AuthSession(

        id: json['id'] as String? ?? '',

        device: json['device'] as String? ?? 'Unknown device',

        ip: json['ip'] as String?,

        createdAt: json['createdAt'] as String? ?? '',

        lastUsedAt: json['lastUsedAt'] as String?,

      );



  final String id;

  final String device;

  final String? ip;

  final String createdAt;

  final String? lastUsedAt;

}



class AuthRepositoryImpl implements AuthRepository {

  AuthRepositoryImpl({

    required Dio dio,

    required SecureTokenStorage tokenStorage,

  })  : _dio = dio,

        _tokenStorage = tokenStorage;



  final Dio _dio;

  final SecureTokenStorage _tokenStorage;



  Future<AuthTokens> _persistAuthResponse(Map<String, dynamic> data) async {

    final tokens = AuthTokens.fromJson(data);

    await _tokenStorage.saveTokens(

      access: tokens.accessToken,

      refresh: tokens.refreshToken,

    );

    await HiveBoxes.cacheUserJson(tokens.user.toJson());

    if (tokens.user.activeProduct != null) {

      await HiveBoxes.setActiveProduct(tokens.user.activeProduct!);

    }

    await HiveBoxes.touchSession();

    return tokens;

  }



  @override

  Future<AuthTokens> loginWithPassword({

    required String email,

    required String password,

    String? device,

  }) async {

    try {

      final res = await _dio.post<Map<String, dynamic>>(

        '/auth/login-password',

        data: {

          'email': email.trim(),

          'password': password,

          'device': device ?? 'android',

        },

      );

      final data = res.data;

      if (data == null) throw const ApiException(message: 'Empty login response');

      return _persistAuthResponse(data);

    } on DioException catch (e) {

      parseApiError(e);

      rethrow;

    }

  }



  @override

  Future<OtpSendResult> sendLoginOtp({

    required String phone,

    OtpChannel channel = OtpChannel.sms,

  }) async {

    try {

      final res = await _dio.post<Map<String, dynamic>>(

        '/auth/login-otp',

        data: {

          'phone': phone.trim(),

          'channel': channel == OtpChannel.whatsapp ? 'whatsapp' : 'sms',

        },

      );

      final data = res.data ?? {};

      return OtpSendResult(

        devOtp: data['devOtp'] as String?,

        channel: data['channel'] as String?,

      );

    } on DioException catch (e) {

      parseApiError(e);

      rethrow;

    }

  }



  @override

  Future<AuthTokens> verifyOtp({

    required String destination,

    required String code,

    required String purpose,

  }) async {

    try {

      final res = await _dio.post<Map<String, dynamic>>(

        '/auth/verify-otp',

        data: {

          'destination': destination.trim(),

          'code': code.trim(),

          'purpose': purpose,

        },

      );

      final data = res.data;

      if (data == null) throw const ApiException(message: 'Empty OTP response');

      if (data['accessToken'] != null) {

        return _persistAuthResponse(data);

      }

      throw const ApiException(message: 'OTP verified but no session returned');

    } on DioException catch (e) {

      parseApiError(e);

      rethrow;

    }

  }



  @override

  Future<AuthTokens> loginWithGoogle({required String idToken}) async {

    try {

      final res = await _dio.post<Map<String, dynamic>>(

        '/auth/google',

        data: {'idToken': idToken, 'device': 'android'},

      );

      final data = res.data;

      if (data == null) throw const ApiException(message: 'Empty Google login response');

      return _persistAuthResponse(data);

    } on DioException catch (e) {

      parseApiError(e);

      rethrow;

    }

  }



  @override

  Future<RegisterResult> register({

    required String fullName,

    required String email,

    required String phone,

    required String password,

    String? tenantName,

    OtpChannel channel = OtpChannel.sms,

  }) async {

    try {

      final res = await _dio.post<Map<String, dynamic>>(

        '/auth/register',

        data: {

          'fullName': fullName.trim(),

          'email': email.trim(),

          'phone': phone.trim(),

          'password': password,

          'tenantName': tenantName?.trim(),

          'channel': channel == OtpChannel.whatsapp ? 'whatsapp' : 'sms',

          'dpdpConsent': {'accepted': true},

        },

      );

      final data = res.data ?? {};

      return RegisterResult(

        userId: data['userId'] as String? ?? '',

        devOtp: data['devOtp'] as String?,

      );

    } on DioException catch (e) {

      parseApiError(e);

      rethrow;

    }

  }



  @override

  Future<void> forgotPassword(String destination, {OtpChannel? channel}) async {

    try {

      await _dio.post('/auth/forgot-password', data: {

        'destination': destination.trim(),

        if (channel != null)

          'channel': channel == OtpChannel.whatsapp ? 'whatsapp' : 'sms',

      });

    } on DioException catch (e) {

      parseApiError(e);

      rethrow;

    }

  }



  @override

  Future<void> resetPassword({

    required String destination,

    required String code,

    required String newPassword,

  }) async {

    try {

      await _dio.post('/auth/reset-password', data: {

        'destination': destination.trim(),

        'code': code.trim(),

        'newPassword': newPassword,

      });

    } on DioException catch (e) {

      parseApiError(e);

      rethrow;

    }

  }



  @override

  Future<List<AuthSession>> listSessions() async {

    try {

      final res = await _dio.get<Map<String, dynamic>>('/auth/sessions');

      final list = res.data?['sessions'];

      if (list is! List) return [];

      return list

          .map((e) => AuthSession.fromJson(Map<String, dynamic>.from(e as Map)))

          .toList();

    } on DioException catch (e) {

      parseApiError(e);

      rethrow;

    }

  }



  @override

  Future<void> revokeSession(String sessionId) async {

    try {

      await _dio.delete('/auth/sessions/$sessionId');

    } on DioException catch (e) {

      parseApiError(e);

      rethrow;

    }

  }



  @override

  Future<void> logoutAllOtherDevices() async {

    final refresh = await _tokenStorage.getRefreshToken();

    try {

      await _dio.post('/auth/logout-all', data: {

        if (refresh != null) 'refreshToken': refresh,

      });

    } on DioException catch (e) {

      parseApiError(e);

      rethrow;

    }

  }



  @override

  Future<AppUser?> tryRestoreSession() async {

    final access = await _tokenStorage.getAccessToken();

    final hasRefresh = await _tokenStorage.hasRefreshToken();



    if ((access == null || access.isEmpty) && !hasRefresh) {

      await _clearStaleSession();

      return null;

    }



    if ((access == null || access.isEmpty) && hasRefresh) {

      final refreshed = await _refreshTokens();

      if (!refreshed) {

        await _clearStaleSession();

        return null;

      }

    }



    try {

      final user = await fetchCurrentUser();

      await HiveBoxes.cacheUserJson(user.toJson());

      await HiveBoxes.touchSession();

      return user;

    } on ApiException catch (e) {

      if (e.isUnauthorized && hasRefresh) {

        final refreshed = await _refreshTokens();

        if (refreshed) {

          try {

            final user = await fetchCurrentUser();

            await HiveBoxes.cacheUserJson(user.toJson());

            await HiveBoxes.touchSession();

            return user;

          } catch (_) {}

        }

      }

      await _clearStaleSession();

      return null;

    } catch (_) {

      final token = await _tokenStorage.getAccessToken();

      if (token == null || token.isEmpty) {

        await _clearStaleSession();

        return null;

      }

      final cached = HiveBoxes.getCachedUser();

      return cached != null ? AppUser.fromJson(cached) : null;

    }

  }



  Future<bool> _refreshTokens() async {

    final refresh = await _tokenStorage.getRefreshToken();

    if (refresh == null || refresh.isEmpty) return false;

    try {

      final refreshDio = Dio(BaseOptions(baseUrl: AppConfig.apiBaseUrl));

      final res = await refreshDio.post<Map<String, dynamic>>(

        '/auth/refresh-token',

        data: {'refreshToken': refresh},

      );

      final data = res.data;

      if (data == null) return false;

      final access = data['accessToken'] as String?;

      final newRefresh = data['refreshToken'] as String?;

      if (access == null || newRefresh == null) return false;

      await _tokenStorage.saveTokens(access: access, refresh: newRefresh);

      return true;

    } catch (_) {

      return false;

    }

  }



  Future<void> _clearStaleSession() async {

    await _tokenStorage.clearTokens();

    await HiveBoxes.cache.delete(AppConfig.keyCachedUser);

  }



  @override

  Future<AppUser> fetchCurrentUser() async {

    try {

      final res = await _dio.get<Map<String, dynamic>>('/users/me');

      final data = res.data;

      if (data == null) throw const ApiException(message: 'Empty profile response');

      return AppUser.fromJson(data);

    } on DioException catch (e) {

      parseApiError(e);

      rethrow;

    }

  }



  @override

  Future<void> logout() async {

    final refresh = await _tokenStorage.getRefreshToken();

    try {

      if (refresh != null) {

        await _dio.post('/auth/logout', data: {'refreshToken': refresh});

      }

    } catch (_) {}

    await _tokenStorage.clearTokens();

    await HiveBoxes.cache.delete(AppConfig.keyCachedUser);

    await HiveBoxes.cache.delete(AppConfig.keyActiveProduct);

    await HiveBoxes.cache.delete(AppConfig.keyCachedLeads);

    await HiveBoxes.cache.delete(AppConfig.keyCachedLeadDetails);

    await HiveBoxes.cache.delete(AppConfig.keyCachedBootstrap);

    await HiveBoxes.cache.delete(AppConfig.keyLastSyncAt);

    await HiveBoxes.cache.delete(AppConfig.keyFcmToken);

    await HiveBoxes.offlineQueue.clear();

  }



  @override

  Future<bool> authenticateWithBiometric() async {

    final service = BiometricService();

    if (!await service.canCheckBiometrics()) return true;

    final enabled = await _tokenStorage.isBiometricEnabled();

    if (!enabled) return true;

    return service.authenticate(reason: 'Unlock Asoftech Business Suite');

  }



  @override

  Future<void> promptEnableBiometricAfterLogin() async {

    final service = BiometricService();

    if (!await service.canCheckBiometrics()) return;

    final enabled = await _tokenStorage.isBiometricEnabled();

    if (enabled) return;

    final ok = await service.authenticate(

      reason: 'Enable biometric unlock for faster sign-in',

    );

    if (ok) await _tokenStorage.setBiometricEnabled(true);

  }

}



final authRepositoryProvider = Provider<AuthRepository>((ref) {

  return AuthRepositoryImpl(

    dio: ref.watch(dioProvider),

    tokenStorage: ref.watch(secureTokenStorageProvider),

  );

});


