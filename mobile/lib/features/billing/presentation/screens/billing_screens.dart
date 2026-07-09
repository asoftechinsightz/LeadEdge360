import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../shared/widgets/glass_card.dart';
import '../../../../shared/widgets/primary_button.dart';
import '../../data/billing_repository.dart';
import '../../domain/billing_models.dart';
import '../../services/razorpay_checkout_service.dart';
import '../providers/billing_providers.dart';

class SubscribeScreen extends ConsumerStatefulWidget {
  const SubscribeScreen({super.key});

  @override
  ConsumerState<SubscribeScreen> createState() => _SubscribeScreenState();
}

class _SubscribeScreenState extends ConsumerState<SubscribeScreen> {
  String? _loadingPlanId;
  String? _message;

  @override
  Widget build(BuildContext context) {
    final plans = ref.watch(billingPlansProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Choose a plan')),
      body: plans.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Could not load plans: $e')),
        data: (items) => ListView(
          padding: const EdgeInsets.all(16),
          children: [
            GlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('14-day free trial', style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 8),
                  const Text(
                    'Start with full Growth features. No card required for trial.',
                    style: TextStyle(color: AppColors.slate500, fontSize: 13),
                  ),
                  const SizedBox(height: 12),
                  PrimaryButton(
                    label: 'Activate free trial',
                    icon: Icons.rocket_launch_outlined,
                    isLoading: _loadingPlanId == 'trial',
                    onPressed: _loadingPlanId != null ? null : _startTrial,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            Text('Subscription plans', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),
            ...items.map((plan) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: GlassCard(
                    child: ListTile(
                      title: Text(plan.name, style: const TextStyle(fontWeight: FontWeight.w600)),
                      subtitle: Text(plan.priceLabel),
                      trailing: plan.custom
                          ? TextButton(onPressed: () => context.push('/crm/reports'), child: const Text('Contact'))
                          : PrimaryButton(
                              label: 'Subscribe',
                              isLoading: _loadingPlanId == plan.id,
                              onPressed: _loadingPlanId != null ? null : () => _subscribe(plan),
                            ),
                    ),
                  ),
                )),
            if (_message != null) ...[
              const SizedBox(height: 8),
              Text(_message!, style: TextStyle(color: _message!.contains('success') ? AppColors.leadedgeGreen : AppColors.error)),
            ],
            TextButton(
              onPressed: () => context.push('/billing/history'),
              child: const Text('View billing history'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _startTrial() async {
    setState(() {
      _loadingPlanId = 'trial';
      _message = null;
    });
    try {
      await ref.read(billingRepositoryProvider).startFreeTrial();
      ref.invalidate(subscriptionsProvider);
      if (mounted) {
        setState(() => _message = 'Trial activated successfully');
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Free trial started')));
      }
    } catch (e) {
      if (mounted) setState(() => _message = e.toString());
    } finally {
      if (mounted) setState(() => _loadingPlanId = null);
    }
  }

  Future<void> _subscribe(BillingPlan plan) async {
    setState(() {
      _loadingPlanId = plan.id;
      _message = null;
    });
    try {
      final checkout = await ref.read(billingRepositoryProvider).createCheckout(plan.id);
      if (checkout['error'] != null) {
        setState(() => _message = checkout['error'].toString());
        return;
      }
      final order = Map<String, dynamic>.from(checkout['order'] as Map);
      final key = checkout['key']?.toString() ?? '';
      if (key.isEmpty || order['id'] == null) {
        setState(() => _message = 'Payment gateway not configured');
        return;
      }

      ref.read(razorpayCheckoutServiceProvider).open(
            key: key,
            orderId: order['id'].toString(),
            amountPaise: (order['amount'] as num).toInt(),
            merchantName: checkout['merchantName']?.toString() ?? 'Asoftech Business Suite',
            description: plan.name,
            onSuccess: (PaymentSuccessResponse response) async {
              try {
                await ref.read(billingRepositoryProvider).verifyPayment(
                      orderId: response.orderId ?? order['id'].toString(),
                      paymentId: response.paymentId ?? '',
                      signature: response.signature ?? '',
                      planId: plan.id,
                    );
                ref.invalidate(subscriptionsProvider);
                ref.invalidate(paymentsHistoryProvider);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Subscription activated')),
                  );
                  context.go('/products');
                }
              } catch (e) {
                if (mounted) setState(() => _message = 'Verification failed: $e');
              } finally {
                if (mounted) setState(() => _loadingPlanId = null);
              }
            },
            onError: (PaymentFailureResponse response) {
              if (mounted) {
                setState(() {
                  _loadingPlanId = null;
                  _message = response.message ?? 'Payment cancelled';
                });
              }
            },
          );
    } catch (e) {
      if (mounted) setState(() {
        _loadingPlanId = null;
        _message = e.toString();
      });
    }
  }
}

class BillingHistoryScreen extends ConsumerWidget {
  const BillingHistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final payments = ref.watch(paymentsHistoryProvider);
    final subs = ref.watch(subscriptionsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Billing history')),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(paymentsHistoryProvider);
          ref.invalidate(subscriptionsProvider);
        },
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            subs.when(
              loading: () => const LinearProgressIndicator(),
              error: (_, __) => const SizedBox.shrink(),
              data: (items) {
                if (items.isEmpty) return const SizedBox.shrink();
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Active subscriptions', style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 8),
                    ...items.map(
                      (s) => GlassCard(
                        child: ListTile(
                          title: Text(s.planCode ?? 'Plan'),
                          subtitle: Text(s.status ?? ''),
                          trailing: s.amount != null ? Text('₹${s.amount!.toStringAsFixed(0)}') : null,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],
                );
              },
            ),
            Text('Payments', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            payments.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Text('Error: $e'),
              data: (items) {
                if (items.isEmpty) {
                  return const GlassCard(child: Text('No payments recorded yet.'));
                }
                return Column(
                  children: items
                      .map(
                        (p) => Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: GlassCard(
                            child: ListTile(
                              title: Text('₹${p.amount?.toStringAsFixed(0) ?? '—'}'),
                              subtitle: Text('${p.status ?? ''} · ${p.plan ?? ''}'),
                            ),
                          ),
                        ),
                      )
                      .toList(),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
