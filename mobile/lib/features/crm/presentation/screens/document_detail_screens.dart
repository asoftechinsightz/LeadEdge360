import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/file_download.dart';
import '../../../../shared/widgets/glass_card.dart';
import '../../../../shared/widgets/primary_button.dart';
import '../../data/crm_repository.dart';
import '../../domain/crm_models.dart';
import '../providers/crm_providers.dart';
import '../widgets/crm_list_widgets.dart';
import '../widgets/invoice_line_items_editor.dart';

class ProposalDetailScreen extends ConsumerStatefulWidget {
  const ProposalDetailScreen({super.key, required this.proposalId});

  final String proposalId;

  @override
  ConsumerState<ProposalDetailScreen> createState() => _ProposalDetailScreenState();
}

class _ProposalDetailScreenState extends ConsumerState<ProposalDetailScreen> {
  var _busy = false;

  Map<String, dynamic> _proposal(Map<String, dynamic> data) =>
      Map<String, dynamic>.from(data['proposal'] as Map? ?? data);

  Future<void> _run(Future<void> Function() action) async {
    if (_busy) return;
    setState(() => _busy = true);
    try {
      await action();
      ref.invalidate(proposalDetailProvider(widget.proposalId));
      ref.invalidate(proposalsProvider);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _downloadPdf() async {
    final bytes = await ref.read(crmRepositoryProvider).downloadBytes('/proposals/${widget.proposalId}/pdf');
    await saveAndOpenBytes(bytes, 'proposal-${widget.proposalId}.pdf');
  }

  @override
  Widget build(BuildContext context) {
    final detail = ref.watch(proposalDetailProvider(widget.proposalId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Proposal'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_outlined),
            onPressed: () => context.push('/crm/proposals/${widget.proposalId}/edit'),
          ),
        ],
      ),
      body: detail.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (data) {
          final p = _proposal(data);
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              GlassCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      p['clientName']?.toString() ?? 'Proposal',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    const SizedBox(height: 8),
                    _row('Company', p['company']?.toString()),
                    _row('Status', p['status']?.toString()),
                    _row('Subtotal', formatCurrency(p['subtotal'] as num?)),
                    _row('GST', formatCurrency(p['gstAmount'] as num?)),
                    _row('Total', formatCurrency(p['totalAmount'] as num?)),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              PrimaryButton(
                label: 'Download PDF',
                icon: Icons.picture_as_pdf_outlined,
                isLoading: _busy,
                onPressed: _busy ? null : () => _run(_downloadPdf),
              ),
              const SizedBox(height: 10),
              PrimaryButton(
                label: 'Mark won',
                icon: Icons.emoji_events_outlined,
                isLoading: _busy,
                onPressed: _busy
                    ? null
                    : () => _run(() async {
                          await ref.read(crmRepositoryProvider).markProposalWon(widget.proposalId);
                          if (mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Proposal marked won')));
                          }
                        }),
              ),
              const SizedBox(height: 10),
              OutlinedButton.icon(
                onPressed: _busy
                    ? null
                    : () => _run(() async {
                          final res = await ref.read(crmRepositoryProvider).convertProposalToInvoice(widget.proposalId);
                          if (mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('Invoice created: ${res['invoiceId'] ?? 'OK'}')),
                            );
                          }
                        }),
                icon: const Icon(Icons.receipt_long_outlined),
                label: const Text('Convert to invoice'),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _row(String label, String? value) {
    if (value == null || value.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          SizedBox(width: 88, child: Text(label, style: const TextStyle(color: AppColors.slate500))),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
}

class EditProposalScreen extends ConsumerStatefulWidget {
  const EditProposalScreen({super.key, required this.proposalId});

  final String proposalId;

  @override
  ConsumerState<EditProposalScreen> createState() => _EditProposalScreenState();
}

class _EditProposalScreenState extends ConsumerState<EditProposalScreen> {
  final _clientCtrl = TextEditingController();
  final _companyCtrl = TextEditingController();
  final _amountCtrl = TextEditingController();
  var _loading = false;
  var _initialized = false;

  @override
  void dispose() {
    _clientCtrl.dispose();
    _companyCtrl.dispose();
    _amountCtrl.dispose();
    super.dispose();
  }

  void _initFrom(Map<String, dynamic> p) {
    if (_initialized) return;
    _clientCtrl.text = p['clientName']?.toString() ?? '';
    _companyCtrl.text = p['company']?.toString() ?? '';
    _amountCtrl.text = (p['subtotal'] as num?)?.toString() ?? '';
    _initialized = true;
  }

  Future<void> _save() async {
    final subtotal = double.tryParse(_amountCtrl.text.trim()) ?? 0;
    if (_clientCtrl.text.trim().isEmpty || subtotal <= 0) return;
    final gstPercent = 18.0;
    final gstAmount = subtotal * gstPercent / 100;
    setState(() => _loading = true);
    try {
      await ref.read(crmRepositoryProvider).patchProposal(widget.proposalId, {
        'clientName': _clientCtrl.text.trim(),
        'company': _companyCtrl.text.trim(),
        'subtotal': subtotal,
        'gstPercent': gstPercent,
        'gstAmount': gstAmount,
        'totalAmount': subtotal + gstAmount,
      });
      ref.invalidate(proposalDetailProvider(widget.proposalId));
      ref.invalidate(proposalsProvider);
      if (mounted) context.pop();
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final detail = ref.watch(proposalDetailProvider(widget.proposalId));

    return Scaffold(
      appBar: AppBar(title: const Text('Edit proposal')),
      body: detail.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (data) {
          final p = Map<String, dynamic>.from(data['proposal'] as Map? ?? data);
          _initFrom(p);
          return Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                TextField(controller: _clientCtrl, decoration: const InputDecoration(labelText: 'Client name')),
                const SizedBox(height: 12),
                TextField(controller: _companyCtrl, decoration: const InputDecoration(labelText: 'Company')),
                const SizedBox(height: 12),
                TextField(
                  controller: _amountCtrl,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Subtotal (INR)'),
                ),
                const Spacer(),
                FilledButton(
                  onPressed: _loading ? null : _save,
                  child: Text(_loading ? 'Saving…' : 'Save changes'),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class InvoiceDetailScreen extends ConsumerStatefulWidget {
  const InvoiceDetailScreen({super.key, required this.invoiceId});

  final String invoiceId;

  @override
  ConsumerState<InvoiceDetailScreen> createState() => _InvoiceDetailScreenState();
}

class _InvoiceDetailScreenState extends ConsumerState<InvoiceDetailScreen> {
  var _busy = false;

  Future<void> _run(Future<void> Function() action) async {
    if (_busy) return;
    setState(() => _busy = true);
    try {
      await action();
      ref.invalidate(invoiceDetailProvider(widget.invoiceId));
      ref.invalidate(invoicesProvider);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final detail = ref.watch(invoiceDetailProvider(widget.invoiceId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Invoice'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_outlined),
            onPressed: () => context.push('/crm/invoices/${widget.invoiceId}/edit'),
          ),
        ],
      ),
      body: detail.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (inv) {
          if (inv == null) {
            return const Center(child: Text('Invoice not found'));
          }
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              GlassCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(inv.invoiceNumber, style: Theme.of(context).textTheme.headlineSmall),
                    const SizedBox(height: 8),
                    _row('Client', inv.clientName),
                    _row('Status', inv.status),
                    _row('GST', formatCurrency(inv.gstAmount)),
                    _row('Total', formatCurrency(inv.totalAmount)),
                  ],
                ),
              ),
              if (inv.items.isNotEmpty) ...[
                const SizedBox(height: 12),
                GlassCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Line items', style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 8),
                      ...inv.items.map(
                        (item) => Padding(
                          padding: const EdgeInsets.only(bottom: 6),
                          child: Row(
                            children: [
                              Expanded(child: Text('${item.name} × ${item.qty}')),
                              Text(formatCurrency(item.amount > 0 ? item.amount : item.rate * item.qty)),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
              const SizedBox(height: 16),
              PrimaryButton(
                label: 'Download PDF',
                icon: Icons.picture_as_pdf_outlined,
                isLoading: _busy,
                onPressed: _busy
                    ? null
                    : () => _run(() async {
                          final bytes = await ref.read(crmRepositoryProvider).downloadBytes('/invoices/${widget.invoiceId}');
                          await saveAndOpenBytes(bytes, '${inv.invoiceNumber}.pdf');
                        }),
              ),
              const SizedBox(height: 10),
              PrimaryButton(
                label: 'Mark paid',
                icon: Icons.payments_outlined,
                isLoading: _busy,
                onPressed: _busy
                    ? null
                    : () => _run(() async {
                          await ref.read(crmRepositoryProvider).invoiceAction(widget.invoiceId, 'pay');
                          if (mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Payment recorded')));
                          }
                        }),
              ),
              const SizedBox(height: 10),
              OutlinedButton.icon(
                onPressed: _busy
                    ? null
                    : () => _run(() async {
                          await ref.read(crmRepositoryProvider).invoiceAction(widget.invoiceId, 'cancel');
                          if (mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Invoice cancelled')));
                          }
                        }),
                icon: const Icon(Icons.cancel_outlined),
                label: const Text('Cancel invoice'),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _row(String label, String? value) {
    if (value == null || value.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          SizedBox(width: 88, child: Text(label, style: const TextStyle(color: AppColors.slate500))),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
}

class EditInvoiceScreen extends ConsumerStatefulWidget {
  const EditInvoiceScreen({super.key, required this.invoiceId});

  final String invoiceId;

  @override
  ConsumerState<EditInvoiceScreen> createState() => _EditInvoiceScreenState();
}

class _EditInvoiceScreenState extends ConsumerState<EditInvoiceScreen> {
  final _clientCtrl = TextEditingController();
  final _lineRows = <InvoiceLineItemRow>[];
  var _loading = false;
  var _initialized = false;
  String _status = 'DRAFT';

  @override
  void dispose() {
    _clientCtrl.dispose();
    for (final row in _lineRows) {
      row.dispose();
    }
    super.dispose();
  }

  void _initFrom(CrmInvoice inv) {
    if (_initialized) return;
    _clientCtrl.text = inv.clientName ?? '';
    _status = inv.status ?? 'DRAFT';
    if (inv.items.isNotEmpty) {
      for (final item in inv.items) {
        _lineRows.add(InvoiceLineItemRow.fromLineItem(item));
      }
    } else {
      _lineRows.add(InvoiceLineItemRow(rate: inv.subtotal?.toString() ?? ''));
    }
    _initialized = true;
  }

  Future<void> _save() async {
    final items = _lineRows.map((r) => r.toLineItem()).whereType<CrmInvoiceLineItem>().toList();
    if (_clientCtrl.text.trim().isEmpty || items.isEmpty) return;
    const gstPercent = 18.0;
    final subtotal = items.fold<double>(0, (s, i) => s + i.amount);
    final gstAmount = subtotal * gstPercent / 100;
    setState(() => _loading = true);
    try {
      await ref.read(crmRepositoryProvider).patchInvoice(widget.invoiceId, {
        'clientName': _clientCtrl.text.trim(),
        'status': _status,
        'subtotal': subtotal,
        'gstPercent': gstPercent,
        'gstAmount': gstAmount,
        'totalAmount': subtotal + gstAmount,
        'items': lineItemsToPayload(items),
      });
      ref.invalidate(invoiceDetailProvider(widget.invoiceId));
      ref.invalidate(invoicesProvider);
      if (mounted) context.pop();
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final detail = ref.watch(invoiceDetailProvider(widget.invoiceId));

    return Scaffold(
      appBar: AppBar(title: const Text('Edit invoice')),
      body: detail.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (inv) {
          if (inv == null) return const Center(child: Text('Invoice not found'));
          _initFrom(inv);
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                TextField(controller: _clientCtrl, decoration: const InputDecoration(labelText: 'Client name')),
                const SizedBox(height: 16),
                InvoiceLineItemsEditor(
                  rows: _lineRows,
                  onChanged: () => setState(() {}),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  value: _status,
                  decoration: const InputDecoration(labelText: 'Status'),
                  items: const [
                    DropdownMenuItem(value: 'DRAFT', child: Text('Draft')),
                    DropdownMenuItem(value: 'SENT', child: Text('Sent')),
                    DropdownMenuItem(value: 'UNPAID', child: Text('Unpaid')),
                    DropdownMenuItem(value: 'PAID', child: Text('Paid')),
                  ],
                  onChanged: (v) => setState(() => _status = v ?? 'DRAFT'),
                ),
                const SizedBox(height: 24),
                FilledButton(
                  onPressed: _loading ? null : _save,
                  child: Text(_loading ? 'Saving…' : 'Save invoice'),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
