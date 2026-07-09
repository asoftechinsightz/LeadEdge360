import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';

import '../../../../core/locale/l10n_context.dart';
import '../../../../core/locale/retail_l10n_helpers.dart';
import '../../../../core/sync/connectivity_service.dart';
import '../../../../core/sync/retail_offline_providers.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../shared/widgets/glass_card.dart';
import '../../../../shared/widgets/primary_button.dart';
import '../../../billing/services/razorpay_checkout_service.dart';
import '../../domain/gst_breakdown.dart';
import '../../domain/models/retail_models.dart';
import '../../data/retail_repository.dart';
import '../providers/retail_providers.dart';
import 'retail_receipt_screen.dart';

class RetailPosScreen extends ConsumerStatefulWidget {
  const RetailPosScreen({super.key});

  @override
  ConsumerState<RetailPosScreen> createState() => _RetailPosScreenState();
}

class _RetailPosScreenState extends ConsumerState<RetailPosScreen> {
  final _skuCtrl = TextEditingController();
  final _cart = <RetailSku>[];
  final _qty = <String, int>{};
  var _scanning = false;
  var _checkingOut = false;
  var _paymentMethod = 'cash';
  var _scannerOpen = false;

  @override
  void dispose() {
    _skuCtrl.dispose();
    super.dispose();
  }

  List<Map<String, dynamic>> get _lineItems => _cart
      .map((s) => {
            'inventoryId': s.id,
            'qty': _qty[s.id] ?? 1,
            'unitPrice': s.price,
          })
      .toList();

  List<ReceiptLineItem> get _receiptLines => _cart
      .map((s) => ReceiptLineItem(
            name: s.name,
            sku: s.sku,
            qty: _qty[s.id] ?? 1,
            unitPrice: s.price,
          ))
      .toList();

  Future<void> _lookupSku([String? code]) async {
    final l10n = context.l10n;
    final value = (code ?? _skuCtrl.text).trim();
    if (value.isEmpty || _scanning) return;
    setState(() => _scanning = true);
    try {
      final online = await ref.read(connectivityServiceProvider).isOnline;
      final cache = ref.read(retailSkuCacheProvider);
      final RetailSku sku;
      if (online) {
        sku = await ref.read(retailRepositoryProvider).lookupSku(value);
        await cache.put(sku);
      } else {
        final cached = cache.findByCode(value);
        if (cached == null) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(l10n.skuNotFound(value))),
            );
          }
          return;
        }
        sku = cached;
      }
      if (_cart.every((s) => s.id != sku.id)) {
        _cart.add(sku);
        _qty[sku.id] = 1;
      } else {
        _qty[sku.id] = (_qty[sku.id] ?? 1) + 1;
      }
      _skuCtrl.clear();
      if (_scannerOpen && mounted) {
        setState(() => _scannerOpen = false);
      }
      setState(() {});
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.skuNotFound(value))),
        );
      }
    } finally {
      if (mounted) setState(() => _scanning = false);
    }
  }

  Future<void> _completeSaleOffline() async {
    final l10n = context.l10n;
    final queue = ref.read(retailOfflineQueueProvider);
    final subtotal = _total;
    final gst = GstBreakdown.fromSubtotal(subtotal);
    final offlineId = await queue.enqueueCheckout({
      'items': _lineItems,
      'paymentMethod': _paymentMethod,
      'receiptLines': _receiptLines
          .map((l) => {
                'name': l.name,
                'sku': l.sku,
                'qty': l.qty,
                'unitPrice': l.unitPrice,
              })
          .toList(),
      'subtotal': gst.subtotal,
      'cgst': gst.cgst,
      'sgst': gst.sgst,
      'gstRate': gst.gstRate,
      'total': gst.total,
      'createdAt': DateTime.now().toIso8601String(),
    });

    ref.read(retailOfflinePendingProvider.notifier).state = queue.getPendingCount();

    final receiptArgs = RetailReceiptArgs(
      saleId: offlineId,
      total: gst.total,
      paymentMethod: _paymentMethod,
      lines: _receiptLines,
      createdAt: DateTime.now().toIso8601String(),
      subtotal: gst.subtotal,
      cgst: gst.cgst,
      sgst: gst.sgst,
      gstRate: gst.gstRate,
    );

    _cart.clear();
    _qty.clear();
    setState(() {});

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.offlinePending(queue.getPendingCount()))),
      );
      context.push('/retail/receipt', extra: receiptArgs);
    }
  }

  Future<void> _completeSale({
    String? razorpayOrderId,
    String? razorpayPaymentId,
    String? razorpaySignature,
  }) async {
    final l10n = context.l10n;
    final online = await ref.read(connectivityServiceProvider).isOnline;
    if (!online) {
      await _completeSaleOffline();
      return;
    }

    final response = await ref.read(retailRepositoryProvider).checkout(
          items: _lineItems,
          paymentMethod: _paymentMethod,
          razorpayOrderId: razorpayOrderId,
          razorpayPaymentId: razorpayPaymentId,
          razorpaySignature: razorpaySignature,
        );
    ref.invalidate(retailKpisProvider);
    ref.invalidate(retailInventoryProvider);
    ref.invalidate(retailSalesProvider);

    final receiptArgs = RetailReceiptArgs.fromCheckout(
      response: response,
      lines: _receiptLines,
      paymentMethod: _paymentMethod,
    );

    _cart.clear();
    _qty.clear();
    setState(() {});

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.billSuccess)),
      );
      context.push('/retail/receipt', extra: receiptArgs);
    }
  }

  Future<void> _checkout() async {
    final l10n = context.l10n;
    if (_cart.isEmpty || _checkingOut) return;

    final online = await ref.read(connectivityServiceProvider).isOnline;
    if (!online && _paymentMethod != 'cash') {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.offlineCashOnly)),
        );
      }
      return;
    }

    setState(() => _checkingOut = true);
    try {
      if (_paymentMethod == 'cash') {
        await _completeSale();
        return;
      }

      if (!online) return;

      final orderPayload = await ref.read(retailRepositoryProvider).createPaymentOrder(
            items: _lineItems,
            paymentMethod: _paymentMethod,
          );
      if (orderPayload['configured'] == false || orderPayload['key'] == null) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(l10n.paymentGatewayNotConfigured)),
          );
        }
        return;
      }

      final order = Map<String, dynamic>.from(orderPayload['order'] as Map);
      final key = orderPayload['key']?.toString() ?? '';
      if (key.isEmpty || order['id'] == null) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(l10n.couldNotStartPayment)),
          );
        }
        return;
      }

      ref.read(razorpayCheckoutServiceProvider).open(
            key: key,
            orderId: order['id'].toString(),
            amountPaise: (order['amount'] as num).toInt(),
            merchantName: orderPayload['merchantName']?.toString() ?? 'Retail POS',
            description: 'POS ${_paymentMethod.toUpperCase()}',
            onSuccess: (PaymentSuccessResponse response) async {
              try {
                await _completeSale(
                  razorpayOrderId: response.orderId ?? order['id'].toString(),
                  razorpayPaymentId: response.paymentId ?? '',
                  razorpaySignature: response.signature ?? '',
                );
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(l10n.checkoutFailed('$e'))),
                  );
                }
              } finally {
                if (mounted) setState(() => _checkingOut = false);
              }
            },
            onError: (PaymentFailureResponse response) {
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text(response.message ?? l10n.paymentCancelled)),
                );
                setState(() => _checkingOut = false);
              }
            },
          );
      return;
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.checkoutFailed('$e'))),
        );
      }
    } finally {
      if (mounted && _paymentMethod == 'cash') setState(() => _checkingOut = false);
    }
  }

  double get _total => _cart.fold<double>(0, (sum, s) => sum + s.price * (_qty[s.id] ?? 1));

  double get _totalWithGst => GstBreakdown.fromSubtotal(_total).total;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final online = ref.watch(isOnlineProvider).maybeWhen(data: (v) => v, orElse: () => true);

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.pos),
        actions: [
          IconButton(
            icon: const Icon(Icons.receipt_long_outlined),
            tooltip: l10n.salesHistory,
            onPressed: () => context.push('/retail/sales'),
          ),
        ],
      ),
      body: Stack(
        children: [
          Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _skuCtrl,
                        decoration: InputDecoration(
                          labelText: l10n.scanSku,
                          border: const OutlineInputBorder(),
                        ),
                        textInputAction: TextInputAction.search,
                        onSubmitted: (_) => _lookupSku(),
                      ),
                    ),
                    const SizedBox(width: 8),
                    IconButton.filled(
                      onPressed: _scanning ? null : () => setState(() => _scannerOpen = true),
                      icon: const Icon(Icons.qr_code_scanner),
                    ),
                    IconButton.filled(
                      onPressed: _scanning ? null : () => _lookupSku(),
                      icon: _scanning
                          ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                          : const Icon(Icons.search),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: _cart.isEmpty
                    ? Center(child: Text(l10n.scanSku))
                    : ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: _cart.length,
                        itemBuilder: (context, i) {
                          final sku = _cart[i];
                          final qty = _qty[sku.id] ?? 1;
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: GlassCard(
                              child: ListTile(
                                title: Text(sku.name),
                                subtitle: Text('${sku.sku} · ${formatRetailCurrency(sku.price)}'),
                                trailing: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    IconButton(
                                      icon: const Icon(Icons.remove),
                                      onPressed: qty > 1
                                          ? () => setState(() => _qty[sku.id] = qty - 1)
                                          : null,
                                    ),
                                    Text('$qty'),
                                    IconButton(
                                      icon: const Icon(Icons.add),
                                      onPressed: () => setState(() => _qty[sku.id] = qty + 1),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                      ),
              ),
              SafeArea(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text(l10n.paymentMethod, style: Theme.of(context).textTheme.labelLarge),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        children: [
                          ChoiceChip(
                            label: Text(l10n.cash),
                            selected: _paymentMethod == 'cash',
                            onSelected: (_) => setState(() => _paymentMethod = 'cash'),
                          ),
                          ChoiceChip(
                            label: Text(l10n.upi),
                            selected: _paymentMethod == 'upi',
                            onSelected: online ? (_) => setState(() => _paymentMethod = 'upi') : null,
                          ),
                          ChoiceChip(
                            label: Text(l10n.card),
                            selected: _paymentMethod == 'card',
                            onSelected: online ? (_) => setState(() => _paymentMethod = 'card') : null,
                          ),
                        ],
                      ),
                      if (!online)
                        Padding(
                          padding: const EdgeInsets.only(top: 8),
                          child: Text(
                            l10n.offlinePending(ref.watch(retailOfflinePendingProvider)),
                            style: const TextStyle(fontSize: 12, color: AppColors.error),
                          ),
                        ),
                      const SizedBox(height: 12),
                      Text('${l10n.total}: ${formatRetailCurrency(_totalWithGst)}', style: Theme.of(context).textTheme.titleLarge),
                      const SizedBox(height: 8),
                      PrimaryButton(
                        label: _checkingOut ? l10n.processing : l10n.completeSale,
                        icon: Icons.point_of_sale,
                        onPressed: _cart.isEmpty || _checkingOut ? null : _checkout,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          if (_scannerOpen)
            Positioned.fill(
              child: Material(
                color: Colors.black,
                child: Column(
                  children: [
                    AppBar(
                      backgroundColor: Colors.black,
                      foregroundColor: Colors.white,
                      title: Text(l10n.scanBarcode),
                      leading: IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () => setState(() => _scannerOpen = false),
                      ),
                    ),
                    Expanded(
                      child: MobileScanner(
                        onDetect: (capture) {
                          if (capture.barcodes.isEmpty) return;
                          final code = capture.barcodes.first.rawValue;
                          if (code != null && code.isNotEmpty) {
                            _lookupSku(code);
                          }
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class RetailSalesScreen extends StatelessWidget {
  const RetailSalesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(context.l10n.salesHistoryTitle)),
      body: const RetailSalesBody(),
    );
  }
}

/// Body-only sales history list (used in the shell tab and the route screen).
class RetailSalesBody extends ConsumerWidget {
  const RetailSalesBody({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = context.l10n;
    final retailL10n = RetailL10n(l10n);
    final sales = ref.watch(retailSalesProvider);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(retailSalesProvider);
        await ref.read(retailSalesProvider.future);
      },
      child: sales.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text(l10n.salesError('$e'))),
        data: (items) {
          if (items.isEmpty) {
            return Center(child: Text(l10n.noSalesYet));
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: items.length,
            itemBuilder: (context, i) {
              final sale = items[i];
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: GlassCard(
                  child: ListTile(
                    leading: const Icon(Icons.receipt, color: AppColors.retailOrange),
                    title: Text(formatRetailCurrency(sale.totalAmount)),
                    subtitle: Text(l10n.salesItemsCount(sale.itemCount, retailL10n.paymentLabel(sale.paymentMethod))),
                    trailing: Text(
                      sale.createdAt != null ? sale.createdAt!.substring(0, 10) : '',
                      style: const TextStyle(fontSize: 12, color: AppColors.slate500),
                    ),
                    onTap: () {
                      context.push(
                        '/retail/receipt',
                        extra: RetailReceiptArgs(
                          saleId: sale.id,
                          total: sale.totalAmount,
                          paymentMethod: sale.paymentMethod,
                          lines: const [],
                          createdAt: sale.createdAt,
                        ),
                      );
                    },
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
