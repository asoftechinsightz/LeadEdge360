import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/retail_repository.dart';
import '../../../../core/sync/retail_offline_providers.dart';
import '../../domain/models/retail_models.dart';

final retailKpisProvider = FutureProvider<RetailKpis>((ref) async {
  return ref.watch(retailRepositoryProvider).fetchKpis();
});

final retailInventoryProvider = FutureProvider<List<RetailSku>>((ref) async {
  final items = await ref.watch(retailRepositoryProvider).fetchInventory();
  await ref.read(retailSkuCacheProvider).saveAll(items);
  return items;
});

final retailStoresProvider = FutureProvider<List<RetailStore>>((ref) async {
  return ref.watch(retailRepositoryProvider).fetchStores();
});

final retailSalesProvider = FutureProvider<List<RetailSale>>((ref) async {
  return ref.watch(retailRepositoryProvider).fetchSales();
});

class RetailInventoryState {
  const RetailInventoryState({
    this.items = const [],
    this.search = '',
    this.isLoading = false,
    this.error,
  });

  final List<RetailSku> items;
  final String search;
  final bool isLoading;
  final String? error;

  List<RetailSku> get filtered {
    final q = search.trim().toLowerCase();
    if (q.isEmpty) return items;
    return items
        .where(
          (s) =>
              s.name.toLowerCase().contains(q) ||
              s.sku.toLowerCase().contains(q) ||
              s.store.toLowerCase().contains(q),
        )
        .toList();
  }

  RetailInventoryState copyWith({
    List<RetailSku>? items,
    String? search,
    bool? isLoading,
    String? error,
    bool clearError = false,
  }) =>
      RetailInventoryState(
        items: items ?? this.items,
        search: search ?? this.search,
        isLoading: isLoading ?? this.isLoading,
        error: clearError ? null : (error ?? this.error),
      );
}

class RetailInventoryNotifier extends StateNotifier<RetailInventoryState> {
  RetailInventoryNotifier(this._repo) : super(const RetailInventoryState());

  final RetailRepository _repo;

  Future<void> load({bool refresh = false}) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final items = await _repo.fetchInventory();
      state = state.copyWith(items: items, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  void setSearch(String value) {
    state = state.copyWith(search: value);
  }

  Future<RetailSku?> createSku({
    required String name,
    required String sku,
    String category = 'other',
    double price = 0,
    int stock = 0,
    int daysOnShelf = 0,
    String store = 'Default Store',
  }) async {
    try {
      final created = await _repo.createSku(
        name: name,
        sku: sku,
        category: category,
        price: price,
        stock: stock,
        daysOnShelf: daysOnShelf,
        store: store,
      );
      await load();
      return created;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return null;
    }
  }

  Future<RetailSku?> repredict(String id) async {
    try {
      final updated = await _repo.repredict(id);
      final items = state.items.map((s) => s.id == id ? updated : s).toList();
      state = state.copyWith(items: items, clearError: true);
      return updated;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return null;
    }
  }

  Future<bool> deleteSku(String id) async {
    try {
      await _repo.deleteSku(id);
      await load();
      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }
}

final retailInventoryListProvider =
    StateNotifierProvider<RetailInventoryNotifier, RetailInventoryState>((ref) {
  return RetailInventoryNotifier(ref.watch(retailRepositoryProvider));
});
