import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'leads_cache.dart';
import 'offline_queue.dart';

final leadsCacheProvider = Provider<LeadsCache>((ref) => LeadsCache());

final offlineQueueProvider = Provider<OfflineQueue>((ref) => OfflineQueue());
