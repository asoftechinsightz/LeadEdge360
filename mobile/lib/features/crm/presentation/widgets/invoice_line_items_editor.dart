import 'package:flutter/material.dart';

import '../../domain/crm_models.dart';

class InvoiceLineItemRow {
  InvoiceLineItemRow({
    String name = '',
    String qty = '1',
    String rate = '',
  })  : nameCtrl = TextEditingController(text: name),
        qtyCtrl = TextEditingController(text: qty),
        rateCtrl = TextEditingController(text: rate);

  final TextEditingController nameCtrl;
  final TextEditingController qtyCtrl;
  final TextEditingController rateCtrl;

  void dispose() {
    nameCtrl.dispose();
    qtyCtrl.dispose();
    rateCtrl.dispose();
  }

  CrmInvoiceLineItem? toLineItem() {
    final name = nameCtrl.text.trim();
    if (name.isEmpty) return null;
    final qty = int.tryParse(qtyCtrl.text.trim()) ?? 1;
    final rate = double.tryParse(rateCtrl.text.trim()) ?? 0;
    if (rate <= 0) return null;
    return CrmInvoiceLineItem(name: name, qty: qty, rate: rate, amount: qty * rate);
  }

  static InvoiceLineItemRow fromLineItem(CrmInvoiceLineItem item) => InvoiceLineItemRow(
        name: item.name,
        qty: item.qty.toString(),
        rate: item.rate.toString(),
      );
}

class InvoiceLineItemsEditor extends StatefulWidget {
  const InvoiceLineItemsEditor({
    super.key,
    required this.rows,
    required this.onChanged,
    this.gstPercent = 18,
  });

  final List<InvoiceLineItemRow> rows;
  final VoidCallback onChanged;
  final double gstPercent;

  @override
  State<InvoiceLineItemsEditor> createState() => _InvoiceLineItemsEditorState();
}

class _InvoiceLineItemsEditorState extends State<InvoiceLineItemsEditor> {
  List<CrmInvoiceLineItem> _validItems() {
    return widget.rows.map((r) => r.toLineItem()).whereType<CrmInvoiceLineItem>().toList();
  }

  double get subtotal => _validItems().fold<double>(0, (sum, i) => sum + i.amount);

  double get gstAmount => subtotal * widget.gstPercent / 100;

  double get totalAmount => subtotal + gstAmount;

  @override
  Widget build(BuildContext context) {
    final items = _validItems();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            Text('Line items', style: Theme.of(context).textTheme.titleMedium),
            const Spacer(),
            TextButton.icon(
              onPressed: () {
                setState(() {
                  widget.rows.add(InvoiceLineItemRow());
                  widget.onChanged();
                });
              },
              icon: const Icon(Icons.add, size: 18),
              label: const Text('Add row'),
            ),
          ],
        ),
        const SizedBox(height: 8),
        ...widget.rows.asMap().entries.map((entry) {
          final idx = entry.key;
          final row = entry.value;
          return Card(
            margin: const EdgeInsets.only(bottom: 10),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                children: [
                  TextField(
                    controller: row.nameCtrl,
                    decoration: const InputDecoration(labelText: 'Description'),
                    onChanged: (_) {
                      setState(() {});
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: row.qtyCtrl,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(labelText: 'Qty'),
                          onChanged: (_) {
                            setState(() {});
                            widget.onChanged();
                          },
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        flex: 2,
                        child: TextField(
                          controller: row.rateCtrl,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(labelText: 'Rate (INR)'),
                          onChanged: (_) {
                            setState(() {});
                            widget.onChanged();
                          },
                        ),
                      ),
                      if (widget.rows.length > 1)
                        IconButton(
                          tooltip: 'Remove',
                          onPressed: () {
                            setState(() {
                              row.dispose();
                              widget.rows.removeAt(idx);
                              widget.onChanged();
                            });
                          },
                          icon: const Icon(Icons.delete_outline),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          );
        }),
        if (items.isNotEmpty) ...[
          const Divider(),
          _totalRow('Subtotal', subtotal),
          _totalRow('GST ${widget.gstPercent.toStringAsFixed(0)}%', gstAmount),
          _totalRow('Total', totalAmount, bold: true),
        ],
      ],
    );
  }

  Widget _totalRow(String label, double value, {bool bold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Text(label, style: TextStyle(fontWeight: bold ? FontWeight.w600 : FontWeight.normal)),
          const Spacer(),
          Text(
            '₹${value.toStringAsFixed(0)}',
            style: TextStyle(fontWeight: bold ? FontWeight.w600 : FontWeight.normal),
          ),
        ],
      ),
    );
  }
}

List<Map<String, dynamic>> lineItemsToPayload(List<CrmInvoiceLineItem> items) {
  return items
      .map((i) => {
            'name': i.name,
            'qty': i.qty,
            'rate': i.rate,
            'amount': i.amount,
          })
      .toList();
}
