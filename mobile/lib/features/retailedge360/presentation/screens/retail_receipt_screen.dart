import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:printing/printing.dart';

import '../../../../core/locale/l10n_context.dart';
import '../../../../core/locale/locale_provider.dart';
import '../../../../core/locale/retail_l10n_helpers.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../shared/widgets/glass_card.dart';
import '../../../../shared/widgets/primary_button.dart';
import '../../data/retail_repository.dart';
import '../../domain/gst_breakdown.dart';
import '../../domain/models/retail_models.dart';

/// Line item shown on a completed sale receipt.
class ReceiptLineItem {
  const ReceiptLineItem({
    required this.name,
    required this.sku,
    required this.qty,
    required this.unitPrice,
  });

  final String name;
  final String sku;
  final int qty;
  final double unitPrice;

  double get lineTotal => unitPrice * qty;
}

/// Payload for [RetailReceiptScreen].
class RetailReceiptArgs {
  const RetailReceiptArgs({
    required this.saleId,
    required this.total,
    required this.paymentMethod,
    required this.lines,
    this.createdAt,
    this.subtotal,
    this.cgst,
    this.sgst,
    this.gstRate = 5,
    this.shopName,
    this.gstin,
    this.customerPhone,
  });

  final String saleId;
  final double total;
  final String paymentMethod;
  final List<ReceiptLineItem> lines;
  final String? createdAt;
  final double? subtotal;
  final double? cgst;
  final double? sgst;
  final double gstRate;
  final String? shopName;
  final String? gstin;
  final String? customerPhone;

  bool get isOfflineSale => saleId.startsWith('retail_off_');

  GstBreakdown get gst {
    if (subtotal != null && cgst != null && sgst != null) {
      return GstBreakdown(
        subtotal: subtotal!,
        cgst: cgst!,
        sgst: sgst!,
        gstRate: gstRate,
        total: total,
      );
    }
    final base = lines.fold<double>(0, (s, l) => s + l.lineTotal);
    return GstBreakdown.fromSubtotal(base, gstRate: gstRate);
  }

  factory RetailReceiptArgs.fromCheckout({
    required Map<String, dynamic> response,
    required List<ReceiptLineItem> lines,
    required String paymentMethod,
  }) {
    final sale = response['sale'] is Map
        ? Map<String, dynamic>.from(response['sale'] as Map)
        : response;
    final lineSubtotal = lines.fold<double>(0, (s, l) => s + l.lineTotal);
    final subtotal = (sale['subtotal'] as num?)?.toDouble() ??
        (response['subtotal'] as num?)?.toDouble() ??
        lineSubtotal;
    final gstRate = (sale['gstRate'] as num?)?.toDouble() ??
        (response['gstRate'] as num?)?.toDouble() ??
        5.0;
    final cgst = (sale['cgst'] as num?)?.toDouble() ?? (response['cgst'] as num?)?.toDouble();
    final sgst = (sale['sgst'] as num?)?.toDouble() ?? (response['sgst'] as num?)?.toDouble();
    final breakdown = (cgst != null && sgst != null)
        ? GstBreakdown(
            subtotal: subtotal,
            cgst: cgst,
            sgst: sgst,
            gstRate: gstRate,
            total: (sale['totalAmount'] as num?)?.toDouble() ??
                (response['totalAmount'] as num?)?.toDouble() ??
                subtotal + cgst + sgst,
          )
        : GstBreakdown.fromSubtotal(subtotal, gstRate: gstRate);

    return RetailReceiptArgs(
      saleId: sale['id']?.toString() ?? response['saleId']?.toString() ?? response['id']?.toString() ?? '—',
      total: breakdown.total,
      paymentMethod: paymentMethod,
      lines: lines,
      createdAt: sale['createdAt']?.toString() ?? DateTime.now().toIso8601String(),
      subtotal: breakdown.subtotal,
      cgst: breakdown.cgst,
      sgst: breakdown.sgst,
      gstRate: breakdown.gstRate,
    );
  }
}

class RetailReceiptScreen extends ConsumerStatefulWidget {
  const RetailReceiptScreen({super.key, required this.args});

  final RetailReceiptArgs args;

  @override
  ConsumerState<RetailReceiptScreen> createState() => _RetailReceiptScreenState();
}

class _RetailReceiptScreenState extends ConsumerState<RetailReceiptScreen> {
  var _busy = false;

  String get _language => ref.read(localeProvider).languageCode;

  Future<void> _withPdf(Future<void> Function(List<int> bytes) action) async {
    final l10n = context.l10n;
    if (widget.args.isOfflineSale) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(l10n.receiptOfflinePdf)));
      return;
    }
    setState(() => _busy = true);
    try {
      final bytes = await ref.read(retailRepositoryProvider).fetchReceiptPdf(
            saleId: widget.args.saleId,
            language: _language,
          );
      await action(bytes);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.receiptPdfFailed('$e'))),
        );
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _sendWhatsApp() async {
    final l10n = context.l10n;
    if (widget.args.isOfflineSale) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(l10n.receiptOfflinePdf)));
      return;
    }

    final phoneCtrl = TextEditingController(text: widget.args.customerPhone ?? '');
    final phone = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(l10n.sendWhatsApp),
        content: TextField(
          controller: phoneCtrl,
          keyboardType: TextInputType.phone,
          decoration: InputDecoration(labelText: l10n.receiptEnterPhone),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: Text(l10n.cancel)),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, phoneCtrl.text.trim()),
            child: Text(l10n.sendWhatsApp),
          ),
        ],
      ),
    );
    phoneCtrl.dispose();
    if (phone == null || phone.isEmpty || !mounted) return;

    setState(() => _busy = true);
    try {
      await ref.read(retailRepositoryProvider).sendReceiptWhatsApp(
            saleId: widget.args.saleId,
            phone: phone,
            language: _language,
          );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(l10n.receiptWaSent)));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.receiptPdfFailed('$e'))),
        );
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _printPdf() async {
    await _withPdf((bytes) async {
      await Printing.layoutPdf(
        name: 'bill-${widget.args.saleId}.pdf',
        onLayout: (_) async => Uint8List.fromList(bytes),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final retailL10n = RetailL10n(l10n);
    final args = widget.args;
    final gst = args.gst;
    final half = gst.halfRate.toStringAsFixed(1).replaceAll('.0', '');
    final dateStr = args.createdAt != null && args.createdAt!.length >= 10
        ? args.createdAt!.substring(0, 10)
        : '—';

    return Scaffold(
      appBar: AppBar(title: Text(l10n.receiptTitle)),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          GlassCard(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  l10n.billSuccess,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: AppColors.retailOrange,
                        fontWeight: FontWeight.w600,
                      ),
                ),
                const Divider(height: 28),
                if (args.shopName != null && args.shopName!.isNotEmpty)
                  _row(l10n.receiptShop, args.shopName!),
                if (args.gstin != null && args.gstin!.isNotEmpty)
                  _row(l10n.receiptGstin, args.gstin!),
                _row(l10n.receiptBillNo, args.saleId),
                _row(l10n.receiptDate, dateStr),
                _row(l10n.receiptPayment, retailL10n.paymentLabel(args.paymentMethod)),
                const SizedBox(height: 16),
                Text(l10n.receiptItems, style: Theme.of(context).textTheme.titleSmall),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(flex: 3, child: Text(l10n.productName.replaceAll(' *', ''), style: _hdr)),
                    Expanded(child: Text(l10n.receiptQty, style: _hdr, textAlign: TextAlign.center)),
                    Expanded(child: Text(l10n.receiptRate, style: _hdr, textAlign: TextAlign.end)),
                    Expanded(child: Text(l10n.receiptAmount, style: _hdr, textAlign: TextAlign.end)),
                  ],
                ),
                const Divider(),
                ...args.lines.map((line) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 6),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            flex: 3,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(line.name, style: const TextStyle(fontWeight: FontWeight.w500)),
                                Text(line.sku, style: const TextStyle(fontSize: 11, color: AppColors.slate400)),
                              ],
                            ),
                          ),
                          Expanded(child: Text('${line.qty}', textAlign: TextAlign.center)),
                          Expanded(
                            child: Text(
                              formatRetailCurrency(line.unitPrice),
                              textAlign: TextAlign.end,
                              style: const TextStyle(fontSize: 12),
                            ),
                          ),
                          Expanded(
                            child: Text(
                              formatRetailCurrency(line.lineTotal),
                              textAlign: TextAlign.end,
                              style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12),
                            ),
                          ),
                        ],
                      ),
                    )),
                const Divider(height: 24),
                _totalRow(l10n.receiptSubtotal, gst.subtotal),
                _totalRow(l10n.receiptCgst(half), gst.cgst),
                _totalRow(l10n.receiptSgst(half), gst.sgst),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(l10n.receiptTotal, style: Theme.of(context).textTheme.titleLarge),
                    Text(
                      formatRetailCurrency(gst.total),
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            color: AppColors.retailOrange,
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: _busy ? null : _sendWhatsApp,
            icon: _busy
                ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                : const Icon(Icons.chat_outlined),
            label: Text(l10n.sendWhatsApp),
          ),
          const SizedBox(height: 10),
          OutlinedButton.icon(
            onPressed: _busy ? null : _printPdf,
            icon: const Icon(Icons.print_outlined),
            label: Text(l10n.printBill),
          ),
          const SizedBox(height: 10),
          PrimaryButton(
            label: l10n.newSale,
            icon: Icons.point_of_sale,
            onPressed: () => context.go('/home/retail?tab=pos'),
          ),
        ],
      ),
    );
  }

  static const _hdr = TextStyle(fontSize: 11, color: AppColors.slate500, fontWeight: FontWeight.w600);

  Widget _row(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        children: [
          SizedBox(width: 110, child: Text(label, style: const TextStyle(color: AppColors.slate500))),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }

  Widget _totalRow(String label, double value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppColors.slate500, fontSize: 13)),
          Text(formatRetailCurrency(value), style: const TextStyle(fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}
