import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../shared/widgets/glass_card.dart';
import '../../data/crm_repository.dart';
import '../../domain/crm_models.dart';
import '../providers/crm_providers.dart';

class CreateTerritoryScreen extends ConsumerStatefulWidget {
  const CreateTerritoryScreen({super.key});

  @override
  ConsumerState<CreateTerritoryScreen> createState() => _CreateTerritoryScreenState();
}

class _CreateTerritoryScreenState extends ConsumerState<CreateTerritoryScreen> {
  final _nameCtrl = TextEditingController();
  final _regionCtrl = TextEditingController();
  final _managerCtrl = TextEditingController();
  var _loading = false;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _regionCtrl.dispose();
    _managerCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_nameCtrl.text.trim().isEmpty) return;
    setState(() => _loading = true);
    try {
      await ref.read(crmRepositoryProvider).createTerritory(
            name: _nameCtrl.text.trim(),
            region: _regionCtrl.text.trim(),
            manager: _managerCtrl.text.trim(),
          );
      ref.invalidate(territoriesProvider);
      if (mounted) context.pop(true);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('New territory')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(controller: _nameCtrl, decoration: const InputDecoration(labelText: 'Territory name')),
            const SizedBox(height: 12),
            TextField(controller: _regionCtrl, decoration: const InputDecoration(labelText: 'Region')),
            const SizedBox(height: 12),
            TextField(controller: _managerCtrl, decoration: const InputDecoration(labelText: 'Manager')),
            const Spacer(),
            FilledButton(
              onPressed: _loading ? null : _submit,
              child: Text(_loading ? 'Creating…' : 'Create territory'),
            ),
          ],
        ),
      ),
    );
  }
}

class TerritoryDetailScreen extends ConsumerStatefulWidget {
  const TerritoryDetailScreen({super.key, required this.territoryId});

  final String territoryId;

  @override
  ConsumerState<TerritoryDetailScreen> createState() => _TerritoryDetailScreenState();
}

class _TerritoryDetailScreenState extends ConsumerState<TerritoryDetailScreen> {
  final _regionCtrl = TextEditingController();
  final _managerCtrl = TextEditingController();
  var _initialized = false;
  var _saving = false;
  CrmTerritory? _territory;

  @override
  void dispose() {
    _regionCtrl.dispose();
    _managerCtrl.dispose();
    super.dispose();
  }

  void _init(CrmTerritory t) {
    if (_initialized) return;
    _territory = t;
    _regionCtrl.text = t.region ?? '';
    _managerCtrl.text = t.manager ?? '';
    _initialized = true;
  }

  Future<void> _save() async {
    if (_territory == null) return;
    setState(() => _saving = true);
    try {
      await ref.read(crmRepositoryProvider).patchTerritory(widget.territoryId, {
        'region': _regionCtrl.text.trim(),
        'manager': _managerCtrl.text.trim(),
      });
      ref.invalidate(territoriesProvider);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Territory updated')));
        context.pop();
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final territories = ref.watch(territoriesProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Edit territory')),
      body: territories.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (items) {
          CrmTerritory? t;
          for (final item in items) {
            if (item.id == widget.territoryId) {
              t = item;
              break;
            }
          }
          if (t == null) return const Center(child: Text('Territory not found'));
          _init(t);
          return Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                GlassCard(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(t.name, style: Theme.of(context).textTheme.titleLarge),
                      if (t.leadCount != null) ...[
                        const SizedBox(height: 8),
                        Text('${t.leadCount} leads', style: const TextStyle(color: AppColors.slate500)),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                TextField(controller: _regionCtrl, decoration: const InputDecoration(labelText: 'Region')),
                const SizedBox(height: 12),
                TextField(controller: _managerCtrl, decoration: const InputDecoration(labelText: 'Manager')),
                const Spacer(),
                FilledButton(
                  onPressed: _saving ? null : _save,
                  child: Text(_saving ? 'Saving…' : 'Save changes'),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class CreateCampaignScreen extends ConsumerStatefulWidget {
  const CreateCampaignScreen({super.key});

  @override
  ConsumerState<CreateCampaignScreen> createState() => _CreateCampaignScreenState();
}

class _CreateCampaignScreenState extends ConsumerState<CreateCampaignScreen> {
  final _nameCtrl = TextEditingController();
  var _channel = 'email';
  DateTime? _scheduledAt;
  var _loading = false;

  @override
  void dispose() {
    _nameCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _scheduledAt ?? now.add(const Duration(days: 1)),
      firstDate: now,
      lastDate: now.add(const Duration(days: 365)),
    );
    if (picked != null) setState(() => _scheduledAt = picked);
  }

  Future<void> _submit() async {
    if (_nameCtrl.text.trim().isEmpty) return;
    setState(() => _loading = true);
    try {
      final campaign = await ref.read(crmRepositoryProvider).createCampaign(
            name: _nameCtrl.text.trim(),
            channel: _channel,
            scheduledAt: _scheduledAt?.toUtc().toIso8601String(),
          );
      ref.invalidate(campaignsProvider);
      if (mounted) context.go('/crm/campaigns/${campaign.id}');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('New campaign')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(controller: _nameCtrl, decoration: const InputDecoration(labelText: 'Campaign name')),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: _channel,
              decoration: const InputDecoration(labelText: 'Channel'),
              items: const [
                DropdownMenuItem(value: 'email', child: Text('Email')),
                DropdownMenuItem(value: 'whatsapp', child: Text('WhatsApp')),
                DropdownMenuItem(value: 'sms', child: Text('SMS')),
              ],
              onChanged: (v) => setState(() => _channel = v ?? 'email'),
            ),
            const SizedBox(height: 12),
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Schedule (optional)'),
              subtitle: Text(
                _scheduledAt == null
                    ? 'Not scheduled'
                    : DateFormat.yMMMd().add_jm().format(_scheduledAt!.toLocal()),
              ),
              trailing: IconButton(
                icon: const Icon(Icons.calendar_today_outlined),
                onPressed: _pickDate,
              ),
            ),
            const Spacer(),
            FilledButton(
              onPressed: _loading ? null : _submit,
              child: Text(_loading ? 'Creating…' : 'Create campaign'),
            ),
          ],
        ),
      ),
    );
  }
}

class CampaignDetailScreen extends ConsumerStatefulWidget {
  const CampaignDetailScreen({super.key, required this.campaignId});

  final String campaignId;

  @override
  ConsumerState<CampaignDetailScreen> createState() => _CampaignDetailScreenState();
}

class _CampaignDetailScreenState extends ConsumerState<CampaignDetailScreen> {
  var _busy = false;

  Future<void> _run(Future<void> Function() fn) async {
    setState(() => _busy = true);
    try {
      await fn();
      ref.invalidate(campaignDetailProvider(widget.campaignId));
      ref.invalidate(campaignsProvider);
      ref.invalidate(campaignAnalyticsProvider(widget.campaignId));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final detail = ref.watch(campaignDetailProvider(widget.campaignId));
    final analytics = ref.watch(campaignAnalyticsProvider(widget.campaignId));
    final templates = ref.watch(emailTemplatesProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Campaign')),
      body: detail.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (c) {
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              GlassCard(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(c.name, style: Theme.of(context).textTheme.headlineSmall),
                    const SizedBox(height: 12),
                    _row('Channel', c.channel ?? 'email'),
                    _row('Status', c.status ?? 'draft'),
                    if (c.templateId != null) _row('Template', c.templateId!),
                    if (c.scheduledAt != null)
                      _row('Scheduled', DateFormat.yMMMd().add_jm().format(DateTime.parse(c.scheduledAt!).toLocal())),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              analytics.when(
                loading: () => const SizedBox.shrink(),
                error: (_, __) => const SizedBox.shrink(),
                data: (a) {
                  if (a.isEmpty) return const SizedBox.shrink();
                  return GlassCard(
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Analytics', style: Theme.of(context).textTheme.titleMedium),
                        const SizedBox(height: 8),
                        _row('Executions', '${a['totalExecutions'] ?? 0}'),
                        _row('Messages', '${a['totalMessages'] ?? 0}'),
                        _row('Success rate', '${a['executionSuccessRate'] ?? 0}%'),
                      ],
                    ),
                  );
                },
              ),
              const SizedBox(height: 16),
              Text('Email template', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              templates.when(
                loading: () => const LinearProgressIndicator(),
                error: (e, _) => Text('Templates: $e'),
                data: (items) {
                  if (items.isEmpty) {
                    return const Text('No email templates — create one on web first.');
                  }
                  return Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: items.map((t) {
                      final id = t['id']?.toString() ?? '';
                      final selected = c.templateId == id;
                      return FilterChip(
                        label: Text(t['name']?.toString() ?? 'Template'),
                        selected: selected,
                        onSelected: _busy || selected
                            ? null
                            : (_) => _run(() async {
                                  await ref.read(crmRepositoryProvider).attachCampaignTemplate(widget.campaignId, id);
                                }),
                      );
                    }).toList(),
                  );
                },
              ),
              Text('Status', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: ['draft', 'scheduled', 'running', 'completed'].map((status) {
                  final selected = (c.status ?? 'draft').toLowerCase() == status;
                  return FilterChip(
                    label: Text(status),
                    selected: selected,
                    onSelected: selected || _busy
                        ? null
                        : (_) => _run(() async {
                              await ref.read(crmRepositoryProvider).patchCampaign(widget.campaignId, {
                                'status': status,
                              });
                            }),
                  );
                }).toList(),
              ),
              const SizedBox(height: 24),
              if ((c.status ?? 'draft') == 'draft' || (c.status ?? '') == 'scheduled')
                FilledButton.icon(
                  onPressed: _busy
                      ? null
                      : () => _run(() async {
                            await ref.read(crmRepositoryProvider).executeCampaign(widget.campaignId);
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Campaign execution started')),
                              );
                            }
                          }),
                  icon: const Icon(Icons.play_arrow_rounded),
                  label: const Text('Execute campaign'),
                ),
            ],
          );
        },
      ),
    );
  }

  Widget _row(String label, String value) {
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
