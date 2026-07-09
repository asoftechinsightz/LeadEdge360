import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/billing_repository.dart';
import '../../domain/billing_models.dart';

final billingPlansProvider = FutureProvider.autoDispose<List<BillingPlan>>(
  (ref) => ref.watch(billingRepositoryProvider).fetchPlans(),
);

final subscriptionsProvider = FutureProvider.autoDispose<List<SubscriptionRecord>>(
  (ref) => ref.watch(billingRepositoryProvider).fetchSubscriptions(),
);

final paymentsHistoryProvider = FutureProvider.autoDispose<List<PaymentRecord>>(
  (ref) => ref.watch(billingRepositoryProvider).fetchPayments(),
);
