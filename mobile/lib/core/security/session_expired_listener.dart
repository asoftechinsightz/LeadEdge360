import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../network/dio_client.dart';
import '../../features/auth/presentation/providers/auth_provider.dart';

/// Forces logout + login redirect when refresh token rotation fails.
class SessionExpiredListener extends ConsumerWidget {
  const SessionExpiredListener({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    ref.listen<bool>(sessionExpiredProvider, (prev, expired) async {
      if (expired == true) {
        ref.read(sessionExpiredProvider.notifier).state = false;
        await ref.read(authProvider.notifier).logout();
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Session expired — please sign in again')),
          );
          context.go('/login');
        }
      }
    });

    ref.listen<AuthState>(authProvider, (prev, next) {
      if (prev?.status == AuthStatus.authenticated &&
          next.status == AuthStatus.unauthenticated &&
          context.mounted) {
        final loc = GoRouterState.of(context).matchedLocation;
        if (loc != '/login' && loc != '/') {
          context.go('/login');
        }
      }
    });

    return child;
  }
}
