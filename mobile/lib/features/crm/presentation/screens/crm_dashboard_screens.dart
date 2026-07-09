import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../shared/widgets/glass_card.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/utils/file_download.dart';
import '../../data/crm_repository.dart';
import '../providers/crm_providers.dart';
import '../widgets/crm_list_widgets.dart';
import 'revenue_drilldown_screens.dart';

class RevenueDashboardScreen extends ConsumerWidget {
  const RevenueDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboard = ref.watch(revenueDashboardProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Revenue — CEO View')),
      body: CrmDashboardBody(
        asyncValue: dashboard,
        onRefresh: () async => ref.invalidate(revenueDashboardProvider),
        buildContent: (data) {
          final metrics = <MapEntry<String, String>>[
            MapEntry('MRR', formatCurrency(_num(data['mrr'] ?? data['monthlyRecurring']))),
            MapEntry('ARR', formatCurrency(_num(data['arr'] ?? data['annualRecurring']))),
            MapEntry('Revenue', formatCurrency(_num(data['totalRevenue'] ?? data['revenue']))),
            MapEntry('Customers', '${data['activeCustomers'] ?? data['customers'] ?? '—'}'),
            MapEntry('New leads', '${data['newLeads'] ?? '—'}'),
            MapEntry('Conversion', '${data['conversionRate'] ?? data['conversion'] ?? '—'}%'),
          ];
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CrmMetricGrid(metrics: metrics),
              const SizedBox(height: 16),
              GlassCard(
                child: Text(
                  data['summary']?.toString() ?? 'Revenue intelligence synced from LeadEdge360 web.',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ),
              const SizedBox(height: 16),
              Text('Drill-down', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              ListTile(
                leading: const Icon(Icons.people_outline),
                title: const Text('Revenue by customer'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => context.push('/crm/revenue/customers'),
              ),
              ListTile(
                leading: const Icon(Icons.trending_up),
                title: const Text('Monthly trends'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => context.push('/crm/revenue/trends'),
              ),
              ListTile(
                leading: const Icon(Icons.source_outlined),
                title: const Text('Revenue by source'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => context.push('/crm/revenue/source'),
              ),
              ListTile(
                leading: const Icon(Icons.map_outlined),
                title: const Text('Revenue by territory'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => context.push('/crm/revenue/territory'),
              ),
            ],
          );
        },
      ),
    );
  }

  num? _num(dynamic v) => v is num ? v : num.tryParse(v?.toString() ?? '');
}

class SalesDashboardScreen extends ConsumerWidget {
  const SalesDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboard = ref.watch(salesDashboardProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Sales Dashboard')),
      body: CrmDashboardBody(
        asyncValue: dashboard,
        onRefresh: () async => ref.invalidate(salesDashboardProvider),
        buildContent: (data) {
          final stages = data['stages'] as List? ?? data['funnel'] as List? ?? [];
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Lead funnel', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              if (stages.isEmpty)
                const GlassCard(child: Text('Funnel data will appear as leads progress.'))
              else
                ...stages.map((s) {
                  final map = Map<String, dynamic>.from(s as Map);
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: GlassCard(
                      child: ListTile(
                        title: Text(map['stage']?.toString() ?? map['name']?.toString() ?? 'Stage'),
                        trailing: Text('${map['count'] ?? map['value'] ?? 0}'),
                      ),
                    ),
                  );
                }),
            ],
          );
        },
      ),
    );
  }
}

class MarketingDashboardScreen extends ConsumerWidget {
  const MarketingDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboard = ref.watch(marketingDashboardProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Marketing ROI')),
      body: CrmDashboardBody(
        asyncValue: dashboard,
        onRefresh: () async => ref.invalidate(marketingDashboardProvider),
        buildContent: (data) {
          final metrics = <MapEntry<String, String>>[
            MapEntry('Campaigns', '${data['campaigns'] ?? data['totalCampaigns'] ?? '—'}'),
            MapEntry('CPL', formatCurrency(_num(data['cpl'] ?? data['costPerLead']))),
            MapEntry('CAC', formatCurrency(_num(data['cac']))),
            MapEntry('ROI', '${data['roi'] ?? '—'}%'),
          ];
          return CrmMetricGrid(metrics: metrics);
        },
      ),
    );
  }

  num? _num(dynamic v) => v is num ? v : num.tryParse(v?.toString() ?? '');
}

class MarketingCalendarScreen extends ConsumerStatefulWidget {
  const MarketingCalendarScreen({super.key});

  @override
  ConsumerState<MarketingCalendarScreen> createState() => _MarketingCalendarScreenState();
}

class _MarketingCalendarScreenState extends ConsumerState<MarketingCalendarScreen> {
  final _titleCtrl = TextEditingController();
  var _platform = 'linkedin';
  DateTime _scheduleFor = DateTime.now().add(const Duration(days: 1));

  @override
  void dispose() {
    _titleCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickScheduleDate() async {
    final picked = await showDatePicker(
      context: context,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      initialDate: _scheduleFor,
    );
    if (picked != null) setState(() => _scheduleFor = picked);
  }

  Future<void> _createEntry() async {
    final title = _titleCtrl.text.trim();
    if (title.isEmpty) return;
    await ref.read(crmRepositoryProvider).createCalendarEntry(
          title: title,
          platform: _platform,
          scheduledAt: _scheduleFor.toUtc().toIso8601String(),
        );
    ref.invalidate(marketingCalendarProvider);
    if (mounted) Navigator.pop(context);
  }

  Future<void> _reschedule(String id) async {
    final picked = await showDatePicker(
      context: context,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      initialDate: DateTime.now().add(const Duration(days: 1)),
    );
    if (picked == null) return;
    await ref.read(crmRepositoryProvider).updateCalendarEntry(
          id: id,
          scheduledAt: picked.toUtc().toIso8601String(),
        );
    ref.invalidate(marketingCalendarProvider);
  }

  void _showCreateSheet() {
    showModalBottomSheet<void>(
      context: context,
      builder: (ctx) => Padding(
        padding: EdgeInsets.fromLTRB(16, 16, 16, MediaQuery.paddingOf(ctx).bottom + 16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: _titleCtrl, decoration: const InputDecoration(labelText: 'Content title')),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: _platform,
              decoration: const InputDecoration(labelText: 'Platform'),
              items: const [
                DropdownMenuItem(value: 'linkedin', child: Text('LinkedIn')),
                DropdownMenuItem(value: 'instagram', child: Text('Instagram')),
                DropdownMenuItem(value: 'email', child: Text('Email')),
              ],
              onChanged: (v) => setState(() => _platform = v ?? 'linkedin'),
            ),
            const SizedBox(height: 12),
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Schedule date'),
              subtitle: Text(_scheduleFor.toLocal().toString().split(' ').first),
              trailing: const Icon(Icons.calendar_today_outlined),
              onTap: _pickScheduleDate,
            ),
            const SizedBox(height: 16),
            FilledButton(onPressed: _createEntry, child: const Text('Schedule')),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final cal = ref.watch(marketingCalendarProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Marketing Calendar')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showCreateSheet,
        icon: const Icon(Icons.add),
        label: const Text('Schedule'),
      ),
      body: CrmDashboardBody(
        asyncValue: cal,
        onRefresh: () async => ref.invalidate(marketingCalendarProvider),
        buildContent: (data) {
          final items = data['items'] as List? ?? data['events'] as List? ?? [];
          if (items.isEmpty) return const GlassCard(child: Text('No scheduled content.'));
          return Column(
            children: items.map((raw) {
              final item = Map<String, dynamic>.from(raw as Map);
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: GlassCard(
                  child: ListTile(
                    title: Text(item['title']?.toString() ?? item['platform']?.toString() ?? 'Event'),
                    subtitle: Text(item['scheduledAt']?.toString() ?? ''),
                    trailing: PopupMenuButton<String>(
                      onSelected: (value) async {
                        if (value == 'published') {
                          await ref.read(crmRepositoryProvider).updateCalendarEntry(
                                id: item['id'].toString(),
                                status: 'published',
                              );
                          ref.invalidate(marketingCalendarProvider);
                        } else if (value == 'reschedule') {
                          await _reschedule(item['id'].toString());
                        }
                      },
                      itemBuilder: (_) => const [
                        PopupMenuItem(value: 'reschedule', child: Text('Reschedule')),
                        PopupMenuItem(value: 'published', child: Text('Mark published')),
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

class AiInsightsScreen extends ConsumerWidget {
  const AiInsightsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final insights = ref.watch(aiInsightsProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('AI Insights')),
      body: CrmDashboardBody(
        asyncValue: insights,
        onRefresh: () async => ref.invalidate(aiInsightsProvider),
        buildContent: (data) {
          final hot = data['hotLeads'] as List? ?? data['priority'] as List? ?? [];
          final hotCount = data['hot'] ?? data['hotCount'];
          final warmCount = data['warm'] ?? data['warmCount'];
          final coldCount = data['cold'] ?? data['coldCount'];
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (hotCount != null || warmCount != null || coldCount != null)
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    if (hotCount != null) Chip(label: Text('Hot: $hotCount')),
                    if (warmCount != null) Chip(label: Text('Warm: $warmCount')),
                    if (coldCount != null) Chip(label: Text('Cold: $coldCount')),
                  ],
                ),
              const SizedBox(height: 12),
              Text('Priority leads', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              if (hot.isEmpty)
                const GlassCard(child: Padding(padding: EdgeInsets.all(16), child: Text('Run lead scoring from a lead detail or web Command Center.')))
              else
                ...hot.take(15).map((raw) {
                  final item = Map<String, dynamic>.from(raw as Map);
                  final label = item['company']?.toString() ?? item['name']?.toString() ?? item['leadId']?.toString() ?? 'Lead';
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: GlassCard(
                      child: ListTile(
                        title: Text(label),
                        subtitle: Text('${item['classification'] ?? 'scored'} · Score ${item['score'] ?? '—'}'),
                        trailing: item['leadId'] != null ? const Icon(Icons.chevron_right) : null,
                        onTap: item['leadId'] != null
                            ? () => context.push('/leads/${item['leadId']}')
                            : null,
                      ),
                    ),
                  );
                }),
            ],
          );
        },
      ),
    );
  }
}

class ReportsHubScreen extends ConsumerWidget {
  const ReportsHubScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final exports = ref.watch(reportExportsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Reports')),
      floatingActionButton: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          FloatingActionButton.extended(
            heroTag: 'pdf_revenue',
            onPressed: () => _startExport(context, ref, type: 'revenue', exportType: 'pdf', label: 'Revenue PDF'),
            icon: const Icon(Icons.picture_as_pdf_outlined),
            label: const Text('Revenue PDF'),
          ),
          const SizedBox(height: 10),
          FloatingActionButton.extended(
            heroTag: 'pdf_leads',
            onPressed: () => _startExport(context, ref, type: 'leads', exportType: 'pdf', label: 'Leads PDF'),
            icon: const Icon(Icons.picture_as_pdf_outlined),
            label: const Text('Leads PDF'),
          ),
          const SizedBox(height: 10),
          FloatingActionButton.extended(
            heroTag: 'xlsx',
            onPressed: () => _startExport(context, ref, exportType: 'xlsx', label: 'XLSX'),
            icon: const Icon(Icons.table_view_outlined),
            label: const Text('XLSX'),
          ),
          const SizedBox(height: 10),
          FloatingActionButton.extended(
            heroTag: 'csv',
            onPressed: () => _startExport(context, ref, label: 'CSV'),
            icon: const Icon(Icons.download_rounded),
            label: const Text('CSV'),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async => ref.invalidate(reportExportsProvider),
        child: exports.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => ListView(
            padding: const EdgeInsets.all(16),
            children: [Text('Error: $e')],
          ),
          data: (items) => ListView(
            padding: const EdgeInsets.all(16),
            children: [
              const GlassCard(
                child: ListTile(
                  leading: Icon(Icons.table_chart_outlined),
                  title: Text('Sales & leads'),
                  subtitle: Text('Export lead data as CSV for Excel'),
                ),
              ),
              const SizedBox(height: 16),
              Text('Recent exports', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              if (items.isEmpty)
                const GlassCard(child: Padding(padding: EdgeInsets.all(16), child: Text('No exports yet. Tap Export leads CSV.')))
              else
                ...items.map(
                  (job) => Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: GlassCard(
                      child: ListTile(
                        leading: const Icon(Icons.insert_drive_file_outlined),
                        title: Text('${job.type ?? 'leads'} · ${job.status ?? 'pending'}'),
                        subtitle: Text('${job.totalRows ?? 0} rows · ${job.fileSize ?? 0} bytes'),
                        trailing: job.status == 'completed'
                            ? IconButton(
                                icon: const Icon(Icons.download),
                                onPressed: () async {
                                  final bytes = await ref.read(crmRepositoryProvider).downloadReportExport(job.id);
                                  final ext = job.exportType ?? 'csv';
                                  await saveAndOpenBytes(bytes, '${job.type ?? 'leads'}_${job.id}.$ext');
                                },
                              )
                            : null,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

Future<void> _startExport(
  BuildContext context,
  WidgetRef ref, {
  String type = 'leads',
  String exportType = 'csv',
  required String label,
}) async {
  await ref.read(crmRepositoryProvider).createReportExport(type: type, exportType: exportType);
  ref.invalidate(reportExportsProvider);
  if (context.mounted) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$label export started')));
  }
}

class GlobalSearchScreen extends ConsumerStatefulWidget {
  const GlobalSearchScreen({super.key});

  @override
  ConsumerState<GlobalSearchScreen> createState() => _GlobalSearchScreenState();
}

class _GlobalSearchScreenState extends ConsumerState<GlobalSearchScreen> {
  final _ctrl = TextEditingController();
  Map<String, dynamic>? _results;
  bool _loading = false;

  Future<void> _search() async {
    final q = _ctrl.text.trim();
    if (q.isEmpty) return;
    setState(() => _loading = true);
    try {
      final repo = CrmRepository(ref.read(dioProvider));
      final data = await repo.globalSearch(q);
      setState(() => _results = data);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Search')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: _ctrl,
              decoration: InputDecoration(
                hintText: 'Search leads, customers, deals…',
                suffixIcon: IconButton(icon: const Icon(Icons.search), onPressed: _search),
              ),
              onSubmitted: (_) => _search(),
            ),
            if (_loading) const LinearProgressIndicator(),
            Expanded(
              child: _results == null
                  ? const Center(child: Text('Enter a query'))
                  : ListView(
                      children: [
                        for (final key in _results!.keys)
                          if (_results![key] is List && (_results![key] as List).isNotEmpty) ...[
                            Padding(
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              child: Text(key.toString().toUpperCase(), style: Theme.of(context).textTheme.labelLarge),
                            ),
                            ...(_results![key] as List).map((e) {
                              final map = Map<String, dynamic>.from(e as Map);
                              return GlassCard(
                                child: ListTile(
                                  title: Text(map['name']?.toString() ?? map['title']?.toString() ?? 'Result'),
                                  subtitle: Text(map['company']?.toString() ?? map['email']?.toString() ?? ''),
                                ),
                              );
                            }),
                          ],
                      ],
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
