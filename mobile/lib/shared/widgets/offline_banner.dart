import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../core/sync/cache_providers.dart';
import '../../core/sync/sync_providers.dart';
import '../../core/theme/app_colors.dart';

class OfflineBanner extends ConsumerWidget {
  const OfflineBanner({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sync = ref.watch(syncStateProvider);
    final pending = ref.watch(offlineQueueProvider).pendingCount;
    if (sync.isOnline && pending == 0 && !sync.isSyncing) {
      return const SizedBox.shrink();
    }

    final offline = !sync.isOnline;
    final syncing = sync.isSyncing;

    String message;
    if (offline) {
      message = pending > 0
          ? 'Offline — $pending change${pending == 1 ? '' : 's'} queued'
          : 'Offline — showing cached leads';
    } else if (syncing) {
      message = 'Syncing…';
    } else if (pending > 0) {
      message = '$pending change${pending == 1 ? '' : 's'} waiting to sync';
    } else if (sync.lastSyncAt != null) {
      final fmt = DateFormat.Hm().format(sync.lastSyncAt!.toLocal());
      message = 'Synced at $fmt';
    } else {
      return const SizedBox.shrink();
    }

    return Material(
      color: offline ? AppColors.error.withValues(alpha: 0.15) : AppColors.primaryBlue.withValues(alpha: 0.12),
      child: InkWell(
        onTap: syncing
            ? null
            : () => ref.read(syncServiceProvider).syncNow(full: offline),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          child: Row(
            children: [
              Icon(
                offline ? Icons.cloud_off : (syncing ? Icons.sync : Icons.cloud_done_outlined),
                size: 18,
                color: offline ? AppColors.error : AppColors.cyan,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  message,
                  style: TextStyle(
                    fontSize: 13,
                    color: offline ? AppColors.error : AppColors.slate300,
                  ),
                ),
              ),
              if (!syncing && !offline)
                Text(
                  'Tap to sync',
                  style: TextStyle(fontSize: 11, color: AppColors.slate400.withValues(alpha: 0.9)),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
