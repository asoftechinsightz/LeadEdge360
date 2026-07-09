import 'package:flutter/material.dart';

import '../../../../core/locale/l10n_context.dart';
import '../../../../core/theme/app_colors.dart';
import '../../domain/models/retail_models.dart';

/// AI-powered Business Health card. Computes a health score, a daily summary,
/// and natural-language recommendations from live data — AI woven into the
/// home screen rather than a separate "assistant" tab.
class AiInsightCard extends StatelessWidget {
  const AiInsightCard({
    super.key,
    required this.kpis,
    required this.inventory,
    required this.todaySales,
    this.expiring7Days = 0,
    this.expiredCount = 0,
  });

  final RetailKpis kpis;
  final List<RetailSku> inventory;
  final double todaySales;
  final int expiring7Days;
  final int expiredCount;

  int get _healthScore {
    if (kpis.total == 0) return 100;
    var score = 100.0;
    score -= (kpis.highRisk / kpis.total) * 40;
    if (kpis.inventoryValue > 0) {
      score -= (kpis.atRiskValue / kpis.inventoryValue) * 30;
    }
    score -= (expiring7Days * 3).clamp(0, 20);
    score -= (expiredCount * 2).clamp(0, 10);
    return score.clamp(0, 100).round();
  }

  Color get _scoreColor {
    final s = _healthScore;
    if (s >= 80) return AppColors.statusHealthy;
    if (s >= 60) return AppColors.statusCaution;
    if (s >= 40) return AppColors.statusWarning;
    return AppColors.statusCritical;
  }

  List<String> _recommendations(BuildContext context) {
    final l10n = context.l10n;
    final recos = <String>[];

    if (expiring7Days > 0) {
      recos.add('⚠  ${l10n.aiRecoExpiring(expiring7Days)}');
    }

    final highRisk = inventory.where((s) => s.risk == 'High').toList();
    if (highRisk.isNotEmpty) {
      recos.add('🔁  ${l10n.aiRecoReorder(highRisk.first.name)}');
    }

    final slow = inventory.where((s) => s.stock > 0).toList()
      ..sort((a, b) => b.daysOnShelf.compareTo(a.daysOnShelf));
    if (slow.isNotEmpty && slow.first.daysOnShelf >= 20) {
      recos.add('🐌  ${l10n.aiRecoSlow(slow.first.name)}');
    }

    if (recos.isEmpty) recos.add('✅  ${l10n.aiRecoHealthy}');
    return recos.take(3).toList();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final score = _healthScore;
    final color = _scoreColor;
    final band = score >= 80
        ? l10n.aiHealthy
        : score >= 60
            ? l10n.aiGood
            : score >= 40
                ? l10n.aiNeedsAttention
                : l10n.aiCritical;

    return Container(
      decoration: BoxDecoration(
        gradient: AppColors.aiGradient,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: AppColors.primaryBlue.withValues(alpha: 0.28),
            blurRadius: 24,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(7),
                decoration: BoxDecoration(
                  color: AppColors.white.withValues(alpha: 0.18),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.auto_awesome, color: AppColors.white, size: 18),
              ),
              const SizedBox(width: 10),
              Text(
                l10n.aiHealthScore,
                style: const TextStyle(color: AppColors.white, fontWeight: FontWeight.w700, fontSize: 15),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Score dial
              SizedBox(
                height: 78,
                width: 78,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    SizedBox(
                      height: 78,
                      width: 78,
                      child: CircularProgressIndicator(
                        value: score / 100,
                        strokeWidth: 7,
                        backgroundColor: AppColors.white.withValues(alpha: 0.18),
                        valueColor: AlwaysStoppedAnimation(color),
                      ),
                    ),
                    Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text('$score',
                            style: const TextStyle(color: AppColors.white, fontSize: 24, fontWeight: FontWeight.w800)),
                        Text(band,
                            style: TextStyle(color: color, fontSize: 9.5, fontWeight: FontWeight.w700)),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 18),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _summaryRow(l10n.todaySales, formatRetailCurrency(todaySales)),
                    const SizedBox(height: 8),
                    _summaryRow(l10n.totalSkus, '${kpis.total}'),
                    const SizedBox(height: 8),
                    _summaryRow(l10n.kpiAtRiskValue, formatRetailCurrency(kpis.atRiskValue)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Divider(color: Color(0x33FFFFFF), height: 1),
          const SizedBox(height: 14),
          Text(
            l10n.aiRecommendations,
            style: TextStyle(color: AppColors.white.withValues(alpha: 0.7), fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 0.4),
          ),
          const SizedBox(height: 8),
          ..._recommendations(context).map(
            (r) => Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Text(
                r,
                style: const TextStyle(color: AppColors.white, fontSize: 12.5, height: 1.3),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _summaryRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Flexible(
          child: Text(label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(color: AppColors.white.withValues(alpha: 0.75), fontSize: 12)),
        ),
        const SizedBox(width: 8),
        Text(value, style: const TextStyle(color: AppColors.white, fontSize: 13, fontWeight: FontWeight.w700)),
      ],
    );
  }
}
