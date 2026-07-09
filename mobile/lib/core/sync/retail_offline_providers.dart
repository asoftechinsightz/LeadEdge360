import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/retailedge360/data/retail_repository.dart';
import '../../features/retailedge360/presentation/providers/retail_providers.dart';
import 'connectivity_service.dart';
import 'retail_offline_queue.dart';
import 'retail_sku_cache.dart';

final retailOfflineQueueProvider = Provider<RetailOfflineQueue>((ref) => RetailOfflineQueue());

final retailSkuCacheProvider = Provider<RetailSkuCache>((ref) => RetailSkuCache());

final retailOfflinePendingProvider = StateProvider<int>((ref) {
  return ref.read(retailOfflineQueueProvider).getPendingCount();
});

/// Replays queued retail checkouts when connectivity returns.
class RetailOfflineSyncService {
  RetailOfflineSyncService({
    required RetailOfflineQueue queue,
    required RetailRepository repo,
    required ConnectivityService connectivity,
    required void Function(int pending, int synced) onUpdate,
  })  : _queue = queue,
        _repo = repo,
        _connectivity = connectivity,
        _onUpdate = onUpdate;

  final RetailOfflineQueue _queue;
  final RetailRepository _repo;
  final ConnectivityService _connectivity;
  final void Function(int pending, int synced) _onUpdate;
  var _started = false;

  Future<void> start() async {
    if (_started) return;
    _started = true;

    _onUpdate(_queue.getPendingCount(), 0);

    _connectivity.listen((online) async {
      if (online) {
        await replay();
      } else {
        _onUpdate(_queue.getPendingCount(), 0);
      }
    });

    if (await _connectivity.isOnline) {
      await replay();
    }
  }

  void stop() {
    _started = false;
  }

  Future<int> replay() async {
    final synced = await _queue.replay(_repo);
    _onUpdate(_queue.getPendingCount(), synced);
    return synced;
  }
}

final retailOfflineSyncServiceProvider = Provider<RetailOfflineSyncService>((ref) {
  return RetailOfflineSyncService(
    queue: ref.watch(retailOfflineQueueProvider),
    repo: ref.watch(retailRepositoryProvider),
    connectivity: ref.watch(connectivityServiceProvider),
    onUpdate: (pending, synced) {
      ref.read(retailOfflinePendingProvider.notifier).state = pending;
      if (synced > 0) {
        ref.invalidate(retailKpisProvider);
        ref.invalidate(retailInventoryProvider);
        ref.invalidate(retailSalesProvider);
      }
    },
  );
});
