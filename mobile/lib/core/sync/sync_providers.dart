import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/leadedge360/data/leads_repository.dart';
import 'cache_providers.dart';
import 'connectivity_service.dart';
import 'sync_repository.dart';
import 'sync_service.dart';

final syncStateProvider = StateProvider<SyncState>((ref) {
  return SyncState(
    lastSyncAt: ref.read(leadsCacheProvider).lastSyncAt(),
    pendingWrites: ref.read(offlineQueueProvider).pendingCount,
  );
});

final syncServiceProvider = Provider<SyncService>((ref) {
  return SyncService(
    syncRepo: ref.watch(syncRepositoryProvider),
    leadsRepo: ref.watch(leadsRepositoryProvider),
    cache: ref.watch(leadsCacheProvider),
    queue: ref.watch(offlineQueueProvider),
    connectivity: ref.watch(connectivityServiceProvider),
    onStateChanged: (state) {
      ref.read(syncStateProvider.notifier).state = state;
    },
  );
});
