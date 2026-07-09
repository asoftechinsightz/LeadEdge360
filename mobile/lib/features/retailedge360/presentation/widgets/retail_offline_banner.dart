import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/locale/l10n_context.dart';
import '../../../../core/sync/connectivity_service.dart';
import '../../../../core/sync/retail_offline_providers.dart';
import '../../../../core/theme/app_colors.dart';

/// Dashboard banner for pending offline retail bills.
class RetailOfflineBanner extends ConsumerWidget {
  const RetailOfflineBanner({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = context.l10n;
    final pending = ref.watch(retailOfflinePendingProvider);
    final online = ref.watch(isOnlineProvider).maybeWhen(data: (v) => v, orElse: () => true);

    if (pending == 0) {
      return const SizedBox.shrink();
    }

    final message = l10n.offlinePending(pending);

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Material(
        color: online
            ? AppColors.retailOrange.withValues(alpha: 0.12)
            : AppColors.error.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: online && pending > 0
              ? () => ref.read(retailOfflineSyncServiceProvider).replay()
              : null,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            child: Row(
              children: [
                Icon(
                  online ? Icons.cloud_upload_outlined : Icons.cloud_off,
                  size: 18,
                  color: online ? AppColors.retailOrange : AppColors.error,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    message,
                    style: TextStyle(
                      fontSize: 13,
                      color: online ? AppColors.brandNavy : AppColors.error,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                if (online && pending > 0)
                  Text(
                    l10n.retry,
                    style: const TextStyle(fontSize: 11, color: AppColors.retailOrange),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
