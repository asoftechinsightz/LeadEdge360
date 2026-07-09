import 'dart:math';

import 'package:dio/dio.dart';

import '../config/app_config.dart';
import '../storage/hive_boxes.dart';
import '../../features/retailedge360/data/retail_repository.dart';

/// Pending POS checkout stored locally when offline.
class RetailOfflineCheckout {
  const RetailOfflineCheckout({
    required this.id,
    required this.payload,
    required this.createdAt,
    this.retryCount = 0,
    this.lastError,
  });

  factory RetailOfflineCheckout.fromJson(Map<String, dynamic> json) => RetailOfflineCheckout(
        id: json['id']?.toString() ?? '',
        payload: Map<String, dynamic>.from(json['payload'] as Map? ?? {}),
        createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ?? DateTime.now().toUtc(),
        retryCount: (json['retryCount'] as num?)?.toInt() ?? 0,
        lastError: json['lastError']?.toString(),
      );

  final String id;
  final Map<String, dynamic> payload;
  final DateTime createdAt;
  final int retryCount;
  final String? lastError;

  Map<String, dynamic> toJson() => {
        'id': id,
        'payload': payload,
        'createdAt': createdAt.toIso8601String(),
        'retryCount': retryCount,
        if (lastError != null) 'lastError': lastError,
      };

  RetailOfflineCheckout copyWith({
    int? retryCount,
    String? lastError,
  }) =>
      RetailOfflineCheckout(
        id: id,
        payload: payload,
        createdAt: createdAt,
        retryCount: retryCount ?? this.retryCount,
        lastError: lastError ?? this.lastError,
      );
}

/// Hive-backed queue for retail POS checkouts made while offline.
class RetailOfflineQueue {
  static const _listKey = AppConfig.keyRetailOfflineQueue;

  List<RetailOfflineCheckout> getAll() {
    final raw = HiveBoxes.offlineQueue.get(_listKey);
    if (raw is! List) return [];
    return raw
        .map((e) => RetailOfflineCheckout.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList()
      ..sort((a, b) => a.createdAt.compareTo(b.createdAt));
  }

  int getPendingCount() => getAll().length;

  Future<String> enqueueCheckout(Map<String, dynamic> payload) async {
    final entry = RetailOfflineCheckout(
      id: _newId(),
      payload: payload,
      createdAt: DateTime.now().toUtc(),
    );
    final list = getAll()..add(entry);
    await _save(list);
    return entry.id;
  }

  /// POST each queued checkout to `/retail/pos/checkout`. Returns synced count.
  Future<int> replay(RetailRepository repo) async {
    var synced = 0;
    for (final entry in getAll()) {
      if (entry.retryCount >= AppConfig.offlineQueueMaxRetries) continue;
      try {
        final items = (entry.payload['items'] as List?)
                ?.map((e) => Map<String, dynamic>.from(e as Map))
                .toList() ??
            [];
        await repo.checkout(
          items: items,
          paymentMethod: entry.payload['paymentMethod']?.toString() ?? 'cash',
        );
        await _remove(entry.id);
        synced += 1;
      } catch (e) {
        if (_isNetworkError(e)) break;
        await _update(
          entry.copyWith(
            retryCount: entry.retryCount + 1,
            lastError: e.toString(),
          ),
        );
      }
    }
    return synced;
  }

  Future<void> clear() async {
    await HiveBoxes.offlineQueue.delete(_listKey);
  }

  Future<void> _remove(String id) async {
    final list = getAll().where((e) => e.id != id).toList();
    await _save(list);
  }

  Future<void> _update(RetailOfflineCheckout entry) async {
    final list = getAll().map((e) => e.id == entry.id ? entry : e).toList();
    await _save(list);
  }

  Future<void> _save(List<RetailOfflineCheckout> entries) async {
    await HiveBoxes.offlineQueue.put(
      _listKey,
      entries.map((e) => e.toJson()).toList(),
    );
  }

  String _newId() {
    final r = Random();
    return 'retail_off_${DateTime.now().millisecondsSinceEpoch}_${r.nextInt(99999)}';
  }

  bool _isNetworkError(Object e) {
    if (e is DioException) {
      return e.type == DioExceptionType.connectionError ||
          e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout ||
          e.type == DioExceptionType.sendTimeout;
    }
    return false;
  }
}
