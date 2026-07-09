import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../../core/notifications/notifications_providers.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../shared/brand/asoftech_logo.dart';
import '../../../../shared/brand/product_brand_title.dart';
import '../../../../shared/widgets/glass_card.dart';
import '../../../leadedge360/presentation/screens/leads_list_screen.dart';
import '../../../leadedge360/presentation/screens/pipeline_screen.dart';
import '../../../retailedge360/presentation/screens/retail_home_screen.dart';
import '../../../retailedge360/presentation/screens/retail_analytics_screen.dart';
import '../../../retailedge360/presentation/screens/retail_inventory_screen.dart';
import '../../../retailedge360/presentation/screens/retail_pos_screens.dart';
import '../../../crm/presentation/screens/crm_hub_screen.dart';
import '../../../../core/locale/l10n_context.dart';
import '../../../onboarding/data/onboarding_repository.dart';
import '../widgets/leadedge_executive_home.dart';
import '../../../settings/presentation/widgets/language_settings_tile.dart';

class HomeShellScreen extends ConsumerStatefulWidget {
  const HomeShellScreen({super.key, required this.product, this.initialTab = 0, this.initialAction});

  final String product;
  final int initialTab;

  /// Optional deep-link action e.g. 'pos' → open billing after load.
  final String? initialAction;

  @override
  ConsumerState<HomeShellScreen> createState() => _HomeShellScreenState();
}

class _HomeShellScreenState extends ConsumerState<HomeShellScreen> {
  late int _tab;

  @override
  void initState() {
    super.initState();
    _tab = widget.initialTab;
    if (widget.product == 'retailedge360') {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _guardRetailQuickSetup();
        if (widget.initialAction == 'pos' && mounted) {
          context.push('/retail/pos');
        }
      });
    }
  }

  Future<void> _guardRetailQuickSetup() async {
    final needs = await ref.read(onboardingRepositoryProvider).needsRetailQuickSetup();
    if (needs && mounted) {
      context.go('/onboarding/quick');
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final isLeadEdge = widget.product == 'leadedge360';
    final l10n = context.l10n;

    return Scaffold(
      appBar: _tab == 0 || !isLeadEdge
          ? AppBar(
              title: ProductBrandTitle(product: widget.product),
              actions: _appBarActions(context, user?.displayName, ref, isLeadEdge: isLeadEdge),
            )
          : null,
      body: IndexedStack(
        index: _tab,
        children: isLeadEdge
            ? [
                LeadEdgeExecutiveHome(
                  onOpenTab: (i) => setState(() => _tab = i),
                  onLeadTap: (id) => context.push('/leads/$id'),
                ),
                const LeadsListScreen(),
                const PipelineScreen(),
                const CrmHubScreen(),
                _ProfileTab(
                  email: user?.email ?? '',
                  name: user?.displayName ?? 'User',
                  onNotifications: () => context.push('/notifications'),
                ),
              ]
            : [
                RetailHomeScreen(
                  onOpenSales: () => setState(() => _tab = 1),
                  onOpenInventory: () => setState(() => _tab = 2),
                  onOpenAnalytics: () => setState(() => _tab = 3),
                ),
                const RetailSalesBody(),
                const RetailInventoryScreen(),
                const RetailAnalyticsBody(),
                _ProfileTab(
                  email: user?.email ?? '',
                  name: user?.displayName ?? 'User',
                  onNotifications: () => context.push('/notifications'),
                ),
              ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (i) => setState(() => _tab = i),
        destinations: isLeadEdge
            ? const [
                NavigationDestination(icon: Icon(Icons.dashboard_outlined), selectedIcon: Icon(Icons.dashboard), label: 'Home'),
                NavigationDestination(icon: Icon(Icons.people_outline), selectedIcon: Icon(Icons.people), label: 'Leads'),
                NavigationDestination(icon: Icon(Icons.view_kanban_outlined), selectedIcon: Icon(Icons.view_kanban), label: 'Pipeline'),
                NavigationDestination(icon: Icon(Icons.apps_outlined), selectedIcon: Icon(Icons.apps), label: 'More'),
                NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Profile'),
              ]
            : [
                NavigationDestination(icon: const Icon(Icons.home_outlined), selectedIcon: const Icon(Icons.home), label: l10n.navHome),
                NavigationDestination(icon: const Icon(Icons.receipt_long_outlined), selectedIcon: const Icon(Icons.receipt_long), label: l10n.qaSales),
                NavigationDestination(icon: const Icon(Icons.inventory_2_outlined), selectedIcon: const Icon(Icons.inventory_2), label: l10n.inventory),
                NavigationDestination(icon: const Icon(Icons.insights_outlined), selectedIcon: const Icon(Icons.insights), label: l10n.qaAnalytics),
                NavigationDestination(icon: const Icon(Icons.person_outline), selectedIcon: const Icon(Icons.person), label: l10n.navProfile),
              ],
      ),
      floatingActionButton: isLeadEdge
          ? (_tab == 1
              ? FloatingActionButton.extended(
                  onPressed: () => showCreateLeadSheet(context, ref),
                  backgroundColor: AppColors.primaryBlue,
                  icon: const Icon(Icons.add),
                  label: const Text('New lead'),
                )
              : null)
          : (_tab != 4
              ? FloatingActionButton(
                  onPressed: () => showRetailQuickCreateSheet(context, ref),
                  backgroundColor: AppColors.retailOrange,
                  foregroundColor: AppColors.white,
                  child: const Icon(Icons.add),
                )
              : null),
    );
  }

  List<Widget> _appBarActions(
    BuildContext context,
    String? name,
    WidgetRef ref, {
    required bool isLeadEdge,
  }) {
    final unread = ref.watch(unreadNotificationsProvider);
    final badge = unread.maybeWhen(data: (c) => c, orElse: () => 0);

    return [
        IconButton(
          icon: Badge(
            isLabelVisible: badge > 0,
            label: Text('$badge'),
            child: const Icon(Icons.notifications_outlined),
          ),
          tooltip: 'Notifications',
          onPressed: () => context.push('/notifications'),
        ),
        IconButton(
          icon: const Icon(Icons.swap_horiz_rounded),
          tooltip: 'Switch product',
          onPressed: () => context.go('/products'),
        ),
        PopupMenuButton<String>(
          onSelected: (v) async {
            if (v == 'logout') {
              await ref.read(authProvider.notifier).logout();
              if (context.mounted) context.go('/login');
            }
          },
          itemBuilder: (_) => [
            PopupMenuItem(enabled: false, child: Text(name ?? 'User')),
            const PopupMenuItem(value: 'logout', child: Text('Sign out')),
          ],
        ),
      ];
  }
}

class _ProfileTab extends ConsumerWidget {
  const _ProfileTab({
    required this.email,
    required this.name,
    required this.onNotifications,
  });

  final String email;
  final String name;
  final VoidCallback onNotifications;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = context.l10n;
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        Center(
          child: CircleAvatar(
            radius: 40,
            backgroundColor: AppColors.primaryBlue.withValues(alpha: 0.1),
            child: Text(
              name.characters.first.toUpperCase(),
              style: const TextStyle(fontSize: 28, color: AppColors.primaryBlue, fontWeight: FontWeight.w600),
            ),
          ),
        ),
        const SizedBox(height: 16),
        Text(name, textAlign: TextAlign.center, style: Theme.of(context).textTheme.headlineMedium),
        Text(email, textAlign: TextAlign.center, style: const TextStyle(color: AppColors.slate500)),
        const SizedBox(height: 28),
        GlassCard(
          padding: EdgeInsets.zero,
          child: Column(
            children: [
              ListTile(
                leading: const Icon(Icons.security_outlined),
                title: Text(l10n.profileSecurity),
                subtitle: Text(l10n.profileSecuritySub),
                onTap: () => context.push('/settings/security'),
              ),
              const Divider(height: 1),
              const LanguageSettingsTile(),
              const Divider(height: 1),
              ListTile(
                leading: const Icon(Icons.notifications_outlined),
                title: Text(l10n.profileNotifications),
                subtitle: Text(l10n.profileNotificationsSub),
                onTap: onNotifications,
              ),
              const Divider(height: 1),
              ListTile(
                leading: const Icon(Icons.card_membership_outlined),
                title: Text(l10n.profileBilling),
                subtitle: Text(l10n.profileBillingSub),
                onTap: () => context.push('/billing/subscribe'),
              ),
              const Divider(height: 1),
              ListTile(
                leading: const Icon(Icons.rocket_launch_outlined),
                title: Text(l10n.profileWorkspace),
                subtitle: Text(l10n.profileWorkspaceSub),
                onTap: () => context.push('/onboarding'),
              ),
              const Divider(height: 1),
              ListTile(
                leading: const Icon(Icons.logout, color: AppColors.error),
                title: Text(l10n.signOut),
                onTap: () async {
                  await ref.read(authProvider.notifier).logout();
                  if (context.mounted) context.go('/login');
                },
              ),
            ],
          ),
        ),
        const SizedBox(height: 32),
        const AsoftechLogo(height: 28),
        const SizedBox(height: 8),
        Text(
          'INNOVATE · INTEGRATE · DELIVER · SATISFY',
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                color: AppColors.slate400,
                letterSpacing: 0.8,
              ),
        ),
      ],
    );
  }
}
