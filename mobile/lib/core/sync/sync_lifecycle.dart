import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/auth/presentation/providers/auth_provider.dart';
import '../notifications/push_service.dart';
import 'retail_offline_providers.dart';
import 'sync_providers.dart';

/// Starts background sync + push registration when the user is authenticated.
class SyncLifecycle extends ConsumerStatefulWidget {
  const SyncLifecycle({super.key, required this.child});

  final Widget child;

  @override
  ConsumerState<SyncLifecycle> createState() => _SyncLifecycleState();
}

class _SyncLifecycleState extends ConsumerState<SyncLifecycle> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _onAuthenticated());
  }

  void _onAuthenticated() {
    if (!mounted) return;
    final auth = ref.read(authProvider);
    if (auth.status == AuthStatus.authenticated) {
      ref.read(syncServiceProvider).start();
      ref.read(retailOfflineSyncServiceProvider).start();
      ref.read(retailOfflinePendingProvider.notifier).state =
          ref.read(retailOfflineQueueProvider).getPendingCount();
      ref.read(pushServiceProvider).initializeAndRegister();
    }
  }

  @override
  Widget build(BuildContext context) {
    ref.listen<AuthState>(authProvider, (prev, next) {
      if (next.status == AuthStatus.authenticated) {
        ref.read(syncServiceProvider).start();
        ref.read(retailOfflineSyncServiceProvider).start();
        ref.read(retailOfflinePendingProvider.notifier).state =
            ref.read(retailOfflineQueueProvider).getPendingCount();
        ref.read(pushServiceProvider).initializeAndRegister();
      } else if (next.status == AuthStatus.unauthenticated) {
        ref.read(syncServiceProvider).stop();
        ref.read(retailOfflineSyncServiceProvider).stop();
      }
    });

    return widget.child;
  }
}
