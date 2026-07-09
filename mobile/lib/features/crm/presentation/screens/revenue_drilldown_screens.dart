import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../shared/widgets/glass_card.dart';
import '../providers/crm_providers.dart';
import '../widgets/crm_list_widgets.dart';

class RevenueByCustomerScreen extends ConsumerWidget {
  const RevenueByCustomerScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final data = ref.watch(revenueByCustomerProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Revenue by customer')),
      body: CrmDashboardBody(
        asyncValue: data,
        onRefresh: () async => ref.invalidate(revenueByCustomerProvider),
        buildContent: (payload) {
          final items = payload['items'] as List? ?? [];
          if (items.isEmpty) {
            return const GlassCard(child: Padding(padding: EdgeInsets.all(16), child: Text('No paid revenue yet')));
          }
          return Column(
            children: items.map((raw) {
              final item = Map<String, dynamic>.from(raw as Map);
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: GlassCard(
                  child: ListTile(
                    title: Text(item['name']?.toString() ?? 'Customer'),
                    subtitle: Text('${item['count'] ?? 0} transactions'),
                    trailing: Text(formatCurrency((item['amount'] as num?)?.toDouble())),
                  ),
                ),
              );
            }).toList(),
          );
        },
      ),
    );
  }
}

class RevenueBySourceScreen extends ConsumerWidget {
  const RevenueBySourceScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final data = ref.watch(revenueBySourceProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Revenue by source')),
      body: CrmDashboardBody(
        asyncValue: data,
        onRefresh: () async => ref.invalidate(revenueBySourceProvider),
        buildContent: (payload) => _breakdownList(payload, 'No paid revenue by source yet'),
      ),
    );
  }
}

class RevenueByTerritoryScreen extends ConsumerWidget {
  const RevenueByTerritoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final data = ref.watch(revenueByTerritoryProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Revenue by territory')),
      body: CrmDashboardBody(
        asyncValue: data,
        onRefresh: () async => ref.invalidate(revenueByTerritoryProvider),
        buildContent: (payload) => _breakdownList(payload, 'No paid revenue by territory yet'),
      ),
    );
  }
}

Widget _breakdownList(Map<String, dynamic> payload, String emptyMessage) {
  final items = payload['items'] as List? ?? [];
  if (items.isEmpty) {
    return GlassCard(child: Padding(padding: const EdgeInsets.all(16), child: Text(emptyMessage)));
  }
  return Column(
    children: items.map((raw) {
      final item = Map<String, dynamic>.from(raw as Map);
      return Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: GlassCard(
          child: ListTile(
            title: Text(item['name']?.toString() ?? 'Unknown'),
            subtitle: Text('${item['count'] ?? 0} transactions'),
            trailing: Text(formatCurrency((item['amount'] as num?)?.toDouble())),
          ),
        ),
      );
    }).toList(),
  );
}

class RevenueTrendsScreen extends ConsumerWidget {
  const RevenueTrendsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final data = ref.watch(revenueTrendsProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Revenue trends')),
      body: CrmDashboardBody(
        asyncValue: data,
        onRefresh: () async => ref.invalidate(revenueTrendsProvider),
        buildContent: (payload) {
          final trends = payload['trends'] as List? ?? [];
          if (trends.isEmpty) {
            return const GlassCard(child: Padding(padding: EdgeInsets.all(16), child: Text('Trend data appears as invoices are paid')));
          }
          final maxAmount = trends.fold<double>(0, (max, raw) {
            final amt = (Map<String, dynamic>.from(raw as Map)['amount'] as num?)?.toDouble() ?? 0;
            return amt > max ? amt : max;
          });
          return Column(
            children: trends.map((raw) {
              final item = Map<String, dynamic>.from(raw as Map);
              final amount = (item['amount'] as num?)?.toDouble() ?? 0;
              final fraction = maxAmount > 0 ? amount / maxAmount : 0.0;
              return Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: GlassCard(
                  child: Padding(
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(item['month']?.toString() ?? '—', style: const TextStyle(fontWeight: FontWeight.w600)),
                            const Spacer(),
                            Text(formatCurrency(amount)),
                          ],
                        ),
                        const SizedBox(height: 8),
                        LinearProgressIndicator(value: fraction, minHeight: 8, borderRadius: BorderRadius.circular(4)),
                        const SizedBox(height: 4),
                        Text('${item['count'] ?? 0} payments', style: const TextStyle(fontSize: 12)),
                      ],
                    ),
                  ),
                ),
              );
            }).toList(),
          );
        },
      ),
    );
  }
}
