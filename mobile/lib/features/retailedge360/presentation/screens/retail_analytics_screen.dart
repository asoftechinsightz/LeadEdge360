import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/locale/l10n_context.dart';
import '../../../../core/locale/retail_l10n_helpers.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../shared/widgets/api_error_state.dart';
import '../../../../shared/widgets/glass_card.dart';
import '../../domain/models/retail_models.dart';
import '../providers/retail_providers.dart';
import '../widgets/retail_analytics_charts.dart';

/// Business Analytics tab — revenue, inventory health and movers.
class RetailAnalyticsBody extends ConsumerWidget {
  const RetailAnalyticsBody({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = context.l10n;
    final retailL10n = RetailL10n(l10n);
    final kpisAsync = ref.watch(retailKpisProvider);
    final inventory = ref.watch(retailInventoryProvider).maybeWhen(
          data: (items) => items,
          orElse: () => const <RetailSku>[],
        );
    final today = DateTime.now().toIso8601String().substring(0, 10);
    final todaySales = ref.watch(retailSalesProvider).maybeWhen(
          data: (sales) => sales
              .where((s) => s.createdAt != null && s.createdAt!.startsWith(today))
              .fold<double>(0, (sum, s) => sum + s.totalAmount),
          orElse: () => 0.0,
        );

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(retailKpisProvider);
        ref.invalidate(retailInventoryProvider);
        ref.invalidate(retailSalesProvider);
        await ref.read(retailKpisProvider.future);
      },
      child: kpisAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          children: [
            const SizedBox(height: 48),
            ApiErrorState(
              error: e,
              title: l10n.qaAnalytics,
              onRetry: () => ref.invalidate(retailKpisProvider),
              onSignIn: () => context.go('/login'),
            ),
          ],
        ),
        data: (kpis) {
          final fastMovers = [...inventory]..sort((a, b) => a.daysOnShelf.compareTo(b.daysOnShelf));
          final slowMovers = [...inventory]..sort((a, b) => b.daysOnShelf.compareTo(a.daysOnShelf));

          return ListView(
            padding: const EdgeInsets.all(16),
            physics: const AlwaysScrollableScrollPhysics(),
            children: [
              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 1.7,
                children: [
                  _AnalyticTile(label: l10n.todaySales, value: formatRetailCurrency(todaySales), color: AppColors.leadedgeGreen, icon: Icons.today),
                  _AnalyticTile(label: l10n.kpiInventoryValue, value: formatRetailCurrency(kpis.inventoryValue), color: AppColors.primaryBlue, icon: Icons.inventory_2),
                  _AnalyticTile(label: l10n.kpiAtRiskValue, value: formatRetailCurrency(kpis.atRiskValue), color: AppColors.error, icon: Icons.warning_amber_rounded),
                  _AnalyticTile(label: l10n.kpiRevenueShielded, value: formatRetailCurrency(kpis.savedSoFar), color: AppColors.statusHealthy, icon: Icons.shield_moon),
                ],
              ),
              const SizedBox(height: 16),
              if (inventory.isNotEmpty) ...[
                GlassCard(
                  padding: const EdgeInsets.all(16),
                  child: RetailCategoryChart(items: inventory, categoryLabel: retailL10n.categoryLabel),
                ),
                const SizedBox(height: 12),
                GlassCard(
                  padding: const EdgeInsets.all(16),
                  child: RetailRiskChart(items: inventory, riskLabel: retailL10n.riskLabel),
                ),
                const SizedBox(height: 20),
                _MoverSection(title: l10n.fastMoving, items: fastMovers.take(3).toList(), color: AppColors.statusHealthy),
                const SizedBox(height: 12),
                _MoverSection(title: l10n.slowMoving, items: slowMovers.take(3).toList(), color: AppColors.retailOrange),
              ] else
                GlassCard(child: Text(l10n.emptyCatalogSubtitle, style: const TextStyle(color: AppColors.slate400))),
            ],
          );
        },
      ),
    );
  }
}

class _AnalyticTile extends StatelessWidget {
  const _AnalyticTile({required this.label, required this.value, required this.color, required this.icon});

  final String label;
  final String value;
  final Color color;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Icon(icon, color: color, size: 20),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: color)),
              Text(label, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 11, color: AppColors.slate500)),
            ],
          ),
        ],
      ),
    );
  }
}

class _MoverSection extends StatelessWidget {
  const _MoverSection({required this.title, required this.items, required this.color});

  final String title;
  final List<RetailSku> items;
  final Color color;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) return const SizedBox.shrink();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 8),
        ...items.map(
          (s) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: GlassCard(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              child: Row(
                children: [
                  CircleAvatar(radius: 5, backgroundColor: color),
                  const SizedBox(width: 12),
                  Expanded(child: Text(s.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w600))),
                  Text('${s.daysOnShelf}d', style: const TextStyle(color: AppColors.slate500, fontSize: 12)),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}
