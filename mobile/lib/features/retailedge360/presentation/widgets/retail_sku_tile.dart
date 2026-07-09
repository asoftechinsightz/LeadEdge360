import 'package:flutter/material.dart';

import '../../../../core/locale/l10n_context.dart';
import '../../../../core/locale/retail_l10n_helpers.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../shared/widgets/glass_card.dart';
import '../../domain/models/retail_models.dart';
import 'retail_risk_badge.dart';

class RetailSkuTile extends StatelessWidget {
  const RetailSkuTile({
    super.key,
    required this.sku,
    this.onTap,
    this.onRepredict,
    this.onDelete,
  });

  final RetailSku sku;
  final VoidCallback? onTap;
  final VoidCallback? onRepredict;
  final VoidCallback? onDelete;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return GlassCard(
      padding: const EdgeInsets.all(14),
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(sku.name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
                    Text(
                      '${sku.sku} · ${sku.store}',
                      style: const TextStyle(color: AppColors.slate400, fontSize: 12),
                    ),
                  ],
                ),
              ),
              RetailRiskBadge(risk: sku.risk),
            ],
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 12,
            runSpacing: 6,
            children: [
              _Meta(icon: Icons.inventory_2_outlined, label: l10n.stockMeta(sku.stock)),
              _Meta(icon: Icons.currency_rupee, label: formatRetailCurrency(sku.price)),
              if (sku.predictedShelfDays != null)
                _Meta(icon: Icons.schedule, label: l10n.shelfMeta(sku.predictedShelfDays!)),
            ],
          ),
          if (onRepredict != null || onDelete != null) ...[
            const SizedBox(height: 10),
            Row(
              children: [
                if (onRepredict != null)
                  TextButton.icon(
                    onPressed: onRepredict,
                    icon: const Icon(Icons.refresh, size: 16),
                    label: Text(l10n.repredict),
                  ),
                if (onDelete != null)
                  TextButton.icon(
                    onPressed: onDelete,
                    icon: const Icon(Icons.delete_outline, size: 16, color: AppColors.error),
                    label: Text(l10n.removeAction, style: const TextStyle(color: AppColors.error)),
                  ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

class _Meta extends StatelessWidget {
  const _Meta({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: AppColors.slate500),
        const SizedBox(width: 4),
        Text(label, style: const TextStyle(color: AppColors.slate300, fontSize: 12)),
      ],
    );
  }
}
