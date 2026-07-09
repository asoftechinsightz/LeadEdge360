import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../shared/widgets/glass_card.dart';

class HomeDashboardStats extends StatelessWidget {
  const HomeDashboardStats({
    super.key,
    required this.stats,
    required this.recentLeads,
    required this.product,
    this.onLeadTap,
  });

  final Map<String, dynamic> stats;
  final List<Map> recentLeads;
  final String product;
  final void Function(String leadId)? onLeadTap;

  @override
  Widget build(BuildContext context) {
    final totalLeads = stats['totalLeads'] ?? 0;
    final pendingFollowUps = stats['pendingFollowUps'] ?? 0;
    final openTasks = stats['openTasks'] ?? 0;

    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text(
          'Dashboard',
          style: Theme.of(context).textTheme.headlineMedium,
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(child: _StatTile(label: 'Leads', value: '$totalLeads', color: AppColors.primaryBlue)),
            const SizedBox(width: 12),
            Expanded(child: _StatTile(label: 'Follow-ups', value: '$pendingFollowUps', color: AppColors.retailOrange)),
            const SizedBox(width: 12),
            Expanded(child: _StatTile(label: 'Tasks', value: '$openTasks', color: AppColors.leadedgeGreen)),
          ],
        ),
        const SizedBox(height: 24),
        Text('Recent leads', style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 12),
        if (recentLeads.isEmpty)
          const GlassCard(
            child: Text('No recent leads', style: TextStyle(color: AppColors.slate300)),
          )
        else
          ...recentLeads.take(8).map((lead) {
            final map = Map<String, dynamic>.from(lead);
            final name = map['name'] ?? map['company'] ?? 'Lead';
            final status = map['status']?.toString() ?? 'New';
            final updated = map['updatedAt']?.toString();
            String subtitle = status;
            if (updated != null) {
              final dt = DateTime.tryParse(updated);
              if (dt != null) {
                subtitle = '$status · ${DateFormat.MMMd().add_jm().format(dt.toLocal())}';
              }
            }
            return Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: GlassCard(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                onTap: onLeadTap != null && map['id'] != null
                    ? () => onLeadTap!(map['id'].toString())
                    : null,
                child: Row(
                  children: [
                    CircleAvatar(
                      backgroundColor: AppColors.primaryBlue.withValues(alpha: 0.2),
                      child: Text(name.characters.first.toUpperCase()),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(name, style: const TextStyle(fontWeight: FontWeight.w600)),
                          Text(subtitle, style: const TextStyle(color: AppColors.slate400, fontSize: 12)),
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
    );
  }
}

class _StatTile extends StatelessWidget {
  const _StatTile({required this.label, required this.value, required this.color});

  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color)),
          const SizedBox(height: 4),
          Text(label, style: const TextStyle(color: AppColors.slate300, fontSize: 12)),
        ],
      ),
    );
  }
}
