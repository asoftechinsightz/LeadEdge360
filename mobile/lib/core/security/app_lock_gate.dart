import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/auth/presentation/providers/auth_provider.dart';
import '../theme/app_colors.dart';
import 'app_lock_provider.dart';

/// Tracks lifecycle + user activity; shows biometric lock overlay when required.
class AppLockGate extends ConsumerStatefulWidget {
  const AppLockGate({super.key, required this.child});

  final Widget child;

  @override
  ConsumerState<AppLockGate> createState() => _AppLockGateState();
}

class _AppLockGateState extends ConsumerState<AppLockGate> with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    final notifier = ref.read(appLockProvider.notifier);
    switch (state) {
      case AppLifecycleState.paused:
      case AppLifecycleState.inactive:
      case AppLifecycleState.hidden:
        notifier.onAppPaused();
      case AppLifecycleState.resumed:
        notifier.onAppResumed();
      case AppLifecycleState.detached:
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final lock = ref.watch(appLockProvider);
    final showLock = auth.status == AuthStatus.authenticated && lock.isLocked;

    return Listener(
      behavior: HitTestBehavior.translucent,
      onPointerDown: (_) => ref.read(appLockProvider.notifier).recordActivity(),
      child: Stack(
        children: [
          widget.child,
          if (showLock)
            BiometricLockScreen(
              onUnlock: () => ref.read(appLockProvider.notifier).tryUnlock(),
            ),
        ],
      ),
    );
  }
}

class BiometricLockScreen extends StatefulWidget {
  const BiometricLockScreen({super.key, required this.onUnlock});

  final Future<bool> Function() onUnlock;

  @override
  State<BiometricLockScreen> createState() => _BiometricLockScreenState();
}

class _BiometricLockScreenState extends State<BiometricLockScreen> {
  var _unlocking = false;
  String? _error;

  Future<void> _unlock() async {
    setState(() {
      _unlocking = true;
      _error = null;
    });
    final ok = await widget.onUnlock();
    if (!mounted) return;
    setState(() {
      _unlocking = false;
      if (!ok) _error = 'Authentication failed — try again';
    });
  }

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.navySurface,
      child: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 88,
                  height: 88,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppColors.primaryBlue.withValues(alpha: 0.15),
                    border: Border.all(color: AppColors.primaryBlue.withValues(alpha: 0.35)),
                  ),
                  child: const Icon(Icons.fingerprint, size: 48, color: AppColors.cyan),
                ),
                const SizedBox(height: 24),
                Text('App locked', style: Theme.of(context).textTheme.headlineMedium),
                const SizedBox(height: 8),
                const Text(
                  'Use biometrics or device PIN to continue',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: AppColors.slate400),
                ),
                if (_error != null) ...[
                  const SizedBox(height: 12),
                  Text(
                    _error!,
                    style: const TextStyle(color: AppColors.error, fontSize: 13),
                    textAlign: TextAlign.center,
                  ),
                ],
                const SizedBox(height: 28),
                FilledButton.icon(
                  onPressed: _unlocking ? null : _unlock,
                  icon: _unlocking
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Icon(Icons.lock_open),
                  label: Text(_unlocking ? 'Unlocking…' : 'Unlock'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
