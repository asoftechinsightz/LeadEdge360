import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../shared/widgets/glass_card.dart';
import '../../domain/models/lead_models.dart';
import 'lead_score_badge.dart';
import 'lead_status_chip.dart';

class LeadListTile extends StatelessWidget {
  const LeadListTile({super.key, required this.lead});

  final Lead lead;

  Color get _avatarColor {
    switch (lead.label) {
      case 'Platinum':
        return AppColors.cyan;
      case 'Hot':
        return AppColors.primaryBlue;
      case 'Warm':
        return AppColors.retailOrange;
      default:
        return AppColors.slate500;
    }
  }

  @override
  Widget build(BuildContext context) {
    final muted = Theme.of(context).brightness == Brightness.dark
        ? AppColors.slate400
        : AppColors.slate500;

    final subtitle = [
      if (lead.phone.isNotEmpty) lead.phone,
      if (lead.territory.isNotEmpty) lead.territory,
      if (lead.company.isNotEmpty) lead.company,
    ].join(' · ');

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: GlassCard(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        onTap: () => context.push('/leads/${lead.id}'),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CircleAvatar(
              radius: 24,
              backgroundColor: _avatarColor.withValues(alpha: 0.12),
              child: Text(
                lead.name.isNotEmpty ? lead.name.characters.first.toUpperCase() : '?',
                style: TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 18,
                  color: _avatarColor,
                ),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    lead.name,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
                  ),
                  if (subtitle.isNotEmpty) ...[
                    const SizedBox(height: 6),
                    Text(
                      subtitle,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(color: muted, fontSize: 13, height: 1.3),
                    ),
                  ],
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    runSpacing: 6,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: [
                      LeadStatusChip(status: lead.status, compact: true),
                      if (lead.score > 0) LeadScoreBadge(score: lead.score, label: lead.label),
                      if (lead.source.isNotEmpty)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: muted.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            lead.source,
                            style: TextStyle(color: muted, fontSize: 10, fontWeight: FontWeight.w500),
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                if (lead.updatedAt != null)
                  Text(
                    DateFormat.MMMd().format(lead.updatedAt!.toLocal()),
                    style: TextStyle(color: muted, fontSize: 11),
                  ),
                const SizedBox(height: 12),
                Icon(Icons.chevron_right, color: muted, size: 22),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
