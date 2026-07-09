import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/network/api_exception.dart';
import 'empty_state.dart';
import 'primary_button.dart';

/// User-friendly API failure surface (hides raw exception strings).
class ApiErrorState extends StatelessWidget {
  const ApiErrorState({
    super.key,
    required this.error,
    this.title = 'Something went wrong',
    this.onRetry,
    this.onSignIn,
  });

  final Object error;
  final String title;
  final VoidCallback? onRetry;
  final VoidCallback? onSignIn;

  static bool isUnauthorized(Object error) {
    if (error is ApiException) return error.isUnauthorized;
    return error.toString().contains('401') || error.toString().contains('UNAUTHORIZED');
  }

  static String messageFor(Object error) {
    if (error is ApiException) {
      if (error.isUnauthorized) {
        return 'Your session expired. Please sign in again to continue.';
      }
      if (error.isForbidden) {
        return 'Your plan may not include this feature. Contact your admin or upgrade.';
      }
      return error.message;
    }
    final text = error.toString();
    if (text.contains('401') || text.contains('UNAUTHORIZED')) {
      return 'Your session expired. Please sign in again to continue.';
    }
    return 'We could not load this screen. Check your connection and try again.';
  }

  @override
  Widget build(BuildContext context) {
    final unauthorized = isUnauthorized(error);

    return EmptyState(
      icon: unauthorized ? Icons.lock_outline : Icons.cloud_off_outlined,
      title: unauthorized ? 'Session expired' : title,
      subtitle: messageFor(error),
      action: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (onRetry != null)
            PrimaryButton(
              label: 'Try again',
              icon: Icons.refresh,
              onPressed: onRetry,
            ),
          if (unauthorized) ...[
            if (onRetry != null) const SizedBox(height: 10),
            OutlinedButton(
              onPressed: onSignIn ?? () => context.go('/login'),
              child: const Text('Sign in again'),
            ),
          ],
        ],
      ),
    );
  }
}
