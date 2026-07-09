import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/expiry_repository.dart';
import '../../domain/models/expiry_models.dart';

final expiryDashboardProvider = FutureProvider<ExpiryDashboard>((ref) async {
  return ref.watch(expiryRepositoryProvider).fetchDashboard();
});
