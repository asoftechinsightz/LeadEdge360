import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/locale/l10n_context.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../shared/widgets/glass_card.dart';
import '../../domain/models/quick_action.dart';
import '../../domain/models/retail_models.dart';
import '../providers/retail_providers.dart';
import '../providers/expiry_providers.dart';
import '../widgets/ai_insight_card.dart';
import '../widgets/quick_action_card.dart';
import '../widgets/retail_offline_banner.dart';
import 'retail_inventory_screen.dart';

/// RetailEdge360 super-app home: AI health card, expiry alert strip, and
/// colorful Quick Action tiles inspired by leading Indian business apps.
class RetailHomeScreen extends ConsumerWidget {
  const RetailHomeScreen({
    super.key,
    this.onOpenSales,
    this.onOpenInventory,
    this.onOpenAnalytics,
  });

  final VoidCallback? onOpenSales;
  final VoidCallback? onOpenInventory;
  final VoidCallback? onOpenAnalytics;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = context.l10n;
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
    final expiry = ref.watch(expiryDashboardProvider);
    final expiring7 = expiry.maybeWhen(data: (d) => d.kpis.expiring7Days, orElse: () => 0);
    final expiringToday = expiry.maybeWhen(data: (d) => d.kpis.expiringToday, orElse: () => 0);
    final expired = expiry.maybeWhen(data: (d) => d.kpis.totalExpired, orElse: () => 0);

    final kpis = kpisAsync.maybeWhen(data: (k) => k, orElse: () => const RetailKpis());

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(retailKpisProvider);
        ref.invalidate(retailInventoryProvider);
        ref.invalidate(retailSalesProvider);
        ref.invalidate(expiryDashboardProvider);
        await ref.read(retailKpisProvider.future);
      },
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 96),
        physics: const AlwaysScrollableScrollPhysics(),
        children: [
          const RetailOfflineBanner(),

          // Natural-language AI search
          _AiSearchBar(
            hint: l10n.aiSearchHint,
            onTap: () => _showAiSearchSheet(
              context,
              onExpiry: () => context.push('/retail/expiry'),
              onInventory: onOpenInventory,
              onSales: onOpenSales,
            ),
          ),
          const SizedBox(height: 16),

          // AI Business Health
          AiInsightCard(
            kpis: kpis,
            inventory: inventory,
            todaySales: todaySales,
            expiring7Days: expiring7,
            expiredCount: expired,
          ),
          const SizedBox(height: 16),

          // Expiry alert strip (flagship module entry point)
          _ExpiryStrip(
            today: expiringToday,
            in7: expiring7,
            expired: expired,
            onTap: () => context.push('/retail/expiry'),
          ),
          const SizedBox(height: 22),

          // Primary Quick Actions (big gradient cards)
          Text(l10n.quickActions, style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 12),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.35,
            children: [
              QuickActionCard(
                action: QuickAction(
                  id: 'new_bill',
                  label: l10n.qaNewBill,
                  subtitle: l10n.qaNewBillSub,
                  icon: Icons.receipt_long,
                  gradient: AppColors.gradBlue,
                  onTap: () => context.push('/retail/pos'),
                ),
              ),
              QuickActionCard(
                action: QuickAction(
                  id: 'scan',
                  label: l10n.qaScan,
                  subtitle: l10n.qaScanSub,
                  icon: Icons.qr_code_scanner,
                  gradient: AppColors.gradPurple,
                  onTap: () => context.push('/retail/pos'),
                ),
              ),
              QuickActionCard(
                action: QuickAction(
                  id: 'expiry',
                  label: l10n.qaExpiry,
                  subtitle: l10n.qaExpirySub,
                  icon: Icons.event_busy,
                  gradient: AppColors.gradRed,
                  badge: (expiringToday + expired) > 0 ? '${expiringToday + expired}' : null,
                  onTap: () => context.push('/retail/expiry'),
                ),
              ),
              QuickActionCard(
                action: QuickAction(
                  id: 'inventory',
                  label: l10n.qaInventory,
                  subtitle: l10n.qaInventorySub,
                  icon: Icons.inventory_2,
                  gradient: AppColors.gradGreen,
                  onTap: onOpenInventory,
                ),
              ),
              QuickActionCard(
                action: QuickAction(
                  id: 'sales',
                  label: l10n.qaSales,
                  subtitle: l10n.qaSalesSub,
                  icon: Icons.trending_up,
                  gradient: AppColors.gradTeal,
                  onTap: onOpenSales,
                ),
              ),
              QuickActionCard(
                action: QuickAction(
                  id: 'analytics',
                  label: l10n.qaAnalytics,
                  subtitle: l10n.qaAnalyticsSub,
                  icon: Icons.insights,
                  gradient: AppColors.gradIndigo,
                  onTap: onOpenAnalytics,
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // More modules grid
          Text(l10n.moreModules, style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 14),
          GridView.count(
            crossAxisCount: 4,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 8,
            mainAxisSpacing: 16,
            childAspectRatio: 0.78,
            children: _modules(context, ref, onOpenInventory).map((a) => ModuleGridTile(action: a)).toList(),
          ),
        ],
      ),
    );
  }

  List<QuickAction> _modules(BuildContext context, WidgetRef ref, VoidCallback? onOpenInventory) {
    final l10n = context.l10n;
    QuickAction soon(String id, String label, IconData icon, Gradient g) => QuickAction(
          id: id,
          label: label,
          icon: icon,
          gradient: g,
          onTap: () => showRetailComingSoon(context, label),
        );
    return [
      QuickAction(id: 'products', label: l10n.qaProducts, icon: Icons.category, gradient: AppColors.gradGreen, onTap: onOpenInventory),
      soon('customers', l10n.qaCustomers, Icons.people_alt, AppColors.gradBlue),
      soon('suppliers', l10n.qaSuppliers, Icons.local_shipping, AppColors.gradOrange),
      soon('purchases', l10n.qaPurchases, Icons.shopping_cart, AppColors.gradTeal),
      soon('orders', l10n.qaOrders, Icons.list_alt, AppColors.gradIndigo),
      soon('expenses', l10n.qaExpenses, Icons.account_balance_wallet, AppColors.gradPink),
      soon('credit', l10n.qaCredit, Icons.credit_score, AppColors.gradCyan),
      soon('loyalty', l10n.qaLoyalty, Icons.card_giftcard, AppColors.gradPurple),
      QuickAction(id: 'reports', label: l10n.qaReports, icon: Icons.summarize, gradient: AppColors.gradSlate, onTap: onOpenAnalytics),
      QuickAction(
        id: 'notifications',
        label: l10n.qaNotifications,
        icon: Icons.notifications,
        gradient: AppColors.gradOrange,
        onTap: () => context.push('/notifications'),
      ),
      QuickAction(
        id: 'settings',
        label: l10n.qaSettings,
        icon: Icons.settings,
        gradient: AppColors.gradSlate,
        onTap: () => context.push('/settings/security'),
      ),
      QuickAction(
        id: 'web',
        label: l10n.qaMore,
        icon: Icons.apps,
        gradient: AppColors.gradIndigo,
        onTap: () => context.push('/retail/web'),
      ),
    ];
  }
}

class _AiSearchBar extends StatelessWidget {
  const _AiSearchBar({required this.hint, required this.onTap});

  final String hint;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: isDark ? AppColors.white.withValues(alpha: 0.05) : AppColors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: isDark ? AppColors.white.withValues(alpha: 0.10) : AppColors.borderLight),
        ),
        child: Row(
          children: [
            const Icon(Icons.auto_awesome, color: AppColors.primaryBlue, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Text(hint, style: const TextStyle(color: AppColors.slate400, fontSize: 13.5)),
            ),
            const Icon(Icons.mic_none, color: AppColors.slate400, size: 20),
          ],
        ),
      ),
    );
  }
}

class _ExpiryStrip extends StatelessWidget {
  const _ExpiryStrip({required this.today, required this.in7, required this.expired, required this.onTap});

  final int today;
  final int in7;
  final int expired;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return GlassCard(
      onTap: onTap,
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.statusCritical.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.event_busy, color: AppColors.statusCritical),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(l10n.expiryTitle, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                const SizedBox(height: 6),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: [
                    _dot(AppColors.statusCritical, l10n.expiryTodayChip(today)),
                    _dot(AppColors.statusWarning, l10n.expiry7Chip(in7)),
                    _dot(AppColors.slate500, l10n.expiryExpiredChip(expired)),
                  ],
                ),
              ],
            ),
          ),
          const Icon(Icons.chevron_right, color: AppColors.slate400),
        ],
      ),
    );
  }

  Widget _dot(Color c, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
      decoration: BoxDecoration(
        color: c.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(label, style: TextStyle(color: c, fontSize: 11, fontWeight: FontWeight.w700)),
    );
  }
}

/// Bottom sheet with example natural-language queries.
void _showAiSearchSheet(
  BuildContext context, {
  VoidCallback? onExpiry,
  VoidCallback? onInventory,
  VoidCallback? onSales,
}) {
  final l10n = context.l10n;
  showModalBottomSheet<void>(
    context: context,
    showDragHandle: true,
    isScrollControlled: true,
    builder: (ctx) {
      final queries = <(String, VoidCallback?)>[
        (l10n.aiQueryReorder, onExpiry),
        (l10n.aiQuerySlow, onInventory),
        (l10n.aiQueryProfit, onSales),
        (l10n.aiQuerySummary, onSales),
        (l10n.aiQueryExpiring, onExpiry),
      ];
      return SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 4, 20, 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.auto_awesome, color: AppColors.primaryBlue),
                  const SizedBox(width: 10),
                  Text(l10n.aiAsk, style: Theme.of(ctx).textTheme.titleLarge),
                ],
              ),
              const SizedBox(height: 16),
              ...queries.map(
                (q) => ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.chat_bubble_outline, size: 20, color: AppColors.slate400),
                  title: Text(q.$1, style: const TextStyle(fontSize: 13.5)),
                  trailing: const Icon(Icons.arrow_outward, size: 16, color: AppColors.slate400),
                  onTap: () {
                    Navigator.of(ctx).pop();
                    q.$2?.call();
                  },
                ),
              ),
            ],
          ),
        ),
      );
    },
  );
}

/// Shared "coming soon" sheet for modules not yet built natively.
void showRetailComingSoon(BuildContext context, String title) {
  final l10n = context.l10n;
  showModalBottomSheet<void>(
    context: context,
    showDragHandle: true,
    builder: (ctx) => SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(24, 8, 24, 28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.primaryBlue.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.rocket_launch, color: AppColors.primaryBlue, size: 30),
            ),
            const SizedBox(height: 16),
            Text(title, style: Theme.of(ctx).textTheme.titleLarge, textAlign: TextAlign.center),
            const SizedBox(height: 8),
            Text(
              l10n.comingSoonBody,
              textAlign: TextAlign.center,
              style: const TextStyle(color: AppColors.slate500, fontSize: 13),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: () {
                  Navigator.of(ctx).pop();
                  context.push('/retail/web');
                },
                child: Text(l10n.openWebApp),
              ),
            ),
          ],
        ),
      ),
    ),
  );
}

/// FAB speed-dial sheet: quick create actions.
void showRetailQuickCreateSheet(BuildContext context, WidgetRef ref) {
  final l10n = context.l10n;
  showModalBottomSheet<void>(
    context: context,
    showDragHandle: true,
    builder: (ctx) => SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(12, 4, 12, 16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _QuickCreateTile(
              icon: Icons.receipt_long,
              color: AppColors.primaryBlue,
              label: l10n.qaNewBill,
              onTap: () {
                Navigator.of(ctx).pop();
                context.push('/retail/pos');
              },
            ),
            _QuickCreateTile(
              icon: Icons.qr_code_scanner,
              color: AppColors.retailOrange,
              label: l10n.qaScan,
              onTap: () {
                Navigator.of(ctx).pop();
                context.push('/retail/pos');
              },
            ),
            _QuickCreateTile(
              icon: Icons.add_box,
              color: AppColors.leadedgeGreen,
              label: l10n.addSku,
              onTap: () {
                Navigator.of(ctx).pop();
                showCreateRetailSkuSheet(context, ref);
              },
            ),
            _QuickCreateTile(
              icon: Icons.event_busy,
              color: AppColors.statusCritical,
              label: l10n.expiryTitle,
              onTap: () {
                Navigator.of(ctx).pop();
                context.push('/retail/expiry');
              },
            ),
          ],
        ),
      ),
    ),
  );
}

class _QuickCreateTile extends StatelessWidget {
  const _QuickCreateTile({required this.icon, required this.color, required this.label, required this.onTap});

  final IconData icon;
  final Color color;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(9),
        decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(12)),
        child: Icon(icon, color: color),
      ),
      title: Text(label, style: const TextStyle(fontWeight: FontWeight.w600)),
      trailing: const Icon(Icons.chevron_right, color: AppColors.slate400),
      onTap: onTap,
    );
  }
}
