import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../shared/utils/mutation_feedback.dart';
import '../../../../shared/widgets/glass_card.dart';
import '../../../leadedge360/data/leads_repository.dart';
import '../../../leadedge360/domain/models/lead_models.dart';
import '../../../leadedge360/presentation/widgets/lead_score_badge.dart';
import '../../domain/models/ai_models.dart';
import '../providers/ai_providers.dart';

class LeadAiPanel extends ConsumerWidget {
  const LeadAiPanel({
    super.key,
    required this.lead,
    this.onScored,
    this.onNoteAdded,
  });

  final Lead lead;
  final Future<void> Function()? onScored;
  final Future<void> Function()? onNoteAdded;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final aiState = ref.watch(leadAiStateProvider(lead));
    final notifier = ref.read(leadAiStateProvider(lead).notifier);

    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.auto_awesome, color: AppColors.primaryBlue.withValues(alpha: 0.9), size: 20),
              const SizedBox(width: 8),
              Text('AI Assistant', style: Theme.of(context).textTheme.titleLarge),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            'Reply suggestions & lead scoring',
            style: TextStyle(color: AppColors.slate400.withValues(alpha: 0.95), fontSize: 12),
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final intent in AiIntents.all)
                ActionChip(
                  label: Text(AiIntents.labels[intent] ?? intent),
                  avatar: aiState.isSuggesting && aiState.lastIntent == intent
                      ? const SizedBox(
                          width: 14,
                          height: 14,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.chat_bubble_outline, size: 16),
                  onPressed: aiState.isSuggesting
                      ? null
                      : () async {
                          await notifier.suggest(intent);
                        },
                ),
              ActionChip(
                label: const Text('Score lead'),
                avatar: aiState.isScoring
                    ? const SizedBox(
                        width: 14,
                        height: 14,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.track_changes, size: 16),
                onPressed: aiState.isScoring
                    ? null
                    : () async {
                        final result = await notifier.score();
                        if (result != null) {
                          await onScored?.call();
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('Score: ${result.score} (${result.label})'),
                              ),
                            );
                          }
                        }
                      },
              ),
            ],
          ),
          if (aiState.error != null) ...[
            const SizedBox(height: 12),
            Text(
              aiState.error!,
              style: const TextStyle(color: AppColors.error, fontSize: 12),
            ),
          ],
          if (aiState.suggestion != null && aiState.suggestion!.isNotEmpty) ...[
            const SizedBox(height: 16),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.navySurface.withValues(alpha: 0.85),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.primaryBlue.withValues(alpha: 0.25)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        'Suggested reply',
                        style: TextStyle(color: AppColors.slate400.withValues(alpha: 0.95), fontSize: 11),
                      ),
                      const Spacer(),
                      if (aiState.suggestEngine != null)
                        Text(
                          aiState.suggestEngine!,
                          style: const TextStyle(color: AppColors.slate500, fontSize: 10),
                        ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  SelectableText(
                    aiState.suggestion!,
                    style: const TextStyle(height: 1.45, fontSize: 14),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      TextButton.icon(
                        onPressed: () async {
                          await Clipboard.setData(ClipboardData(text: aiState.suggestion!));
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Copied to clipboard')),
                            );
                          }
                        },
                        icon: const Icon(Icons.copy, size: 16),
                        label: const Text('Copy'),
                      ),
                      TextButton.icon(
                        onPressed: () async {
                          final result = await ref
                              .read(leadsRepositoryProvider)
                              .addNote(lead.id, aiState.suggestion!);
                          await onNoteAdded?.call();
                          if (context.mounted) showMutationSnackBar(context, result);
                        },
                        icon: const Icon(Icons.note_add_outlined, size: 16),
                        label: const Text('Save as note'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
          if (aiState.scoreResult != null) ...[
            const SizedBox(height: 14),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                LeadScoreBadge(
                  score: aiState.scoreResult!.score,
                  label: aiState.scoreResult!.label,
                ),
                Text(
                  'via ${aiState.scoreResult!.engine}',
                  style: const TextStyle(color: AppColors.slate500, fontSize: 11),
                ),
              ],
            ),
            if (aiState.scoreResult!.reasons.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(
                aiState.scoreResult!.reasons.join(' · '),
                style: const TextStyle(color: AppColors.slate400, fontSize: 12),
              ),
            ],
          ] else if (lead.score > 0) ...[
            const SizedBox(height: 12),
            Text(
              'Current score: ${lead.score} · ${lead.label.isEmpty ? '—' : lead.label}',
              style: const TextStyle(color: AppColors.slate500, fontSize: 12),
            ),
          ],
        ],
      ),
    );
  }
}
