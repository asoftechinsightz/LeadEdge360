import 'package:flutter/material.dart';

import '../../../../core/locale/l10n_context.dart';
import '../../../../core/locale/retail_l10n_helpers.dart';
import '../../../../core/theme/app_colors.dart';
import '../../domain/models/retail_models.dart';

class RetailCategoryChart extends StatelessWidget {
  const RetailCategoryChart({
    super.key,
    required this.items,
    required this.categoryLabel,
  });

  final List<RetailSku> items;
  final String Function(String) categoryLabel;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final totals = <String, double>{};
    for (final sku in items) {
      totals[sku.category] = (totals[sku.category] ?? 0) + sku.inventoryValue;
    }
    if (totals.isEmpty) return const SizedBox.shrink();
    final max = totals.values.fold<double>(0, (a, b) => a > b ? a : b);
    final entries = totals.entries.toList()..sort((a, b) => b.value.compareTo(a.value));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(l10n.inventoryByCategory, style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 10),
        ...entries.take(6).map((e) {
          final fraction = max > 0 ? e.value / max : 0.0;
          return Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(child: Text(categoryLabel(e.key))),
                    Text(formatRetailCurrency(e.value), style: const TextStyle(fontSize: 12)),
                  ],
                ),
                const SizedBox(height: 4),
                LinearProgressIndicator(
                  value: fraction,
                  minHeight: 8,
                  color: AppColors.retailOrange,
                  borderRadius: BorderRadius.circular(4),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }
}

class RetailRiskChart extends StatelessWidget {
  const RetailRiskChart({
    super.key,
    required this.items,
    required this.riskLabel,
  });

  final List<RetailSku> items;
  final String Function(String) riskLabel;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final counts = <String, int>{'High': 0, 'Medium': 0, 'Low': 0};
    for (final sku in items) {
      final key = counts.containsKey(sku.risk) ? sku.risk : 'Medium';
      counts[key] = (counts[key] ?? 0) + 1;
    }
    final total = counts.values.fold<int>(0, (a, b) => a + b);
    if (total == 0) return const SizedBox.shrink();

    final colors = {
      'High': AppColors.error,
      'Medium': AppColors.retailOrange,
      'Low': AppColors.leadedgeGreen,
    };

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(l10n.riskDistribution, style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 10),
        ...counts.entries.map((e) {
          final fraction = total > 0 ? e.value / total : 0.0;
          return Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(
              children: [
                SizedBox(width: 64, child: Text(riskLabel(e.key))),
                Expanded(
                  child: LinearProgressIndicator(
                    value: fraction,
                    minHeight: 10,
                    color: colors[e.key] ?? AppColors.primaryBlue,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
                const SizedBox(width: 8),
                Text('${e.value}'),
              ],
            ),
          );
        }),
      ],
    );
  }
}

void showRetailSkuDetail(BuildContext context, RetailSku sku) {
  final l10n = context.l10n;
  final retailL10n = RetailL10n(l10n);

  showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    builder: (ctx) => SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(sku.name, style: Theme.of(ctx).textTheme.titleLarge),
            Text('SKU ${sku.sku}', style: const TextStyle(color: AppColors.slate500)),
            const SizedBox(height: 16),
            _detailRow(l10n.detailCategory, retailL10n.categoryLabel(sku.category)),
            _detailRow(l10n.detailStore, sku.store.isEmpty ? '—' : sku.store),
            _detailRow(l10n.detailStock, '${sku.stock}'),
            _detailRow(l10n.detailPrice, formatRetailCurrency(sku.price)),
            _detailRow(l10n.detailValue, formatRetailCurrency(sku.inventoryValue)),
            _detailRow(l10n.detailRisk, retailL10n.riskLabel(sku.risk)),
            if (sku.predictedShelfDays != null)
              _detailRow(l10n.detailPredictedShelf, l10n.daysUnit(sku.predictedShelfDays!)),
            if (sku.recommendation.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text(l10n.revenueShield, style: Theme.of(ctx).textTheme.titleSmall),
              Text(sku.recommendation),
            ],
          ],
        ),
      ),
    ),
  );
}

Widget _detailRow(String label, String value) {
  return Padding(
    padding: const EdgeInsets.symmetric(vertical: 4),
    child: Row(
      children: [
        SizedBox(width: 110, child: Text(label, style: const TextStyle(color: AppColors.slate500))),
        Expanded(child: Text(value)),
      ],
    ),
  );
}
