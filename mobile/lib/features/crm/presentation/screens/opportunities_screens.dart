import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../shared/widgets/glass_card.dart';
import '../../data/crm_repository.dart';
import '../../domain/crm_models.dart';
import '../providers/crm_providers.dart';
import '../widgets/crm_list_widgets.dart';

const _opportunityStages = [
  ('NEW', 'New'),
  ('CONTACTED', 'Contacted'),
  ('QUALIFIED', 'Qualified'),
  ('MEETING_SCHEDULED', 'Meeting'),
  ('PROPOSAL_SENT', 'Proposal'),
  ('NEGOTIATION', 'Negotiation'),
  ('WON', 'Won'),
  ('LOST', 'Lost'),
];

String _stageLabel(String? stage) {
  if (stage == null) return '—';
  for (final entry in _opportunityStages) {
    if (entry.$1 == stage) return entry.$2;
  }
  return stage;
}

class OpportunitiesListScreen extends ConsumerWidget {
  const OpportunitiesListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final opps = ref.watch(opportunitiesProvider);
    final dashboard = ref.watch(opportunityDashboardProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Opportunities')),
      body: Column(
        children: [
          dashboard.when(
            loading: () => const SizedBox.shrink(),
            error: (_, __) => const SizedBox.shrink(),
            data: (data) {
              final pipeline = (data['pipelineValue'] as num?) ?? 0;
              final total = (data['total'] as num?) ?? 0;
              final won = (data['won'] as num?) ?? 0;
              return Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                child: GlassCard(
                  child: Row(
                    children: [
                      Expanded(child: _kpi('Open', total.toString())),
                      Expanded(child: _kpi('Pipeline', formatCurrency(pipeline))),
                      Expanded(child: _kpi('Won', won.toString())),
                    ],
                  ),
                ),
              );
            },
          ),
          Expanded(
            child: CrmAsyncListBody<CrmOpportunity>(
              asyncValue: opps,
              onRefresh: () async {
                ref.invalidate(opportunitiesProvider);
                ref.invalidate(opportunityDashboardProvider);
              },
              emptyTitle: 'No opportunities',
              emptySubtitle: 'Move leads through pipeline to create deals',
              itemBuilder: (context, o) => GlassCard(
                onTap: () => context.push('/crm/opportunities/${o.id}'),
                padding: const EdgeInsets.all(14),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(o.name, style: const TextStyle(fontWeight: FontWeight.w600)),
                          Text(
                            _stageLabel(o.stage ?? o.status),
                            style: const TextStyle(color: AppColors.slate500, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                    if (o.expectedValue != null)
                      Text(
                        formatCurrency(o.expectedValue),
                        style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.leadedgeGreen),
                      ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _kpi(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        children: [
          Text(value, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
          Text(label, style: const TextStyle(color: AppColors.slate500, fontSize: 11)),
        ],
      ),
    );
  }
}

class OpportunityDetailScreen extends ConsumerStatefulWidget {
  const OpportunityDetailScreen({super.key, required this.opportunityId});

  final String opportunityId;

  @override
  ConsumerState<OpportunityDetailScreen> createState() => _OpportunityDetailScreenState();
}

class _OpportunityDetailScreenState extends ConsumerState<OpportunityDetailScreen> {
  var _saving = false;

  Future<void> _updateStage(String stage) async {
    setState(() => _saving = true);
    try {
      await ref.read(crmRepositoryProvider).patchOpportunity(widget.opportunityId, {'stage': stage});
      ref.invalidate(opportunityDetailProvider(widget.opportunityId));
      ref.invalidate(opportunitiesProvider);
      ref.invalidate(opportunityDashboardProvider);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final detail = ref.watch(opportunityDetailProvider(widget.opportunityId));

    return Scaffold(
      appBar: AppBar(title: const Text('Opportunity')),
      body: detail.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (data) {
          final item = Map<String, dynamic>.from(data['item'] as Map? ?? data['opportunity'] as Map? ?? data);
          final lead = data['lead'] as Map?;
          final activities = (data['activities'] as List?) ?? [];
          final currentStage = item['stage']?.toString() ?? 'NEW';
          final leadId = item['leadId']?.toString() ?? lead?['id']?.toString();

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              GlassCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item['name']?.toString() ?? item['company']?.toString() ?? 'Deal',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    const SizedBox(height: 8),
                    _row('Stage', _stageLabel(currentStage)),
                    _row('Status', item['leadStatus']?.toString() ?? item['status']?.toString()),
                    _row('Value', formatCurrency(item['expectedValue'] as num?)),
                    _row('Probability', item['probability'] != null ? '${item['probability']}%' : null),
                    _row('Owner', item['owner']?.toString()),
                    if (leadId != null && leadId.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      OutlinedButton.icon(
                        onPressed: () => context.push('/leads/$leadId'),
                        icon: const Icon(Icons.person_outline, size: 18),
                        label: Text('View lead: ${lead?['name'] ?? leadId}'),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 16),
              Text('Update stage', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              if (_saving) const LinearProgressIndicator(),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _opportunityStages
                    .map(
                      (entry) => ChoiceChip(
                        label: Text(entry.$2),
                        selected: currentStage == entry.$1,
                        onSelected: _saving ? null : (_) => _updateStage(entry.$1),
                      ),
                    )
                    .toList(),
              ),
              const SizedBox(height: 20),
              Text('Activity', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              if (activities.isEmpty)
                const Text('No activity yet.', style: TextStyle(color: AppColors.slate500))
              else
                ...activities.map((raw) {
                  final act = Map<String, dynamic>.from(raw as Map);
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: GlassCard(
                      child: ListTile(
                        dense: true,
                        title: Text(act['title']?.toString() ?? 'Activity'),
                        subtitle: Text(
                          [act['notes']?.toString(), act['createdAt']?.toString()?.substring(0, 10)]
                              .where((s) => s != null && s.isNotEmpty)
                              .join(' · '),
                          style: const TextStyle(fontSize: 12),
                        ),
                      ),
                    ),
                  );
                }),
            ],
          );
        },
      ),
    );
  }

  Widget _row(String label, String? value) {
    if (value == null || value.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          SizedBox(width: 90, child: Text(label, style: const TextStyle(color: AppColors.slate500))),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
}
