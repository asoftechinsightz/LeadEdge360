import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/sync/sync_providers.dart';
import '../../data/leads_repository.dart';
import '../../domain/models/lead_models.dart';

class LeadsListState {
  const LeadsListState({
    this.items = const [],
    this.page = 1,
    this.total = 0,
    this.isLoading = false,
    this.isLoadingMore = false,
    this.hasMore = false,
    this.error,
    this.query = const LeadsQuery(),
  });

  final List<Lead> items;
  final int page;
  final int total;
  final bool isLoading;
  final bool isLoadingMore;
  final bool hasMore;
  final String? error;
  final LeadsQuery query;

  LeadsListState copyWith({
    List<Lead>? items,
    int? page,
    int? total,
    bool? isLoading,
    bool? isLoadingMore,
    bool? hasMore,
    String? error,
    LeadsQuery? query,
    bool clearError = false,
  }) =>
      LeadsListState(
        items: items ?? this.items,
        page: page ?? this.page,
        total: total ?? this.total,
        isLoading: isLoading ?? this.isLoading,
        isLoadingMore: isLoadingMore ?? this.isLoadingMore,
        hasMore: hasMore ?? this.hasMore,
        error: clearError ? null : (error ?? this.error),
        query: query ?? this.query,
      );
}

class LeadsListNotifier extends StateNotifier<LeadsListState> {
  LeadsListNotifier(this._repo, this._ref) : super(const LeadsListState());

  final LeadsRepository _repo;
  final Ref _ref;

  Future<void> load({LeadsQuery? query, bool refresh = false}) async {
    final q = query ?? state.query;

    if (refresh) {
      await _ref.read(syncServiceProvider).syncNow();
    }

    state = state.copyWith(
      isLoading: true,
      clearError: true,
      query: q.copyWith(page: 1),
      items: refresh ? [] : state.items,
    );

    try {
      final page = await _repo.fetchLeads(q.copyWith(page: 1));
      state = state.copyWith(
        items: page.items,
        page: page.page,
        total: page.total,
        hasMore: page.hasMore,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> loadMore() async {
    if (state.isLoadingMore || !state.hasMore) return;
    state = state.copyWith(isLoadingMore: true, clearError: true);
    try {
      final nextPage = state.page + 1;
      final page = await _repo.fetchLeads(state.query.copyWith(page: nextPage));
      state = state.copyWith(
        items: [...state.items, ...page.items],
        page: page.page,
        hasMore: page.hasMore,
        isLoadingMore: false,
      );
    } catch (e) {
      state = state.copyWith(isLoadingMore: false, error: e.toString());
    }
  }

  void setSearch(String search) {
    load(query: state.query.copyWith(search: search, page: 1), refresh: true);
  }

  void setStatusFilter(String status) {
    load(query: state.query.copyWith(status: status, page: 1), refresh: true);
  }

  void setLabelFilter(String label) {
    load(query: state.query.copyWith(label: label, page: 1), refresh: true);
  }
}

final leadsListProvider =
    StateNotifierProvider<LeadsListNotifier, LeadsListState>((ref) {
  return LeadsListNotifier(ref.watch(leadsRepositoryProvider), ref);
});

final leadDetailProvider =
    FutureProvider.family<LeadDetailBundle, String>((ref, leadId) async {
  return ref.watch(leadsRepositoryProvider).fetchLeadDetail(leadId);
});

final pipelineProvider = FutureProvider<List<PipelineItem>>((ref) async {
  return ref.watch(leadsRepositoryProvider).fetchPipeline();
});
