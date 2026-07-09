import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../../core/notifications/notifications_providers.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../shared/widgets/glass_card.dart';

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(notificationsListProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.read(notificationsListProvider.notifier).load(),
          ),
        ],
      ),
      body: state.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (page) {
          if (page.items.isEmpty) {
            return const Center(
              child: Text('No notifications yet', style: TextStyle(color: AppColors.slate400)),
            );
          }
          return RefreshIndicator(
            onRefresh: () => ref.read(notificationsListProvider.notifier).load(),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: page.items.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, i) {
                final n = page.items[i];
                return GlassCard(
                  padding: const EdgeInsets.all(14),
                  onTap: n.read
                      ? null
                      : () => ref.read(notificationsListProvider.notifier).markRead(n.id),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(
                        n.read ? Icons.notifications_none : Icons.notifications_active,
                        color: n.read ? AppColors.slate500 : AppColors.primaryBlue,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              n.title,
                              style: TextStyle(
                                fontWeight: FontWeight.w600,
                                color: n.read ? AppColors.slate300 : Colors.white,
                              ),
                            ),
                            if (n.body.isNotEmpty)
                              Text(n.body, style: const TextStyle(color: AppColors.slate400, fontSize: 13)),
                            if (n.createdAt != null)
                              Text(
                                DateFormat.yMMMd().add_jm().format(n.createdAt!.toLocal()),
                                style: const TextStyle(color: AppColors.slate500, fontSize: 11),
                              ),
                          ],
                        ),
                      ),
                      if (!n.read)
                        Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: AppColors.cyan,
                            shape: BoxShape.circle,
                          ),
                        ),
                    ],
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
