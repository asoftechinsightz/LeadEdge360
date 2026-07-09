import 'dart:async';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ConnectivityService {
  ConnectivityService({Connectivity? connectivity})
      : _connectivity = connectivity ?? Connectivity();

  final Connectivity _connectivity;
  StreamSubscription<List<ConnectivityResult>>? _sub;

  Future<bool> get isOnline async {
    final results = await _connectivity.checkConnectivity();
    return _hasNetwork(results);
  }

  Stream<bool> watchOnline() async* {
    yield await isOnline;
    await for (final results in _connectivity.onConnectivityChanged) {
      yield _hasNetwork(results);
    }
  }

  void listen(void Function(bool online) onChanged) {
    _sub?.cancel();
    _sub = _connectivity.onConnectivityChanged.listen((results) {
      onChanged(_hasNetwork(results));
    });
  }

  void dispose() {
    _sub?.cancel();
    _sub = null;
  }

  bool _hasNetwork(List<ConnectivityResult> results) {
    return results.any(
      (r) =>
          r == ConnectivityResult.mobile ||
          r == ConnectivityResult.wifi ||
          r == ConnectivityResult.ethernet ||
          r == ConnectivityResult.vpn,
    );
  }
}

final connectivityServiceProvider = Provider<ConnectivityService>((ref) {
  final service = ConnectivityService();
  ref.onDispose(service.dispose);
  return service;
});

final isOnlineProvider = StreamProvider<bool>((ref) {
  return ref.watch(connectivityServiceProvider).watchOnline();
});
