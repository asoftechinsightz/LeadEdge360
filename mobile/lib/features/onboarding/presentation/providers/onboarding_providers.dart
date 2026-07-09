import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/onboarding_repository.dart';

final onboardingProgressProvider = FutureProvider.autoDispose<Map<String, dynamic>>(
  (ref) => ref.watch(onboardingRepositoryProvider).fetchProgress(),
);

final retailQuickSetupNeededProvider = FutureProvider<bool>((ref) async {
  return ref.watch(onboardingRepositoryProvider).needsRetailQuickSetup();
});
