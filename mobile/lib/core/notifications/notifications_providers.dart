import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'notification_models.dart';
import 'notifications_repository.dart';

final notificationsProvider = FutureProvider<NotificationsPage>((ref) async {
  return ref.watch(notificationsRepositoryProvider).fetchNotifications();
});

final unreadNotificationsProvider = FutureProvider<int>((ref) async {
  final page = await ref.watch(notificationsRepositoryProvider).fetchNotifications();
  return page.unread;
});

final notificationsListProvider =
    StateNotifierProvider<NotificationsListNotifier, AsyncValue<NotificationsPage>>((ref) {
  return NotificationsListNotifier(ref.watch(notificationsRepositoryProvider));
});

class NotificationsListNotifier extends StateNotifier<AsyncValue<NotificationsPage>> {
  NotificationsListNotifier(this._repo) : super(const AsyncValue.loading()) {
    load();
  }

  final NotificationsRepository _repo;

  Future<void> load() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _repo.fetchNotifications());
  }

  Future<void> markRead(String id) async {
    await _repo.markRead(id);
    await load();
  }
}
