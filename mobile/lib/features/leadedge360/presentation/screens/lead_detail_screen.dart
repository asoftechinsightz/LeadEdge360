import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import 'package:file_picker/file_picker.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/file_download.dart';
import '../../../../shared/widgets/glass_card.dart';
import '../../../../shared/utils/mutation_feedback.dart';
import '../../../../shared/widgets/primary_button.dart';
import '../../../ai/presentation/widgets/lead_ai_panel.dart';
import '../../../crm/presentation/providers/crm_providers.dart';
import '../../data/leads_repository.dart';
import '../../domain/models/lead_models.dart';
import '../providers/leads_providers.dart';
import '../widgets/lead_score_badge.dart';
import '../widgets/lead_status_chip.dart';

class LeadDetailScreen extends ConsumerStatefulWidget {
  const LeadDetailScreen({super.key, required this.leadId});

  final String leadId;

  @override
  ConsumerState<LeadDetailScreen> createState() => _LeadDetailScreenState();
}

class _LeadDetailScreenState extends ConsumerState<LeadDetailScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabs;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 6, vsync: this);
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  Future<void> _refresh() async {
    ref.invalidate(leadDetailProvider(widget.leadId));
    await ref.read(leadDetailProvider(widget.leadId).future);
  }

  @override
  Widget build(BuildContext context) {
    final detailAsync = ref.watch(leadDetailProvider(widget.leadId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Lead details'),
        bottom: TabBar(
          controller: _tabs,
          isScrollable: true,
          tabs: const [
            Tab(text: 'Overview'),
            Tab(text: 'Timeline'),
            Tab(text: 'Notes'),
            Tab(text: 'Follow-ups'),
            Tab(text: 'Tasks'),
            Tab(text: 'Files'),
          ],
        ),
      ),
      body: detailAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (bundle) => RefreshIndicator(
          onRefresh: _refresh,
          child: TabBarView(
            controller: _tabs,
            children: [
              _OverviewTab(bundle: bundle, leadId: widget.leadId, onChanged: _refresh),
              _TimelineTab(entries: bundle.timeline),
              _NotesTab(bundle: bundle, leadId: widget.leadId, onAdded: _refresh),
              _FollowUpsTab(bundle: bundle, leadId: widget.leadId, onAdded: _refresh),
              _TasksTab(bundle: bundle, leadId: widget.leadId, onAdded: _refresh),
              _AttachmentsTab(bundle: bundle, leadId: widget.leadId, onChanged: _refresh),
            ],
          ),
        ),
      ),
    );
  }
}

class _OverviewTab extends ConsumerWidget {
  const _OverviewTab({required this.bundle, required this.leadId, required this.onChanged});

  final LeadDetailBundle bundle;
  final String leadId;
  final Future<void> Function() onChanged;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final lead = bundle.lead;

    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        GlassCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(lead.name, style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontSize: 22)),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  LeadStatusChip(status: lead.status),
                  if (lead.score > 0) LeadScoreBadge(score: lead.score, label: lead.label),
                ],
              ),
              const SizedBox(height: 16),
              _InfoRow(icon: Icons.phone, label: lead.phone.isEmpty ? '—' : lead.phone),
              _InfoRow(icon: Icons.email_outlined, label: lead.email.isEmpty ? '—' : lead.email),
              _InfoRow(icon: Icons.business, label: lead.company.isEmpty ? '—' : lead.company),
              _TerritoryPickerRow(
                leadId: leadId,
                current: lead.territory,
                onChanged: onChanged,
              ),
              _InfoRow(icon: Icons.source_outlined, label: lead.source.isEmpty ? '—' : lead.source),
              _InfoRow(icon: Icons.person_outline, label: lead.assignedTo.isEmpty ? 'Unassigned' : lead.assignedTo),
            ],
          ),
        ),
        const SizedBox(height: 16),
        LeadAiPanel(
          lead: lead,
          onScored: onChanged,
          onNoteAdded: onChanged,
        ),
        const SizedBox(height: 16),
        Text('Update status', style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: LeadFilters.statuses.where((s) => s != 'all').map((status) {
            return ActionChip(
              label: Text(status),
              backgroundColor: status == lead.status
                  ? AppColors.primaryBlue.withValues(alpha: 0.25)
                  : null,
              onPressed: status == lead.status
                  ? null
                  : () async {
                      final result =
                          await ref.read(leadsRepositoryProvider).updateLeadStatus(leadId, status);
                      await onChanged();
                      if (context.mounted) {
                        showMutationSnackBar(context, result);
                        if (!result.queued) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Status → $status')),
                          );
                        }
                      }
                    },
            );
          }).toList(),
        ),
      ],
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Icon(icon, size: 18, color: AppColors.slate400),
          const SizedBox(width: 10),
          Expanded(child: Text(label)),
        ],
      ),
    );
  }
}

class _TerritoryPickerRow extends ConsumerWidget {
  const _TerritoryPickerRow({
    required this.leadId,
    required this.current,
    required this.onChanged,
  });

  final String leadId;
  final String current;
  final Future<void> Function() onChanged;

  Future<void> _pick(BuildContext context, WidgetRef ref) async {
    final territories = await ref.read(territoriesProvider.future);
    if (!context.mounted || territories.isEmpty) return;
    final picked = await showModalBottomSheet<String>(
      context: context,
      builder: (ctx) => SafeArea(
        child: ListView(
          shrinkWrap: true,
          children: [
            const ListTile(title: Text('Assign territory', style: TextStyle(fontWeight: FontWeight.w600))),
            ...territories.map(
              (t) => ListTile(
                leading: const Icon(Icons.place_outlined),
                title: Text(t.name),
                subtitle: t.region != null ? Text(t.region!) : null,
                selected: t.name == current,
                onTap: () => Navigator.pop(ctx, t.name),
              ),
            ),
          ],
        ),
      ),
    );
    if (picked == null || picked == current) return;
    final result = await ref.read(leadsRepositoryProvider).updateLeadTerritory(leadId, picked);
    await onChanged();
    if (context.mounted) {
      showMutationSnackBar(context, result);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Territory → $picked')));
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return InkWell(
      onTap: () => _pick(context, ref),
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Row(
          children: [
            const Icon(Icons.place_outlined, size: 18, color: AppColors.slate400),
            const SizedBox(width: 10),
            Expanded(child: Text(current.isEmpty ? 'Assign territory' : current)),
            const Icon(Icons.chevron_right, size: 18, color: AppColors.slate400),
          ],
        ),
      ),
    );
  }
}

class _TimelineTab extends StatelessWidget {
  const _TimelineTab({required this.entries});

  final List<TimelineEntry> entries;

  @override
  Widget build(BuildContext context) {
    if (entries.isEmpty) {
      return const Center(child: Text('No timeline activity', style: TextStyle(color: AppColors.slate400)));
    }
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: entries.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (context, i) {
        final e = entries[i];
        return GlassCard(
          padding: const EdgeInsets.all(14),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 8,
                height: 8,
                margin: const EdgeInsets.only(top: 6),
                decoration: const BoxDecoration(color: AppColors.cyan, shape: BoxShape.circle),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(e.title, style: const TextStyle(fontWeight: FontWeight.w600)),
                    if (e.description.isNotEmpty)
                      Text(e.description, style: const TextStyle(color: AppColors.slate400, fontSize: 12)),
                    if (e.createdAt != null)
                      Text(
                        DateFormat.yMMMd().add_jm().format(e.createdAt!.toLocal()),
                        style: const TextStyle(color: AppColors.slate500, fontSize: 11),
                      ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _NotesTab extends ConsumerStatefulWidget {
  const _NotesTab({required this.bundle, required this.leadId, required this.onAdded});

  final LeadDetailBundle bundle;
  final String leadId;
  final Future<void> Function() onAdded;

  @override
  ConsumerState<_NotesTab> createState() => _NotesTabState();
}

class _NotesTabState extends ConsumerState<_NotesTab> {
  final _ctrl = TextEditingController();
  var _saving = false;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: widget.bundle.notes.isEmpty
              ? const Center(child: Text('No notes yet', style: TextStyle(color: AppColors.slate400)))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: widget.bundle.notes.length,
                  itemBuilder: (context, i) {
                    final n = widget.bundle.notes[i];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: GlassCard(
                        padding: const EdgeInsets.all(14),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(n.note),
                            if (n.createdAt != null)
                              Text(
                                DateFormat.yMMMd().add_jm().format(n.createdAt!.toLocal()),
                                style: const TextStyle(color: AppColors.slate500, fontSize: 11),
                              ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
        ),
        Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _ctrl,
                  decoration: const InputDecoration(hintText: 'Add a note…'),
                  minLines: 1,
                  maxLines: 3,
                ),
              ),
              const SizedBox(width: 8),
              IconButton.filled(
                onPressed: _saving
                    ? null
                    : () async {
                        final text = _ctrl.text.trim();
                        if (text.isEmpty) return;
                        setState(() => _saving = true);
                        try {
                          final result =
                              await ref.read(leadsRepositoryProvider).addNote(widget.leadId, text);
                          _ctrl.clear();
                          await widget.onAdded();
                          if (mounted) showMutationSnackBar(context, result);
                        } finally {
                          if (mounted) setState(() => _saving = false);
                        }
                      },
                icon: _saving
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                    : const Icon(Icons.send),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _FollowUpsTab extends ConsumerWidget {
  const _FollowUpsTab({required this.bundle, required this.leadId, required this.onAdded});

  final LeadDetailBundle bundle;
  final String leadId;
  final Future<void> Function() onAdded;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Column(
      children: [
        Expanded(
          child: bundle.followups.isEmpty
              ? const Center(child: Text('No follow-ups', style: TextStyle(color: AppColors.slate400)))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: bundle.followups.length,
                  itemBuilder: (context, i) {
                    final f = bundle.followups[i];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: GlassCard(
                        padding: const EdgeInsets.all(14),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(f.title, style: const TextStyle(fontWeight: FontWeight.w600)),
                            if (f.dueAt != null)
                              Text(
                                'Due ${DateFormat.yMMMd().add_jm().format(f.dueAt!.toLocal())}',
                                style: const TextStyle(color: AppColors.retailOrange, fontSize: 12),
                              ),
                            Text(f.status, style: const TextStyle(color: AppColors.slate400, fontSize: 11)),
                          ],
                        ),
                      ),
                    );
                  },
                ),
        ),
        Padding(
          padding: const EdgeInsets.all(16),
          child: PrimaryButton(
            label: 'Schedule follow-up (24h)',
            icon: Icons.event,
            onPressed: () async {
              final result = await ref.read(leadsRepositoryProvider).addFollowUp(
                    leadId,
                    title: 'Follow-up call',
                    dueAt: DateTime.now().add(const Duration(hours: 24)),
                  );
              await onAdded();
              if (context.mounted) showMutationSnackBar(context, result);
            },
          ),
        ),
      ],
    );
  }
}

class _TasksTab extends ConsumerWidget {
  const _TasksTab({required this.bundle, required this.leadId, required this.onAdded});

  final LeadDetailBundle bundle;
  final String leadId;
  final Future<void> Function() onAdded;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Column(
      children: [
        Expanded(
          child: bundle.tasks.isEmpty
              ? const Center(child: Text('No tasks', style: TextStyle(color: AppColors.slate400)))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: bundle.tasks.length,
                  itemBuilder: (context, i) {
                    final t = bundle.tasks[i];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: GlassCard(
                        padding: const EdgeInsets.all(14),
                        child: Row(
                          children: [
                            Icon(
                              t.status == 'open' ? Icons.radio_button_unchecked : Icons.check_circle,
                              color: t.status == 'open' ? AppColors.slate400 : AppColors.leadedgeGreen,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(t.title, style: const TextStyle(fontWeight: FontWeight.w600)),
                                  if (t.description.isNotEmpty)
                                    Text(t.description, style: const TextStyle(color: AppColors.slate400, fontSize: 12)),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
        ),
        Padding(
          padding: const EdgeInsets.all(16),
          child: PrimaryButton(
            label: 'Add call task',
            icon: Icons.add_task,
            onPressed: () async {
              final result = await ref.read(leadsRepositoryProvider).addTask(
                    leadId,
                    title: 'Call lead',
                    description: 'Outbound follow-up from mobile',
                  );
              await onAdded();
              if (context.mounted) showMutationSnackBar(context, result);
            },
          ),
        ),
      ],
    );
  }
}

class _AttachmentsTab extends ConsumerStatefulWidget {
  const _AttachmentsTab({required this.bundle, required this.leadId, required this.onChanged});

  final LeadDetailBundle bundle;
  final String leadId;
  final Future<void> Function() onChanged;

  @override
  ConsumerState<_AttachmentsTab> createState() => _AttachmentsTabState();
}

class _AttachmentsTabState extends ConsumerState<_AttachmentsTab> {
  var _uploading = false;
  var _downloadingId = '';

  static const _maxBytes = 5 * 1024 * 1024;

  Future<void> _upload() async {
    if (_uploading) return;
    final picked = await FilePicker.platform.pickFiles(withData: false);
    final file = picked?.files.single;
    final path = file?.path;
    final name = file?.name;
    if (path == null || name == null || file == null) return;
    if ((file.size ?? 0) > _maxBytes) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('File too large (max 5 MB)')),
        );
      }
      return;
    }
    setState(() => _uploading = true);
    try {
      await ref.read(leadsRepositoryProvider).uploadLeadAttachment(widget.leadId, path, name);
      await widget.onChanged();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('File uploaded')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Upload failed: $e')));
      }
    } finally {
      if (mounted) setState(() => _uploading = false);
    }
  }

  Future<void> _download(LeadAttachment file) async {
    setState(() => _downloadingId = file.id);
    try {
      final bytes = await ref.read(leadsRepositoryProvider).downloadLeadAttachment(widget.leadId, file.id);
      await saveAndOpenBytes(bytes, file.fileName);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Download failed: $e')));
      }
    } finally {
      if (mounted) setState(() => _downloadingId = '');
    }
  }

  Future<void> _delete(LeadAttachment file) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Remove file?'),
        content: Text('Delete ${file.fileName}?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Delete')),
        ],
      ),
    );
    if (ok != true) return;
    try {
      await ref.read(leadsRepositoryProvider).deleteLeadAttachment(widget.leadId, file.id);
      await widget.onChanged();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Attachment removed')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Delete failed: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: widget.bundle.attachments.isEmpty
              ? const Center(child: Text('No files attached yet.'))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: widget.bundle.attachments.length,
                  itemBuilder: (context, i) {
                    final file = widget.bundle.attachments[i];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: GlassCard(
                        child: ListTile(
                          leading: const Icon(Icons.attach_file),
                          title: Text(file.fileName),
                          subtitle: Text('${file.mimeType ?? ''}${file.size != null ? ' · ${file.size} bytes' : ''}'),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              if (_downloadingId == file.id)
                                const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2))
                              else
                                IconButton(
                                  icon: const Icon(Icons.download_outlined),
                                  onPressed: () => _download(file),
                                ),
                              IconButton(
                                icon: const Icon(Icons.delete_outline),
                                onPressed: () => _delete(file),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
        ),
        Padding(
          padding: const EdgeInsets.all(16),
          child: PrimaryButton(
            label: _uploading ? 'Uploading…' : 'Upload file',
            icon: Icons.upload_file,
            isLoading: _uploading,
            onPressed: _uploading ? null : _upload,
          ),
        ),
      ],
    );
  }
}
