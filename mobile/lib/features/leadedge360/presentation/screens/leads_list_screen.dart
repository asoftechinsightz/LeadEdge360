import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../shared/utils/mutation_feedback.dart';
import '../../../../shared/widgets/empty_state.dart';
import '../../../../shared/widgets/filter_chip_row.dart';
import '../../../../shared/widgets/offline_banner.dart';
import '../../../../shared/widgets/primary_button.dart';
import '../../data/leads_repository.dart';
import '../../domain/models/lead_models.dart';
import '../providers/leads_providers.dart';
import '../widgets/lead_list_tile.dart';

class LeadsListScreen extends ConsumerStatefulWidget {
  const LeadsListScreen({super.key});

  @override
  ConsumerState<LeadsListScreen> createState() => _LeadsListScreenState();
}

class _LeadsListScreenState extends ConsumerState<LeadsListScreen> {
  final _searchCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();

  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(leadsListProvider.notifier).load(refresh: true));
    _scrollCtrl.addListener(_onScroll);
  }

  void _onScroll() {
    if (_scrollCtrl.position.pixels >= _scrollCtrl.position.maxScrollExtent - 200) {
      ref.read(leadsListProvider.notifier).loadMore();
    }
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(leadsListProvider);
    final muted = Theme.of(context).brightness == Brightness.dark
        ? AppColors.slate400
        : AppColors.slate500;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const OfflineBanner(),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
          child: TextField(
            controller: _searchCtrl,
            decoration: InputDecoration(
              hintText: 'Search name, company, phone…',
              prefixIcon: const Icon(Icons.search),
              suffixIcon: _searchCtrl.text.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear),
                      onPressed: () {
                        _searchCtrl.clear();
                        ref.read(leadsListProvider.notifier).setSearch('');
                      },
                    )
                  : null,
            ),
            onChanged: ref.read(leadsListProvider.notifier).setSearch,
            onSubmitted: ref.read(leadsListProvider.notifier).setSearch,
          ),
        ),
        FilterChipRow(
          options: LeadFilters.statuses,
          selected: state.query.status,
          labelBuilder: (s) => s == 'all' ? 'All status' : s,
          onSelected: ref.read(leadsListProvider.notifier).setStatusFilter,
        ),
        FilterChipRow(
          options: LeadFilters.labels,
          selected: state.query.label,
          labelBuilder: (l) => l == 'all' ? 'All labels' : l,
          onSelected: ref.read(leadsListProvider.notifier).setLabelFilter,
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 4, 16, 0),
          child: Text(
            '${state.total} leads',
            style: TextStyle(color: muted, fontSize: 12, fontWeight: FontWeight.w500),
          ),
        ),
        const SizedBox(height: 8),
        Expanded(
          child: RefreshIndicator(
            onRefresh: () => ref.read(leadsListProvider.notifier).load(refresh: true),
            child: state.isLoading && state.items.isEmpty
                ? const Center(child: CircularProgressIndicator())
                : state.items.isEmpty
                    ? ListView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        children: [
                          EmptyState(
                            icon: Icons.people_outline,
                            title: state.error != null ? 'Could not load leads' : 'No leads found',
                            subtitle: state.error ??
                                'Adjust filters or tap + to capture your first lead.',
                          ),
                        ],
                      )
                    : ListView.builder(
                        controller: _scrollCtrl,
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.fromLTRB(16, 4, 16, 100),
                        itemCount: state.items.length + (state.isLoadingMore ? 1 : 0),
                        itemBuilder: (context, index) {
                          if (index >= state.items.length) {
                            return const Padding(
                              padding: EdgeInsets.all(16),
                              child: Center(child: CircularProgressIndicator()),
                            );
                          }
                          return LeadListTile(lead: state.items[index]);
                        },
                      ),
          ),
        ),
      ],
    );
  }
}

void showCreateLeadSheet(BuildContext context, WidgetRef ref) {
  final nameCtrl = TextEditingController();
  final phoneCtrl = TextEditingController();
  final companyCtrl = TextEditingController();
  var loading = false;

  showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Theme.of(context).colorScheme.surface,
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
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('New lead', style: Theme.of(ctx).textTheme.titleLarge),
            const SizedBox(height: 16),
            TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Name *')),
            TextField(
              controller: phoneCtrl,
              decoration: const InputDecoration(labelText: 'Phone *'),
              keyboardType: TextInputType.phone,
            ),
            TextField(controller: companyCtrl, decoration: const InputDecoration(labelText: 'Company')),
            const SizedBox(height: 16),
            PrimaryButton(
              label: 'Create lead',
              isLoading: loading,
              onPressed: loading
                  ? null
                  : () async {
                      if (nameCtrl.text.trim().isEmpty || phoneCtrl.text.trim().isEmpty) return;
                      setSheetState(() => loading = true);
                      try {
                        final result = await ref.read(leadsRepositoryProvider).createLead(
                              name: nameCtrl.text.trim(),
                              phone: phoneCtrl.text.trim(),
                              company: companyCtrl.text.trim(),
                            );
                        await ref.read(leadsListProvider.notifier).load(refresh: true);
                        if (ctx.mounted) {
                          showMutationSnackBar(ctx, result);
                          Navigator.pop(ctx);
                        }
                      } catch (e) {
                        if (ctx.mounted) {
                          ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(content: Text('$e')));
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
  );
}
