import 'package:flutter_riverpod/flutter_riverpod.dart';



import '../../../../core/network/api_exception.dart';

import '../../../../core/network/dio_client.dart';

import '../../../../core/security/app_lock_provider.dart';

import '../../../../core/security/biometric_service.dart';

import '../../data/auth_repository_impl.dart';

import '../../domain/models/app_user.dart';



enum AuthStatus { unknown, authenticated, unauthenticated }



class AuthState {

  const AuthState({

    this.status = AuthStatus.unknown,

    this.user,

    this.isLoading = false,

    this.errorMessage,

  });



  final AuthStatus status;

  final AppUser? user;

  final bool isLoading;

  final String? errorMessage;



  AuthState copyWith({

    AuthStatus? status,

    AppUser? user,

    bool? isLoading,

    String? errorMessage,

    bool clearError = false,

  }) =>

      AuthState(

        status: status ?? this.status,

        user: user ?? this.user,

        isLoading: isLoading ?? this.isLoading,

        errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),

      );

}



class AuthNotifier extends StateNotifier<AuthState> {

  AuthNotifier(this._ref) : super(const AuthState());



  final Ref _ref;



  AuthRepository get _repo => _ref.read(authRepositoryProvider);



  Future<void> _onAuthenticated(AppUser user, {bool offerBiometric = true}) async {

    state = AuthState(status: AuthStatus.authenticated, user: user);

    _ref.read(appLockProvider.notifier).recordActivity();

    if (offerBiometric) {

      await _repo.promptEnableBiometricAfterLogin();

      final storage = _ref.read(secureTokenStorageProvider);

      final enabled = await storage.isBiometricEnabled();

      final biometric = _ref.read(biometricServiceProvider);

      if (enabled && await biometric.canCheckBiometrics()) {

        _ref.read(appLockProvider.notifier).setBiometricEnabled(true);

      }

    }

  }



  Future<void> bootstrap() async {

    state = state.copyWith(isLoading: true, clearError: true);

    try {

      final user = await _repo.tryRestoreSession();

      if (user != null && user.id.isNotEmpty) {

        state = AuthState(status: AuthStatus.authenticated, user: user);

        final lock = _ref.read(appLockProvider.notifier);

        final storage = _ref.read(secureTokenStorageProvider);

        final biometric = _ref.read(biometricServiceProvider);

        final enabled = await storage.isBiometricEnabled();

        if (enabled && await biometric.canCheckBiometrics()) {

          lock.lock();

        } else {

          lock.recordActivity();

        }

      } else {

        state = const AuthState(status: AuthStatus.unauthenticated);

      }

    } catch (e) {

      state = AuthState(status: AuthStatus.unauthenticated, errorMessage: e.toString());

    } finally {

      state = state.copyWith(isLoading: false);

    }

  }



  Future<bool> login(String email, String password) async {

    state = state.copyWith(isLoading: true, clearError: true);

    try {

      final tokens = await _repo.loginWithPassword(email: email, password: password);

      await _onAuthenticated(tokens.user);

      state = state.copyWith(isLoading: false);

      return true;

    } on ApiException catch (e) {

      state = state.copyWith(isLoading: false, errorMessage: e.message);

      return false;

    } catch (e) {

      state = state.copyWith(isLoading: false, errorMessage: e.toString());

      return false;

    }

  }



  Future<bool> loginWithGoogle(String idToken) async {

    state = state.copyWith(isLoading: true, clearError: true);

    try {

      final tokens = await _repo.loginWithGoogle(idToken: idToken);

      await _onAuthenticated(tokens.user);

      state = state.copyWith(isLoading: false);

      return true;

    } on ApiException catch (e) {

      state = state.copyWith(isLoading: false, errorMessage: e.message);

      return false;

    } catch (e) {

      state = state.copyWith(isLoading: false, errorMessage: e.toString());

      return false;

    }

  }



  Future<OtpSendResult?> sendLoginOtp(String phone, OtpChannel channel) async {

    state = state.copyWith(isLoading: true, clearError: true);

    try {

      final result = await _repo.sendLoginOtp(phone: phone, channel: channel);

      state = state.copyWith(isLoading: false);

      return result;

    } catch (e) {

      state = state.copyWith(isLoading: false, errorMessage: e.toString());

      return null;

    }

  }



  Future<bool> verifyOtp({

    required String destination,

    required String code,

    required String purpose,

  }) async {

    state = state.copyWith(isLoading: true, clearError: true);

    try {

      final tokens = await _repo.verifyOtp(

        destination: destination,

        code: code,

        purpose: purpose,

      );

      await _onAuthenticated(tokens.user);

      state = state.copyWith(isLoading: false);

      return true;

    } on ApiException catch (e) {

      state = state.copyWith(isLoading: false, errorMessage: e.message);

      return false;

    } catch (e) {

      state = state.copyWith(isLoading: false, errorMessage: e.toString());

      return false;

    }

  }



  Future<RegisterResult?> register({

    required String fullName,

    required String email,

    required String phone,

    required String password,

    String? tenantName,

    OtpChannel channel = OtpChannel.sms,

  }) async {

    state = state.copyWith(isLoading: true, clearError: true);

    try {

      final result = await _repo.register(

        fullName: fullName,

        email: email,

        phone: phone,

        password: password,

        tenantName: tenantName,

        channel: channel,

      );

      state = state.copyWith(isLoading: false);

      return result;

    } catch (e) {

      state = state.copyWith(isLoading: false, errorMessage: e.toString());

      return null;

    }

  }



  Future<bool> forgotPassword(String destination, {OtpChannel? channel}) async {

    state = state.copyWith(isLoading: true, clearError: true);

    try {

      await _repo.forgotPassword(destination, channel: channel);

      state = state.copyWith(isLoading: false);

      return true;

    } catch (e) {

      state = state.copyWith(isLoading: false, errorMessage: e.toString());

      return false;

    }

  }



  Future<bool> resetPassword({

    required String destination,

    required String code,

    required String newPassword,

  }) async {

    state = state.copyWith(isLoading: true, clearError: true);

    try {

      await _repo.resetPassword(

        destination: destination,

        code: code,

        newPassword: newPassword,

      );

      state = state.copyWith(isLoading: false);

      return true;

    } catch (e) {

      state = state.copyWith(isLoading: false, errorMessage: e.toString());

      return false;

    }

  }



  Future<void> logout() async {

    await _repo.logout();

    state = const AuthState(status: AuthStatus.unauthenticated);

  }



  void updateUser(AppUser user) {

    state = state.copyWith(user: user);

  }

}



final authProvider = StateNotifierProvider<AuthNotifier, AuthState>(

  (ref) => AuthNotifier(ref),

);


