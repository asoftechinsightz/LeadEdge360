import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../shared/widgets/api_error_state.dart';
import '../../../../shared/widgets/empty_state.dart';
import '../../../../shared/widgets/glass_card.dart';

typedef CrmListItemBuilder<T> = Widget Function(BuildContext context, T item);

class CrmAsyncListBody<T> extends StatelessWidget {
  const CrmAsyncListBody({
    super.key,
    required this.asyncValue,
    required this.itemBuilder,
    required this.onRefresh,
    this.emptyTitle = 'Nothing here yet',
    this.emptySubtitle,
    this.searchField,
  });

  final AsyncValue<List<T>> asyncValue;
  final CrmListItemBuilder<T> itemBuilder;
  final Future<void> Function() onRefresh;
  final String emptyTitle;
  final String? emptySubtitle;
  final Widget? searchField;

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: onRefresh,
      child: asyncValue.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          children: [
            ApiErrorState(error: e, onRetry: onRefresh),
          ],
        ),
        data: (items) {
          if (items.isEmpty) {
            return ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(24),
              children: [
                if (searchField != null) ...[searchField!, const SizedBox(height: 12)],
                EmptyState(
                  icon: Icons.inbox_outlined,
                  title: emptyTitle,
                  subtitle: emptySubtitle,
                ),
              ],
            );
          }
          return ListView.separated(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
            itemCount: items.length + (searchField != null ? 1 : 0),
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (context, index) {
              if (searchField != null && index == 0) return searchField!;
              final itemIndex = searchField != null ? index - 1 : index;
              return itemBuilder(context, items[itemIndex]);
            },
          );
        },
      ),
    );
  }
}

class CrmMetricGrid extends StatelessWidget {
  const CrmMetricGrid({super.key, required this.metrics});

  final List<MapEntry<String, String>> metrics;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 10,
      runSpacing: 10,
      children: metrics
          .map(
            (m) => SizedBox(
              width: (MediaQuery.sizeOf(context).width - 42) / 2,
              child: GlassCard(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(m.value, style: Theme.of(context).textTheme.headlineSmall),
                    Text(m.key, style: Theme.of(context).textTheme.bodySmall),
                  ],
                ),
              ),
            ),
          )
          .toList(),
    );
  }
}

class CrmDashboardBody extends StatelessWidget {
  const CrmDashboardBody({
    super.key,
    required this.asyncValue,
    required this.onRefresh,
    required this.buildContent,
    this.title,
  });

  final AsyncValue<Map<String, dynamic>> asyncValue;
  final Future<void> Function() onRefresh;
  final Widget Function(Map<String, dynamic> data) buildContent;
  final String? title;

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: onRefresh,
      child: asyncValue.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          children: [ApiErrorState(error: e, onRetry: onRefresh)],
        ),
        data: (data) => ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          children: [
            if (title != null) ...[
              Text(title!, style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 16),
            ],
            buildContent(data),
          ],
        ),
      ),
    );
  }
}

String formatCurrency(num? value) {
  if (value == null) return '—';
  if (value >= 100000) return '₹${(value / 100000).toStringAsFixed(1)}L';
  if (value >= 1000) return '₹${(value / 1000).toStringAsFixed(1)}K';
  return '₹${value.toStringAsFixed(0)}';
}
