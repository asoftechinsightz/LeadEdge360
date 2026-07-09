import 'dart:async';

import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config/app_config.dart';
import '../storage/hive_boxes.dart';
import '../network/dio_client.dart';
import '../storage/secure_token_storage.dart';
import '../../features/auth/presentation/providers/auth_provider.dart';
import 'biometric_service.dart';

enum AppLockStatus { unlocked, locked }

class AppLockState {
  const AppLockState({
    this.status = AppLockStatus.unlocked,
    this.biometricAvailable = false,
    this.biometricEnabled = false,
    this.lastActivityAt,
    this.errorMessage,
  });

  final AppLockStatus status;
  final bool biometricAvailable;
  final bool biometricEnabled;
  final DateTime? lastActivityAt;
  final String? errorMessage;

  bool get isLocked => status == AppLockStatus.locked;

  AppLockState copyWith({
    AppLockStatus? status,
    bool? biometricAvailable,
    bool? biometricEnabled,
    DateTime? lastActivityAt,
    String? errorMessage,
    bool clearError = false,
  }) =>
      AppLockState(
        status: status ?? this.status,
        biometricAvailable: biometricAvailable ?? this.biometricAvailable,
        biometricEnabled: biometricEnabled ?? this.biometricEnabled,
        lastActivityAt: lastActivityAt ?? this.lastActivityAt,
        errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      );
}

class AppLockNotifier extends StateNotifier<AppLockState> {
  AppLockNotifier(this._ref) : super(const AppLockState()) {
    _init();
  }

  final Ref _ref;
  Timer? _idleTimer;
  var _resumeLockPending = false;

  BiometricService get _biometric => _ref.read(biometricServiceProvider);
  SecureTokenStorage get _storage => _ref.read(secureTokenStorageProvider);

  Future<void> _init() async {
    final available = await _biometric.canCheckBiometrics();
    final enabled = await _storage.isBiometricEnabled();
    final lastActive = HiveBoxes.lastActiveAt() ?? DateTime.now();
    state = state.copyWith(
      biometricAvailable: available,
      biometricEnabled: enabled && available,
      lastActivityAt: lastActive,
    );
    _resetIdleTimer();
  }

  void recordActivity() {
    final now = DateTime.now();
    state = state.copyWith(lastActivityAt: now, clearError: true);
    HiveBoxes.touchSession();
    _resetIdleTimer();
  }

  void onAppPaused() {
    if (!state.biometricEnabled) return;
    _resumeLockPending = true;
    _idleTimer?.cancel();
  }

  void onAppResumed() {
    final auth = _ref.read(authProvider);
    if (auth.status != AuthStatus.authenticated || !state.biometricEnabled) {
      _resumeLockPending = false;
      _resetIdleTimer();
      return;
    }

    final idleExceeded = _isIdleExceeded();
    if (_resumeLockPending || idleExceeded) {
      lock();
    }
    _resumeLockPending = false;
    _resetIdleTimer();
  }

  bool _isIdleExceeded() {
    final last = state.lastActivityAt ?? HiveBoxes.lastActiveAt();
    if (last == null) return false;
    return DateTime.now().difference(last) > AppConfig.sessionIdleTimeout;
  }

  void lock() {
    if (!state.biometricEnabled) return;
    state = state.copyWith(status: AppLockStatus.locked, clearError: true);
    _idleTimer?.cancel();
  }

  void unlock() {
    state = state.copyWith(status: AppLockStatus.unlocked, clearError: true);
    recordActivity();
  }

  Future<bool> tryUnlock() async {
    final ok = await _biometric.authenticate(
      reason: 'Confirm your identity to continue',
    );
    if (ok) {
      unlock();
      return true;
    }
    state = state.copyWith(errorMessage: 'Biometric authentication failed');
    return false;
  }

  Future<bool> setBiometricEnabled(bool enabled) async {
    if (enabled) {
      if (!state.biometricAvailable) return false;
      final ok = await _biometric.authenticate(reason: 'Enable biometric unlock');
      if (!ok) return false;
      await _storage.setBiometricEnabled(true);
      state = state.copyWith(biometricEnabled: true, clearError: true);
      recordActivity();
      return true;
    }

    await _storage.setBiometricEnabled(false);
    state = state.copyWith(biometricEnabled: false, status: AppLockStatus.unlocked);
    return true;
  }

  void _resetIdleTimer() {
    _idleTimer?.cancel();
    if (!state.biometricEnabled) return;
    if (_ref.read(authProvider).status != AuthStatus.authenticated) return;

    _idleTimer = Timer(AppConfig.sessionIdleTimeout, () {
      if (_ref.read(authProvider).status == AuthStatus.authenticated) {
        lock();
      }
    });
  }

  @override
  void dispose() {
    _idleTimer?.cancel();
    super.dispose();
  }
}

final biometricServiceProvider = Provider<BiometricService>((ref) => BiometricService());

final appLockProvider = StateNotifierProvider<AppLockNotifier, AppLockState>(
  (ref) => AppLockNotifier(ref),
);
