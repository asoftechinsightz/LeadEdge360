import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../config/app_config.dart';
import '../../features/leadedge360/data/leads_repository.dart';
import 'connectivity_service.dart';
import 'leads_cache.dart';
import 'offline_action.dart';
import 'offline_queue.dart';
import 'sync_repository.dart';

class SyncState {
  const SyncState({
    this.isSyncing = false,
    this.lastSyncAt,
    this.pendingWrites = 0,
    this.lastError,
    this.isOnline = true,
  });

  final bool isSyncing;
  final DateTime? lastSyncAt;
  final int pendingWrites;
  final String? lastError;
  final bool isOnline;

  SyncState copyWith({
    bool? isSyncing,
    DateTime? lastSyncAt,
    int? pendingWrites,
    String? lastError,
    bool? isOnline,
    bool clearError = false,
  }) =>
      SyncState(
        isSyncing: isSyncing ?? this.isSyncing,
        lastSyncAt: lastSyncAt ?? this.lastSyncAt,
        pendingWrites: pendingWrites ?? this.pendingWrites,
        lastError: clearError ? null : (lastError ?? this.lastError),
        isOnline: isOnline ?? this.isOnline,
      );
}

class SyncService {
  SyncService({
    required SyncRepository syncRepo,
    required LeadsRepository leadsRepo,
    required LeadsCache cache,
    required OfflineQueue queue,
    required ConnectivityService connectivity,
    void Function(SyncState state)? onStateChanged,
  })  : _syncRepo = syncRepo,
        _leadsRepo = leadsRepo,
        _cache = cache,
        _queue = queue,
        _connectivity = connectivity,
        _onStateChanged = onStateChanged {
    _state = SyncState(
      lastSyncAt: cache.lastSyncAt(),
      pendingWrites: queue.pendingCount,
      isOnline: true,
    );
  }

  final SyncRepository _syncRepo;
  final LeadsRepository _leadsRepo;
  final LeadsCache _cache;
  final OfflineQueue _queue;
  final ConnectivityService _connectivity;
  final void Function(SyncState state)? _onStateChanged;

  SyncState _state = const SyncState();
  Timer? _pollTimer;
  bool _running = false;

  SyncState get state => _state;

  void _emit(SyncState next) {
    _state = next;
    _onStateChanged?.call(next);
  }

  Future<void> start() async {
    if (_pollTimer != null) return;

    final online = await _connectivity.isOnline;
    _emit(_state.copyWith(isOnline: online, pendingWrites: _queue.pendingCount));

    _connectivity.listen((online) async {
      _emit(_state.copyWith(isOnline: online, clearError: true));
      if (online) {
        await syncNow();
      }
    });

    _pollTimer?.cancel();
    _pollTimer = Timer.periodic(AppConfig.syncPollInterval, (_) {
      if (_state.isOnline) syncNow();
    });

    if (online) {
      await syncNow(full: _cache.lastSyncAt() == null);
    }
  }

  void stop() {
    _pollTimer?.cancel();
    _pollTimer = null;
  }

  Future<void> syncNow({bool full = false}) async {
    if (_running) return;
    if (!await _connectivity.isOnline) {
      _emit(_state.copyWith(isOnline: false, pendingWrites: _queue.pendingCount));
      return;
    }

    _running = true;
    _emit(_state.copyWith(isSyncing: true, clearError: true, isOnline: true));

    try {
      await _flushQueue();

      final since = full ? null : _cache.lastSyncAt();
      final result = await _syncRepo.pull(since: since);
      await _cache.mergeLeads(result.leads);
      await _cache.setLastSyncAt(result.syncedAt);

      _emit(
        _state.copyWith(
          isSyncing: false,
          lastSyncAt: result.syncedAt,
          pendingWrites: _queue.pendingCount,
          clearError: true,
        ),
      );
    } catch (e) {
      debugPrint('Sync failed: $e');
      _emit(
        _state.copyWith(
          isSyncing: false,
          pendingWrites: _queue.pendingCount,
          lastError: e.toString(),
        ),
      );
    } finally {
      _running = false;
    }
  }

  Future<void> _flushQueue() async {
    for (final action in _queue.getAll()) {
      if (action.retryCount >= AppConfig.offlineQueueMaxRetries) continue;
      try {
        await _replay(action);
        await _queue.remove(action.id);
      } catch (e) {
        if (_isNetworkError(e)) break;
        await _queue.update(
          action.copyWith(
            retryCount: action.retryCount + 1,
            lastError: e.toString(),
          ),
        );
      }
    }
  }

  Future<void> _replay(OfflineAction action) async {
    switch (action.type) {
      case OfflineActionType.updateStatus:
        final leadId = action.leadId ?? action.payload['leadId']?.toString() ?? '';
        final status = action.payload['status']?.toString() ?? '';
        await _leadsRepo.updateLeadStatusDirect(leadId, status);
      case OfflineActionType.addNote:
        final leadId = action.leadId ?? '';
        await _leadsRepo.addNoteDirect(leadId, action.payload['note']?.toString() ?? '');
      case OfflineActionType.addFollowUp:
        final leadId = action.leadId ?? '';
        final dueRaw = action.payload['dueAt']?.toString();
        await _leadsRepo.addFollowUpDirect(
          leadId,
          title: action.payload['title']?.toString() ?? '',
          dueAt: DateTime.tryParse(dueRaw ?? '') ?? DateTime.now().toUtc(),
        );
      case OfflineActionType.addTask:
        final leadId = action.leadId ?? '';
        await _leadsRepo.addTaskDirect(
          leadId,
          title: action.payload['title']?.toString() ?? '',
          description: action.payload['description']?.toString(),
        );
      case OfflineActionType.createLead:
        final tempId = action.payload['tempId']?.toString();
        final lead = await _leadsRepo.createLeadDirect(
          name: action.payload['name']?.toString() ?? '',
          phone: action.payload['phone']?.toString() ?? '',
          email: action.payload['email']?.toString(),
          company: action.payload['company']?.toString(),
          source: action.payload['source']?.toString(),
          territory: action.payload['territory']?.toString(),
        );
        if (tempId != null && tempId.isNotEmpty) {
          await _cache.replaceLeadId(tempId, lead.id);
        }
      case OfflineActionType.movePipeline:
        await _leadsRepo.movePipelineStageDirect(
          action.payload['leadId']?.toString() ?? action.leadId ?? '',
          action.payload['status']?.toString() ?? '',
          reason: action.payload['reason']?.toString(),
        );
    }
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
