import 'dart:math';

import '../config/app_config.dart';
import '../storage/hive_boxes.dart';
import 'offline_action.dart';

class OfflineQueue {
  static const _listKey = 'offline_actions';

  List<OfflineAction> getAll() {
    final raw = HiveBoxes.offlineQueue.get(_listKey);
    if (raw is! List) return [];
    return raw
        .map((e) => OfflineAction.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList()
      ..sort((a, b) => a.createdAt.compareTo(b.createdAt));
  }

  int get pendingCount => getAll().length;

  Future<OfflineAction> enqueue({
    required OfflineActionType type,
    String? leadId,
    required Map<String, dynamic> payload,
  }) async {
    final action = OfflineAction(
      id: _newId(),
      type: type,
      leadId: leadId,
      payload: payload,
    );
    final list = getAll()..add(action);
    await _save(list);
    return action;
  }

  Future<void> remove(String actionId) async {
    final list = getAll().where((a) => a.id != actionId).toList();
    await _save(list);
  }

  Future<void> update(OfflineAction action) async {
    final list = getAll().map((a) => a.id == action.id ? action : a).toList();
    await _save(list);
  }

  Future<void> clear() async {
    await HiveBoxes.offlineQueue.delete(_listKey);
  }

  Future<void> _save(List<OfflineAction> actions) async {
    await HiveBoxes.offlineQueue.put(
      _listKey,
      actions.map((a) => a.toJson()).toList(),
    );
  }

  String _newId() {
    final r = Random();
    return 'offline_${DateTime.now().millisecondsSinceEpoch}_${r.nextInt(99999)}';
  }
}
