import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/demo/demo_setup_service.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../shared/utils/mutation_feedback.dart';
import '../../../../shared/widgets/empty_state.dart';
import '../../../../shared/widgets/glass_card.dart';
import '../../../../shared/widgets/primary_button.dart';
import '../../../retailedge360/data/retail_repository.dart';
import '../../data/leads_repository.dart';
import '../../domain/models/lead_models.dart';
import '../providers/leads_providers.dart';
import '../widgets/lead_score_badge.dart';

class PipelineScreen extends ConsumerWidget {
  const PipelineScreen({super.key});

  Future<void> _loadDemoData(BuildContext context, WidgetRef ref) async {
    final messenger = ScaffoldMessenger.of(context);
    messenger.showSnackBar(const SnackBar(content: Text('Setting up demo data…')));

    final result = await ref.read(demoSetupServiceProvider).seed(
          leadsRepo: ref.read(leadsRepositoryProvider),
          retailRepo: ref.read(retailRepositoryProvider),
        );

    ref.invalidate(pipelineProvider);
    ref.invalidate(leadsListProvider);

    if (!context.mounted) return;

    if (result.ok) {
      messenger.showSnackBar(
        SnackBar(content: Text(result.messages.join('\n'))),
      );
    } else {
      messenger.showSnackBar(
        SnackBar(content: Text(result.error ?? 'Demo setup failed')),
      );
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final pipelineAsync = ref.watch(pipelineProvider);

    return pipelineAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('Pipeline error: $e')),
      data: (items) {
        final grouped = <String, List<PipelineItem>>{};
        for (final status in LeadFilters.pipelineStatuses) {
          grouped[status] = items.where((i) => i.status == status).toList();
        }

        final muted = Theme.of(context).brightness == Brightness.dark
            ? AppColors.slate400
            : AppColors.slate500;

        return RefreshIndicator(
          onRefresh: () async => ref.invalidate(pipelineProvider),
          child: ListView(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
            children: [
              Text('Sales pipeline', style: Theme.of(context).textTheme.headlineMedium),
              const SizedBox(height: 4),
              Text(
                '${items.length} active opportunities · long-press a card to drag between stages',
                style: TextStyle(color: muted, fontSize: 13),
              ),
              if (items.isEmpty) ...[
                const SizedBox(height: 20),
                EmptyState(
                  icon: Icons.view_kanban_outlined,
                  title: 'No pipeline opportunities yet',
                  subtitle:
                      'Move leads to Contacted or later from the Leads tab, or load demo data for a quick walkthrough.',
                  action: PrimaryButton(
                    label: 'Load demo data',
                    icon: Icons.auto_awesome_outlined,
                    onPressed: () => _loadDemoData(context, ref),
                  ),
                ),
              ],
              const SizedBox(height: 16),
              SizedBox(
                height: MediaQuery.of(context).size.height * 0.58,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: LeadFilters.pipelineStatuses.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 14),
                  itemBuilder: (context, index) {
                    final status = LeadFilters.pipelineStatuses[index];
                    final columnItems = grouped[status] ?? [];
                    return _PipelineColumn(
                      status: status,
                      items: columnItems,
                      onMove: (leadId, newStatus) async {
                        final result = await ref
                            .read(leadsRepositoryProvider)
                            .movePipelineStage(leadId, newStatus);
                        ref.invalidate(pipelineProvider);
                        ref.invalidate(leadsListProvider);
                        if (context.mounted) showMutationSnackBar(context, result);
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _PipelineColumn extends StatelessWidget {
  const _PipelineColumn({
    required this.status,
    required this.items,
    required this.onMove,
  });

  final String status;
  final List<PipelineItem> items;
  final Future<void> Function(String leadId, String status) onMove;

  Color get _accent {
    switch (status) {
      case 'Won':
        return AppColors.leadedgeGreen;
      case 'Lost':
        return AppColors.error;
      case 'Proposal':
      case 'Negotiation':
        return AppColors.retailOrange;
      default:
        return AppColors.primaryBlue;
    }
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 300,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(color: _accent, shape: BoxShape.circle),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  status,
                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: _accent.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text('${items.length}', style: TextStyle(color: _accent, fontSize: 12)),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Expanded(
            child: DragTarget<PipelineItem>(
              onWillAcceptWithDetails: (d) => d.data.status != status,
              onAcceptWithDetails: (d) => onMove(d.data.id, status),
              builder: (context, candidate, rejected) {
                final highlight = candidate.isNotEmpty;

                if (items.isEmpty) {
                  return AnimatedContainer(
                    duration: const Duration(milliseconds: 150),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: highlight
                            ? _accent
                            : AppColors.borderLight.withValues(alpha: 0.8),
                        width: highlight ? 2 : 1,
                      ),
                    ),
                    child: Center(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Text(
                          highlight ? 'Drop here' : 'No deals in $status',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: highlight ? _accent : AppColors.slate500,
                            fontSize: 13,
                            fontWeight: highlight ? FontWeight.w600 : FontWeight.normal,
                          ),
                        ),
                      ),
                    ),
                  );
                }

                return ListView.builder(
                  itemCount: items.length,
                  itemBuilder: (context, i) {
                    final item = items[i];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: _DraggablePipelineCard(
                        item: item,
                        onMove: onMove,
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _DraggablePipelineCard extends StatelessWidget {
  const _DraggablePipelineCard({
    required this.item,
    required this.onMove,
  });

  final PipelineItem item;
  final Future<void> Function(String leadId, String status) onMove;

  @override
  Widget build(BuildContext context) {
    final card = GlassCard(
      padding: const EdgeInsets.all(14),
      onTap: () => context.push('/leads/${item.id}'),
      child: _PipelineCardBody(item: item, onMove: onMove),
    );

    return LongPressDraggable<PipelineItem>(
      data: item,
      feedback: Material(
        elevation: 8,
        borderRadius: BorderRadius.circular(20),
        color: Theme.of(context).colorScheme.surface,
        child: SizedBox(
          width: 280,
          child: _PipelineCardBody(item: item, dragging: true),
        ),
      ),
      childWhenDragging: Opacity(opacity: 0.35, child: card),
      child: card,
    );
  }
}

class _PipelineCardBody extends StatelessWidget {
  const _PipelineCardBody({
    required this.item,
    this.dragging = false,
    this.onMove,
  });

  final PipelineItem item;
  final bool dragging;
  final Future<void> Function(String leadId, String status)? onMove;

  @override
  Widget build(BuildContext context) {
    final muted = Theme.of(context).brightness == Brightness.dark
        ? AppColors.slate400
        : AppColors.slate500;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                item.name,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),
            ),
            if (dragging)
              const Icon(Icons.open_with, size: 16, color: AppColors.slate400),
          ],
        ),
        if (item.phone.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Text(item.phone, style: TextStyle(color: muted, fontSize: 12)),
          ),
        const SizedBox(height: 8),
        if (item.label.isNotEmpty) LeadScoreBadge(score: 0, label: item.label),
        if (item.expectedValue > 0)
          Padding(
            padding: const EdgeInsets.only(top: 6),
            child: Text(
              '₹${item.expectedValue.toStringAsFixed(0)}',
              style: const TextStyle(color: AppColors.cyan, fontSize: 12),
            ),
          ),
        if (!dragging && onMove != null) ...[
          const SizedBox(height: 8),
          PopupMenuButton<String>(
            tooltip: 'Move stage',
            itemBuilder: (_) => LeadFilters.pipelineStatuses
                .where((s) => s != item.status)
                .map((s) => PopupMenuItem(value: s, child: Text('Move to $s')))
                .toList(),
            onSelected: (s) => onMove!(item.id, s),
            child: Row(
              children: [
                Icon(Icons.swap_vert, size: 16, color: muted),
                const SizedBox(width: 4),
                Text('Move', style: TextStyle(fontSize: 12, color: muted)),
              ],
            ),
          ),
        ],
      ],
    );
  }
}
