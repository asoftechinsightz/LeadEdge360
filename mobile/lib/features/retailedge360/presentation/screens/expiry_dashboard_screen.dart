import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/locale/l10n_context.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../shared/widgets/api_error_state.dart';
import '../../../../shared/widgets/glass_card.dart';
import '../../domain/models/expiry_models.dart';
import '../providers/expiry_providers.dart';
import '../widgets/expiry_widgets.dart';
import '../../domain/models/retail_models.dart';

class ExpiryDashboardScreen extends ConsumerWidget {
  const ExpiryDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = context.l10n;
    final async = ref.watch(expiryDashboardProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.expiryTitle),
        actions: [
          IconButton(
            tooltip: l10n.refresh,
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.invalidate(expiryDashboardProvider),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(expiryDashboardProvider);
          await ref.read(expiryDashboardProvider.future);
        },
        child: async.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            children: [
              const SizedBox(height: 48),
              ApiErrorState(
                error: e,
                title: l10n.expiryTitle,
                onRetry: () => ref.invalidate(expiryDashboardProvider),
                onSignIn: () => context.go('/login'),
              ),
            ],
          ),
          data: (data) => _Body(data: data),
        ),
      ),
    );
  }
}

class _Body extends StatelessWidget {
  const _Body({required this.data});

  final ExpiryDashboard data;

  String _statusLabel(BuildContext context, ExpiryItem item) {
    final l10n = context.l10n;
    final d = item.daysRemaining;
    if (d == null) return '—';
    if (d < 0) return l10n.expiryExpiredAgo(d.abs());
    if (d == 0) return l10n.expiryToday;
    return l10n.expiryDaysLeft(d);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final k = data.kpis;

    return ListView(
      padding: const EdgeInsets.all(16),
      physics: const AlwaysScrollableScrollPhysics(),
      children: [
        // Status KPI grid (red → green scale)
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 1.55,
          children: [
            _StatusKpi(count: k.expiringToday, label: l10n.expiryTodayLabel, color: AppColors.statusCritical, icon: Icons.warning_amber_rounded),
            _StatusKpi(count: k.expiring7Days, label: l10n.expiry7Days, color: AppColors.statusWarning, icon: Icons.schedule),
            _StatusKpi(count: k.expiring30Days, label: l10n.expiry30Days, color: AppColors.statusCaution, icon: Icons.event_note),
            _StatusKpi(count: k.totalExpired, label: l10n.expiryExpired, color: AppColors.slate500, icon: Icons.block),
          ],
        ),
        const SizedBox(height: 14),
        // Financial / operational strip
        GlassCard(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              _MiniStat(label: l10n.expiryEstLoss, value: formatRetailCurrency(k.estimatedExpiryLoss), color: AppColors.error),
              _divider(),
              _MiniStat(label: l10n.expiryActiveBatches, value: '${k.activeBatches}', color: AppColors.primaryBlue),
              _divider(),
              _MiniStat(label: l10n.expiryReturnsPending, value: '${k.returnPending}', color: AppColors.retailOrange),
            ],
          ),
        ),
        const SizedBox(height: 24),

        // Critical alerts
        Row(
          children: [
            const Text('🔴', style: TextStyle(fontSize: 16)),
            const SizedBox(width: 6),
            Text(l10n.expiryCritical, style: Theme.of(context).textTheme.titleLarge),
          ],
        ),
        const SizedBox(height: 12),
        if (data.criticalAlerts.isEmpty)
          GlassCard(child: Text(l10n.expiryNoCritical, style: const TextStyle(color: AppColors.slate400)))
        else
          ...data.criticalAlerts.map(
            (a) => ExpiryItemTile(
              item: a,
              statusLabel: _statusLabel(context, a),
              batchPrefix: l10n.expiryBatch,
              qtyLabel: l10n.expiryQty,
            ),
          ),

        const SizedBox(height: 24),

        // Top expiring products (FEFO priority)
        Text(l10n.expiryTopExpiring, style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 4),
        Text(l10n.expiryFefoHint, style: const TextStyle(color: AppColors.slate500, fontSize: 12)),
        const SizedBox(height: 12),
        if (data.topExpiring.isEmpty)
          GlassCard(child: Text(l10n.expiryNoData, style: const TextStyle(color: AppColors.slate400)))
        else
          ...data.topExpiring.map(
            (item) => ExpiryItemTile(
              item: item,
              statusLabel: _statusLabel(context, item),
              batchPrefix: l10n.expiryBatch,
              qtyLabel: l10n.expiryQty,
            ),
          ),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _divider() => Container(width: 1, height: 34, color: AppColors.borderLight);
}

class _StatusKpi extends StatelessWidget {
  const _StatusKpi({required this.count, required this.label, required this.color, required this.icon});

  final int count;
  final String label;
  final Color color;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.10),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Icon(icon, color: color, size: 22),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('$count', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: color)),
              Text(label, style: const TextStyle(fontSize: 11.5, color: AppColors.slate500, fontWeight: FontWeight.w600)),
            ],
          ),
        ],
      ),
    );
  }
}

class _MiniStat extends StatelessWidget {
  const _MiniStat({required this.label, required this.value, required this.color});

  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Text(value, style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: color)),
          const SizedBox(height: 2),
          Text(label, textAlign: TextAlign.center, style: const TextStyle(fontSize: 10.5, color: AppColors.slate500)),
        ],
      ),
    );
  }
}
