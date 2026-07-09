import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/app_colors.dart';
import '../../data/crm_repository.dart';
import '../../domain/crm_models.dart';
import '../providers/crm_providers.dart';
import '../widgets/invoice_line_items_editor.dart';

class WhatsAppThreadScreen extends ConsumerStatefulWidget {
  const WhatsAppThreadScreen({super.key, required this.threadId, required this.contactName});

  final String threadId;
  final String contactName;

  @override
  ConsumerState<WhatsAppThreadScreen> createState() => _WhatsAppThreadScreenState();
}

class _WhatsAppThreadScreenState extends ConsumerState<WhatsAppThreadScreen> {
  final _ctrl = TextEditingController();
  var _sending = false;

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    final text = _ctrl.text.trim();
    if (text.isEmpty || _sending) return;
    setState(() => _sending = true);
    try {
      await ref.read(crmRepositoryProvider).sendWhatsAppMessage(widget.threadId, text);
      _ctrl.clear();
      ref.invalidate(whatsappMessagesProvider(widget.threadId));
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  Future<void> _openTemplateComposer() async {
    final templates = await ref.read(crmRepositoryProvider).fetchWhatsAppTemplates();
    if (!mounted) return;
    final paramCtrls = <TextEditingController>[];

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (ctx) {
        Map<String, dynamic>? selected = templates.isNotEmpty ? templates.first : null;
        return StatefulBuilder(
          builder: (context, setSheetState) {
            void selectTemplate(Map<String, dynamic> tpl) {
              for (final c in paramCtrls) {
                c.dispose();
              }
              paramCtrls.clear();
              final params = (tpl['params'] as List?)?.map((e) => e.toString()).toList() ?? [];
              for (final _ in params) {
                paramCtrls.add(TextEditingController());
              }
              setSheetState(() => selected = tpl);
            }

            if (selected != null && paramCtrls.isEmpty) {
              selectTemplate(selected!);
            }

            return Padding(
              padding: EdgeInsets.only(
                left: 16,
                right: 16,
                top: 16,
                bottom: MediaQuery.viewInsetsOf(context).bottom + 16,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text('Send template', style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<Map<String, dynamic>>(
                    value: selected,
                    items: templates
                        .map(
                          (t) => DropdownMenuItem(
                            value: t,
                            child: Text(t['label']?.toString() ?? t['name']?.toString() ?? 'Template'),
                          ),
                        )
                        .toList(),
                    onChanged: (tpl) {
                      if (tpl != null) selectTemplate(tpl);
                    },
                  ),
                  if (selected != null) ...[
                    const SizedBox(height: 8),
                    Text(
                      selected!['body']?.toString() ?? '',
                      style: const TextStyle(color: AppColors.slate500, fontSize: 13),
                    ),
                    const SizedBox(height: 12),
                    ...List.generate(paramCtrls.length, (i) {
                      final label = ((selected!['params'] as List?)?[i]?.toString()) ?? 'Value ${i + 1}';
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: TextField(
                          controller: paramCtrls[i],
                          decoration: InputDecoration(labelText: label, border: const OutlineInputBorder()),
                        ),
                      );
                    }),
                  ],
                  const SizedBox(height: 8),
                  FilledButton(
                    onPressed: _sending || selected == null
                        ? null
                        : () async {
                            setState(() => _sending = true);
                            try {
                              await ref.read(crmRepositoryProvider).sendWhatsAppTemplate(
                                    widget.threadId,
                                    templateName: selected!['name']?.toString() ?? '',
                                    params: paramCtrls.map((c) => c.text.trim()).toList(),
                                  );
                              ref.invalidate(whatsappMessagesProvider(widget.threadId));
                              if (context.mounted) Navigator.pop(ctx);
                            } finally {
                              if (mounted) setState(() => _sending = false);
                            }
                          },
                    child: const Text('Send template'),
                  ),
                ],
              ),
            );
          },
        );
      },
    );

    for (final c in paramCtrls) {
      c.dispose();
    }
  }

  @override
  Widget build(BuildContext context) {
    final messages = ref.watch(whatsappMessagesProvider(widget.threadId));

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.contactName),
        actions: [
          IconButton(
            tooltip: 'Templates',
            onPressed: _sending ? null : _openTemplateComposer,
            icon: const Icon(Icons.article_outlined),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: messages.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Error: $e')),
              data: (items) => ListView.builder(
                padding: const EdgeInsets.all(12),
                itemCount: items.length,
                itemBuilder: (context, i) {
                  final m = items[i];
                  return Align(
                    alignment: m.isOutbound ? Alignment.centerRight : Alignment.centerLeft,
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      constraints: BoxConstraints(maxWidth: MediaQuery.sizeOf(context).width * 0.78),
                      decoration: BoxDecoration(
                        color: m.isOutbound
                            ? AppColors.primaryBlue.withValues(alpha: 0.12)
                            : AppColors.surfaceMuted,
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Text(m.body),
                    ),
                  );
                },
              ),
            ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _ctrl,
                      decoration: const InputDecoration(
                        hintText: 'Type a WhatsApp message…',
                        border: OutlineInputBorder(),
                      ),
                      textInputAction: TextInputAction.send,
                      onSubmitted: (_) => _send(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton.filled(
                    onPressed: _sending ? null : _send,
                    icon: _sending
                        ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                        : const Icon(Icons.send_rounded),
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

class CreateProposalScreen extends ConsumerStatefulWidget {
  const CreateProposalScreen({super.key});

  @override
  ConsumerState<CreateProposalScreen> createState() => _CreateProposalScreenState();
}

class _CreateProposalScreenState extends ConsumerState<CreateProposalScreen> {
  final _clientCtrl = TextEditingController();
  final _companyCtrl = TextEditingController();
  final _amountCtrl = TextEditingController(text: '50000');
  var _loading = false;

  @override
  void dispose() {
    _clientCtrl.dispose();
    _companyCtrl.dispose();
    _amountCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final amount = double.tryParse(_amountCtrl.text.trim()) ?? 0;
    if (_clientCtrl.text.trim().isEmpty || amount <= 0) return;
    setState(() => _loading = true);
    try {
      await ref.read(crmRepositoryProvider).createProposal(
            clientName: _clientCtrl.text.trim(),
            company: _companyCtrl.text.trim(),
            subtotal: amount,
          );
      ref.invalidate(proposalsProvider);
      if (mounted) Navigator.pop(context, true);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('New proposal')),
      body: Padding(
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
              decoration: const InputDecoration(labelText: 'Subtotal (INR)', helperText: 'GST 18% applied automatically'),
            ),
            const Spacer(),
            FilledButton(
              onPressed: _loading ? null : _submit,
              child: Text(_loading ? 'Creating…' : 'Create proposal'),
            ),
          ],
        ),
      ),
    );
  }
}

class CreateInvoiceScreen extends ConsumerStatefulWidget {
  const CreateInvoiceScreen({super.key});

  @override
  ConsumerState<CreateInvoiceScreen> createState() => _CreateInvoiceScreenState();
}

class _CreateInvoiceScreenState extends ConsumerState<CreateInvoiceScreen> {
  final _clientCtrl = TextEditingController();
  final _companyCtrl = TextEditingController();
  final _lineRows = [InvoiceLineItemRow(name: 'Professional services', rate: '50000')];
  var _loading = false;

  @override
  void dispose() {
    _clientCtrl.dispose();
    _companyCtrl.dispose();
    for (final row in _lineRows) {
      row.dispose();
    }
    super.dispose();
  }

  Future<void> _submit() async {
    final items = _lineRows.map((r) => r.toLineItem()).whereType<CrmInvoiceLineItem>().toList();
    if (_clientCtrl.text.trim().isEmpty || items.isEmpty) return;
    setState(() => _loading = true);
    try {
      await ref.read(crmRepositoryProvider).createInvoice(
            clientName: _clientCtrl.text.trim(),
            company: _companyCtrl.text.trim(),
            subtotal: items.fold<double>(0, (s, i) => s + i.amount),
            items: items,
          );
      ref.invalidate(invoicesProvider);
      if (mounted) Navigator.pop(context, true);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('New GST invoice')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(controller: _clientCtrl, decoration: const InputDecoration(labelText: 'Client name')),
            const SizedBox(height: 12),
            TextField(controller: _companyCtrl, decoration: const InputDecoration(labelText: 'Company')),
            const SizedBox(height: 16),
            InvoiceLineItemsEditor(
              rows: _lineRows,
              onChanged: () => setState(() {}),
            ),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: _loading ? null : _submit,
              child: Text(_loading ? 'Creating…' : 'Create invoice'),
            ),
          ],
        ),
      ),
    );
  }
}
