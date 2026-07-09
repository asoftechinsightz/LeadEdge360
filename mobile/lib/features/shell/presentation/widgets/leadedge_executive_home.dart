import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../shared/widgets/api_error_state.dart';
import '../../../../shared/widgets/glass_card.dart';
import '../../../../shared/widgets/suite_menu_tile.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../leadedge360/domain/models/lead_models.dart';
import '../../../leadedge360/presentation/providers/leads_providers.dart';
import '../../../leadedge360/presentation/screens/leads_list_screen.dart';
import '../../data/shell_repository.dart';

class LeadEdgeExecutiveHome extends ConsumerStatefulWidget {
  const LeadEdgeExecutiveHome({
    super.key,
    required this.onOpenTab,
    required this.onLeadTap,
  });

  final ValueChanged<int> onOpenTab;
  final ValueChanged<String> onLeadTap;

  @override
  ConsumerState<LeadEdgeExecutiveHome> createState() => _LeadEdgeExecutiveHomeState();
}

class _LeadEdgeExecutiveHomeState extends ConsumerState<LeadEdgeExecutiveHome> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(leadsListProvider.notifier).load(refresh: true);
    });
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final bootstrap = ref.watch(bootstrapProvider);
    final leads = ref.watch(leadsListProvider);

    final stats = bootstrap.maybeWhen(
      data: (d) => Map<String, dynamic>.from(d['stats'] as Map? ?? {}),
      orElse: () => <String, dynamic>{},
    );
    final recentLeads = bootstrap.maybeWhen(
      data: (d) => (d['recentLeads'] as List?)?.cast<Map>() ?? const <Map>[],
      orElse: () => const <Map>[],
    );

    final totalLeads = (stats['totalLeads'] as int?) ?? leads.total;
    final followUps = stats['pendingFollowUps'] ?? 0;
    final openTasks = stats['openTasks'] ?? 0;
    final firstName = (user?.displayName ?? 'Executive').split(' ').first;

    return SizedBox.expand(
      child: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(bootstrapProvider);
          await ref.read(leadsListProvider.notifier).load(refresh: true);
          await ref.read(bootstrapProvider.future);
        },
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
          children: [
            Text(
              'Hello, $firstName',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontSize: 22),
            ),
            const SizedBox(height: 4),
            Text(
              'LeadEdge360 Executive — your sales command center',
              style: TextStyle(color: AppColors.slate500, fontSize: 13),
            ),
            const SizedBox(height: 16),
            _StatsStrip(
              leads: '$totalLeads',
              followUps: '$followUps',
              tasks: '$openTasks',
            ),
            const SizedBox(height: 18),
            Text('Quick actions', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 2,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 1.55,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                SuiteMenuTile(
                  title: 'Leads',
                  subtitle: 'Capture & qualify prospects',
                  color: const Color(0xFF0066FF),
                  icon: Icons.people_alt_rounded,
                  badge: totalLeads > 0 ? '$totalLeads' : null,
                  onTap: () => widget.onOpenTab(1),
                ),
                SuiteMenuTile(
                  title: 'Pipeline',
                  subtitle: 'Move deals across stages',
                  color: const Color(0xFF5B21B6),
                  icon: Icons.view_kanban_rounded,
                  onTap: () => widget.onOpenTab(2),
                ),
                SuiteMenuTile(
                  title: 'New lead',
                  subtitle: 'Add a prospect in seconds',
                  color: const Color(0xFF059669),
                  icon: Icons.person_add_alt_1_rounded,
                  onTap: () => showCreateLeadSheet(context, ref),
                ),
                SuiteMenuTile(
                  title: 'Notifications',
                  subtitle: 'Follow-ups & assignments',
                  color: const Color(0xFFEA580C),
                  icon: Icons.notifications_active_rounded,
                  onTap: () => context.push('/notifications'),
                ),
                SuiteMenuTile(
                  title: 'Follow-ups',
                  subtitle: '$followUps pending reminders',
                  color: const Color(0xFF0E7490),
                  icon: Icons.event_available_rounded,
                  onTap: () => widget.onOpenTab(1),
                ),
                SuiteMenuTile(
                  title: 'Customers',
                  subtitle: 'Accounts & contacts',
                  color: const Color(0xFF1D4ED8),
                  icon: Icons.business_rounded,
                  onTap: () => context.push('/crm/customers'),
                ),
                SuiteMenuTile(
                  title: 'Revenue',
                  subtitle: 'MRR, ARR & billing',
                  color: const Color(0xFF7C3AED),
                  icon: Icons.payments_rounded,
                  onTap: () => context.push('/crm/revenue'),
                ),
                SuiteMenuTile(
                  title: 'More modules',
                  subtitle: 'Campaigns, proposals, AI',
                  color: const Color(0xFF475569),
                  icon: Icons.apps_rounded,
                  onTap: () => widget.onOpenTab(3),
                ),
              ],
            ),
            const SizedBox(height: 22),
            Row(
              children: [
                Text('Recent leads', style: Theme.of(context).textTheme.titleMedium),
                const Spacer(),
                TextButton(onPressed: () => widget.onOpenTab(1), child: const Text('View all')),
              ],
            ),
            const SizedBox(height: 8),
            if (bootstrap.hasError && recentLeads.isEmpty && leads.items.isEmpty)
              ApiErrorState(
                error: bootstrap.error!,
                title: 'Could not refresh dashboard',
                onRetry: () => ref.invalidate(bootstrapProvider),
                onSignIn: () => context.go('/login'),
              )
            else if (recentLeads.isEmpty && leads.items.isEmpty)
              const GlassCard(
                child: Text(
                  'No leads yet — tap New lead to get started.',
                  style: TextStyle(color: AppColors.slate500),
                ),
              )
            else ...[
              ..._recentItems(recentLeads, leads.items).map((item) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: GlassCard(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    onTap: () => widget.onLeadTap(item.id),
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 20,
                          backgroundColor: AppColors.primaryBlue.withValues(alpha: 0.12),
                          child: Text(
                            item.initial,
                            style: const TextStyle(
                              color: AppColors.primaryBlue,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(item.name, style: const TextStyle(fontWeight: FontWeight.w600)),
                              Text(
                                item.subtitle,
                                style: const TextStyle(color: AppColors.slate500, fontSize: 12),
                              ),
                            ],
                          ),
                        ),
                        const Icon(Icons.chevron_right, color: AppColors.slate400),
                      ],
                    ),
                  ),
                );
              }),
            ],
          ],
        ),
      ),
    );
  }

  List<_RecentLeadItem> _recentItems(List<Map> bootstrapLeads, List<Lead> leadModels) {
    if (bootstrapLeads.isNotEmpty) {
      return bootstrapLeads.take(5).map((raw) {
        final map = Map<String, dynamic>.from(raw);
        final name = map['name']?.toString() ?? map['company']?.toString() ?? 'Lead';
        final status = map['status']?.toString() ?? 'New';
        final updated = map['updatedAt']?.toString();
        var subtitle = status;
        if (updated != null) {
          final dt = DateTime.tryParse(updated);
          if (dt != null) subtitle = '$status · ${DateFormat.MMMd().format(dt.toLocal())}';
        }
        return _RecentLeadItem(
          id: map['id']?.toString() ?? '',
          name: name,
          subtitle: subtitle,
          initial: name.isNotEmpty ? name.characters.first.toUpperCase() : '?',
        );
      }).where((e) => e.id.isNotEmpty).toList();
    }

    return leadModels.take(5).map((lead) {
      final name = lead.name.isNotEmpty ? lead.name : 'Lead';
      return _RecentLeadItem(
        id: lead.id,
        name: name,
        subtitle: lead.status,
        initial: name.characters.first.toUpperCase(),
      );
    }).where((e) => e.id.isNotEmpty).toList();
  }
}

class _RecentLeadItem {
  const _RecentLeadItem({
    required this.id,
    required this.name,
    required this.subtitle,
    required this.initial,
  });

  final String id;
  final String name;
  final String subtitle;
  final String initial;
}

class _StatsStrip extends StatelessWidget {
  const _StatsStrip({
    required this.leads,
    required this.followUps,
    required this.tasks,
  });

  final String leads;
  final String followUps;
  final String tasks;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: _MiniStat(label: 'Leads', value: leads, color: AppColors.primaryBlue)),
        const SizedBox(width: 10),
        Expanded(child: _MiniStat(label: 'Follow-ups', value: followUps, color: AppColors.retailOrange)),
        const SizedBox(width: 10),
        Expanded(child: _MiniStat(label: 'Tasks', value: tasks, color: AppColors.leadedgeGreen)),
      ],
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
    return GlassCard(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            value,
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: color),
          ),
          const SizedBox(height: 2),
          Text(label, style: const TextStyle(color: AppColors.slate500, fontSize: 11)),
        ],
      ),
    );
  }
}
