import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../domain/models/expiry_models.dart';

/// Maps days-remaining to the red→green status scale.
Color expiryStatusColor(int? days) {
  if (days == null) return AppColors.slate400;
  if (days < 0) return AppColors.statusCritical;
  if (days <= 7) return AppColors.statusWarning;
  if (days <= 30) return AppColors.statusCaution;
  return AppColors.statusHealthy;
}

String expiryStatusEmoji(int? days) {
  if (days == null) return '⚪';
  if (days <= 7) return '🔴';
  if (days <= 30) return '🟠';
  return '🟢';
}

/// Small colored pill showing remaining shelf-life.
class ExpiryStatusPill extends StatelessWidget {
  const ExpiryStatusPill({super.key, required this.days, required this.label});

  final int? days;
  final String label;

  @override
  Widget build(BuildContext context) {
    final color = expiryStatusColor(days);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.14),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: color.withValues(alpha: 0.4)),
      ),
      child: Text(
        label,
        style: TextStyle(color: color, fontSize: 11.5, fontWeight: FontWeight.w700),
      ),
    );
  }
}

/// A row representing a near-expiry product/batch.
class ExpiryItemTile extends StatelessWidget {
  const ExpiryItemTile({
    super.key,
    required this.item,
    required this.statusLabel,
    this.batchPrefix = 'Batch',
    this.qtyLabel = 'Qty',
  });

  final ExpiryItem item;

  /// Localized status label (e.g. "3 days left" or "Expired 2d ago").
  final String statusLabel;
  final String batchPrefix;
  final String qtyLabel;

  @override
  Widget build(BuildContext context) {
    final color = expiryStatusColor(item.daysRemaining);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: isDark ? AppColors.white.withValues(alpha: 0.04) : AppColors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isDark ? AppColors.white.withValues(alpha: 0.08) : AppColors.borderLight,
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 4,
            height: 40,
            decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(4)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.productName,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                ),
                const SizedBox(height: 2),
                Text(
                  [
                    if (item.batchNumber.isNotEmpty) '$batchPrefix ${item.batchNumber}',
                    '$qtyLabel ${item.quantity}',
                  ].join('  ·  '),
                  style: const TextStyle(color: AppColors.slate500, fontSize: 11.5),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          ExpiryStatusPill(days: item.daysRemaining, label: statusLabel),
        ],
      ),
    );
  }
}
