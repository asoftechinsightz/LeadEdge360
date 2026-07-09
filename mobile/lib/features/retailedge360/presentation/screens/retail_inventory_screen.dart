import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/locale/l10n_context.dart';
import '../../../../core/locale/retail_l10n_helpers.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../shared/widgets/empty_state.dart';
import '../../../../shared/widgets/primary_button.dart';
import '../../domain/models/retail_models.dart';
import '../providers/retail_providers.dart';
import '../widgets/retail_risk_badge.dart';
import '../widgets/retail_sku_tile.dart';

class RetailInventoryScreen extends ConsumerStatefulWidget {
  const RetailInventoryScreen({super.key});

  @override
  ConsumerState<RetailInventoryScreen> createState() => _RetailInventoryScreenState();
}

class _RetailInventoryScreenState extends ConsumerState<RetailInventoryScreen> {
  final _searchCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(retailInventoryListProvider.notifier).load());
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final state = ref.watch(retailInventoryListProvider);
    final items = state.filtered;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
          child: TextField(
            controller: _searchCtrl,
            decoration: InputDecoration(
              hintText: l10n.inventorySearchHint,
              prefixIcon: const Icon(Icons.search),
              suffixIcon: _searchCtrl.text.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear),
                      onPressed: () {
                        _searchCtrl.clear();
                        ref.read(retailInventoryListProvider.notifier).setSearch('');
                      },
                    )
                  : null,
            ),
            onChanged: ref.read(retailInventoryListProvider.notifier).setSearch,
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Text(
            l10n.skusCount(items.length),
            style: const TextStyle(color: AppColors.slate400, fontSize: 12),
          ),
        ),
        Expanded(
          child: RefreshIndicator(
            onRefresh: () => ref.read(retailInventoryListProvider.notifier).load(refresh: true),
            child: state.isLoading && state.items.isEmpty
                ? const Center(child: CircularProgressIndicator())
                : items.isEmpty
                    ? ListView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        children: [
                          const SizedBox(height: 48),
                          EmptyState(
                            icon: Icons.add_box_outlined,
                            title: state.error != null ? l10n.inventoryLoadError : l10n.noSkusYet,
                            subtitle: state.error ?? l10n.noSkusSubtitle,
                          ),
                        ],
                      )
                    : ListView.builder(
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
                        itemCount: items.length,
                        itemBuilder: (context, index) {
                          final sku = items[index];
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: RetailSkuTile(
                              sku: sku,
                              onTap: () => _showSkuDetail(context, sku),
                              onRepredict: () => _repredict(context, sku.id),
                              onDelete: () => _confirmDelete(context, sku),
                            ),
                          );
                        },
                      ),
          ),
        ),
      ],
    );
  }

  Future<void> _repredict(BuildContext context, String id) async {
    final l10n = context.l10n;
    final retailL10n = RetailL10n(l10n);
    final updated = await ref.read(retailInventoryListProvider.notifier).repredict(id);
    if (!context.mounted || updated == null) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          l10n.updatedShelfRisk(
            '${updated.predictedShelfDays ?? '—'}',
            retailL10n.riskLabel(updated.risk),
          ),
        ),
      ),
    );
    ref.invalidate(retailKpisProvider);
  }

  Future<void> _confirmDelete(BuildContext context, RetailSku sku) async {
    final l10n = context.l10n;
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(l10n.removeSkuTitle),
        content: Text(l10n.removeSkuMessage(sku.name, sku.sku)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: Text(l10n.cancel)),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: Text(l10n.remove, style: const TextStyle(color: AppColors.error)),
          ),
        ],
      ),
    );
    if (ok != true || !context.mounted) return;
    final deleted = await ref.read(retailInventoryListProvider.notifier).deleteSku(sku.id);
    if (!context.mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(deleted ? l10n.skuRemoved : l10n.removeFailed)),
    );
    ref.invalidate(retailKpisProvider);
  }

  void _showSkuDetail(BuildContext context, RetailSku sku) {
    final l10n = context.l10n;
    final retailL10n = RetailL10n(l10n);

    showModalBottomSheet<void>(
      context: context,
      backgroundColor: AppColors.navySurface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(sku.name, style: Theme.of(ctx).textTheme.titleLarge),
            Text(sku.sku, style: const TextStyle(color: AppColors.slate400)),
            const SizedBox(height: 12),
            Wrap(spacing: 8, runSpacing: 8, children: [
              RetailRiskBadge(risk: sku.risk),
              Chip(label: Text(retailL10n.categoryLabel(sku.category))),
            ]),
            const SizedBox(height: 12),
            Text(l10n.storeLabel(sku.store)),
            Text(l10n.stockLabel(sku.stock)),
            Text(l10n.priceLabel(formatRetailCurrency(sku.price))),
            if (sku.predictedShelfDays != null)
              Text(l10n.predictedShelfDays(sku.predictedShelfDays!)),
            if (sku.recommendation.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text(sku.recommendation, style: const TextStyle(color: AppColors.slate300)),
            ],
            const SizedBox(height: 16),
            PrimaryButton(
              label: l10n.repredictAi,
              icon: Icons.auto_awesome,
              onPressed: () {
                Navigator.pop(ctx);
                _repredict(context, sku.id);
              },
            ),
          ],
        ),
      ),
    );
  }
}

void showCreateRetailSkuSheet(BuildContext context, WidgetRef ref) {
  final l10n = context.l10n;
  final retailL10n = RetailL10n(l10n);
  final nameCtrl = TextEditingController();
  final skuCtrl = TextEditingController();
  final storeCtrl = TextEditingController(text: 'Default Store');
  final priceCtrl = TextEditingController(text: '100');
  final stockCtrl = TextEditingController(text: '50');
  var category = RetailCategories.all.first;
  var loading = false;

  showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    backgroundColor: AppColors.navySurface,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
    ),
    builder: (ctx) => StatefulBuilder(
      builder: (ctx, setSheetState) => Padding(
        padding: EdgeInsets.only(
          left: 20,
          right: 20,
          top: 20,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(l10n.addSku, style: Theme.of(ctx).textTheme.titleLarge),
              const SizedBox(height: 16),
              TextField(controller: nameCtrl, decoration: InputDecoration(labelText: l10n.productName)),
              TextField(controller: skuCtrl, decoration: InputDecoration(labelText: l10n.skuLabel)),
              DropdownButtonFormField<String>(
                value: category,
                decoration: InputDecoration(labelText: l10n.category),
                items: RetailCategories.all
                    .map((c) => DropdownMenuItem(value: c, child: Text(retailL10n.categoryLabel(c))))
                    .toList(),
                onChanged: (v) => setSheetState(() => category = v ?? category),
              ),
              TextField(controller: storeCtrl, decoration: InputDecoration(labelText: l10n.store)),
              TextField(
                controller: priceCtrl,
                decoration: InputDecoration(labelText: l10n.price),
                keyboardType: TextInputType.number,
              ),
              TextField(
                controller: stockCtrl,
                decoration: InputDecoration(labelText: l10n.stock),
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 16),
              PrimaryButton(
                label: l10n.addAndPredict,
                icon: Icons.auto_awesome,
                isLoading: loading,
                onPressed: loading
                    ? null
                    : () async {
                        if (nameCtrl.text.trim().isEmpty || skuCtrl.text.trim().isEmpty) return;
                        setSheetState(() => loading = true);
                        try {
                          final created = await ref.read(retailInventoryListProvider.notifier).createSku(
                                name: nameCtrl.text.trim(),
                                sku: skuCtrl.text.trim(),
                                category: category,
                                price: double.tryParse(priceCtrl.text) ?? 0,
                                stock: int.tryParse(stockCtrl.text) ?? 0,
                                store: storeCtrl.text.trim(),
                              );
                          ref.invalidate(retailKpisProvider);
                          if (ctx.mounted) {
                            if (created != null) {
                              ScaffoldMessenger.of(ctx).showSnackBar(
                                SnackBar(
                                  content: Text(
                                    l10n.createdShelfRisk(
                                      '${created.predictedShelfDays ?? '—'}',
                                      retailL10n.riskLabel(created.risk),
                                    ),
                                  ),
                                ),
                              );
                              Navigator.pop(ctx);
                            }
                          }
                        } finally {
                          if (ctx.mounted) setSheetState(() => loading = false);
                        }
                      },
              ),
            ],
          ),
        ),
      ),
    ),
  );
}
