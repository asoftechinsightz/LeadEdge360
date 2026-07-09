import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../shared/widgets/glass_card.dart';
import '../../data/crm_repository.dart';
import '../../domain/crm_models.dart';
import '../providers/crm_providers.dart';

class CustomerDetailScreen extends ConsumerStatefulWidget {
  const CustomerDetailScreen({super.key, required this.customerId});

  final String customerId;

  @override
  ConsumerState<CustomerDetailScreen> createState() => _CustomerDetailScreenState();
}

class _CustomerDetailScreenState extends ConsumerState<CustomerDetailScreen> with SingleTickerProviderStateMixin {
  late TabController _tabs;
  final _noteCtrl = TextEditingController();
  var _noteBusy = false;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabs.dispose();
    _noteCtrl.dispose();
    super.dispose();
  }

  Future<void> _addNote() async {
    final text = _noteCtrl.text.trim();
    if (text.isEmpty || _noteBusy) return;
    setState(() => _noteBusy = true);
    try {
      await ref.read(crmRepositoryProvider).addCustomerNote(widget.customerId, text);
      _noteCtrl.clear();
      ref.invalidate(customerDetailProvider(widget.customerId));
    } finally {
      if (mounted) setState(() => _noteBusy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final customer = ref.watch(customerDetailProvider(widget.customerId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Customer'),
        bottom: TabBar(
          controller: _tabs,
          isScrollable: true,
          tabs: const [
            Tab(text: 'Overview'),
            Tab(text: 'Activities'),
            Tab(text: 'Subscriptions'),
            Tab(text: 'Notes'),
          ],
        ),
      ),
      body: customer.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (c) => TabBarView(
          controller: _tabs,
          children: [
            _OverviewTab(customer: c, customerId: widget.customerId),
            _ActivitiesTab(activities: c.activities),
            _SubscriptionsTab(subscriptions: c.subscriptions),
            _NotesTab(
              activities: c.activities.where((a) => a['type'] == 'note').toList(),
              noteCtrl: _noteCtrl,
              busy: _noteBusy,
              onAdd: _addNote,
            ),
          ],
        ),
      ),
    );
  }
}

class _OverviewTab extends ConsumerWidget {
  const _OverviewTab({required this.customer, required this.customerId});

  final CrmCustomer customer;
  final String customerId;

  static const _statuses = ['active', 'trial', 'churned', 'inactive'];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        GlassCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(customer.name, style: Theme.of(context).textTheme.headlineSmall),
              if (customer.company?.isNotEmpty == true) Text(customer.company!),
              const SizedBox(height: 12),
              if (customer.email?.isNotEmpty == true)
                ListTile(contentPadding: EdgeInsets.zero, leading: const Icon(Icons.email_outlined), title: Text(customer.email!)),
              if (customer.phone?.isNotEmpty == true)
                ListTile(contentPadding: EdgeInsets.zero, leading: const Icon(Icons.phone_outlined), title: Text(customer.phone!)),
              if (customer.territory?.isNotEmpty == true)
                ListTile(contentPadding: EdgeInsets.zero, leading: const Icon(Icons.map_outlined), title: Text(customer.territory!)),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Text('Status', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: _statuses.map((status) {
            final selected = (customer.status ?? 'active').toLowerCase() == status;
            return FilterChip(
              label: Text(status),
              selected: selected,
              onSelected: selected
                  ? null
                  : (_) async {
                      await ref.read(crmRepositoryProvider).patchCustomer(customerId, {'status': status});
                      ref.invalidate(customerDetailProvider(customerId));
                      ref.invalidate(customersProvider(''));
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Status → $status')));
                      }
                    },
            );
          }).toList(),
        ),
        if (customer.contacts.isNotEmpty) ...[
          const SizedBox(height: 16),
          Text('Contacts', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          ...customer.contacts.map(
            (contact) => GlassCard(
              child: ListTile(
                title: Text(contact['name']?.toString() ?? 'Contact'),
                subtitle: Text(contact['email']?.toString() ?? contact['phone']?.toString() ?? ''),
              ),
            ),
          ),
        ],
        if (customer.children.isNotEmpty) ...[
          const SizedBox(height: 16),
          Text('Child accounts', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          ...customer.children.map(
            (child) => GlassCard(
              child: ListTile(
                title: Text(child['name']?.toString() ?? 'Account'),
                subtitle: Text(child['company']?.toString() ?? child['status']?.toString() ?? ''),
              ),
            ),
          ),
        ],
        if (customer.leadId != null && customer.leadId!.isNotEmpty) ...[
          const SizedBox(height: 16),
          FilledButton.icon(
            onPressed: () => context.push('/leads/${customer.leadId}'),
            icon: const Icon(Icons.person_search_outlined),
            label: const Text('View linked lead'),
          ),
        ],
      ],
    );
  }
}

class _ActivitiesTab extends StatelessWidget {
  const _ActivitiesTab({required this.activities});

  final List<Map<String, dynamic>> activities;

  @override
  Widget build(BuildContext context) {
    if (activities.isEmpty) {
      return const Center(child: Text('No activity yet'));
    }
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: activities.length,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (context, i) {
        final a = activities[i];
        return GlassCard(
          child: ListTile(
            leading: const Icon(Icons.history),
            title: Text(a['title']?.toString() ?? a['type']?.toString() ?? 'Activity'),
            subtitle: Text(a['detail']?.toString() ?? a['createdAt']?.toString() ?? ''),
          ),
        );
      },
    );
  }
}

class _SubscriptionsTab extends StatelessWidget {
  const _SubscriptionsTab({required this.subscriptions});

  final List<Map<String, dynamic>> subscriptions;

  @override
  Widget build(BuildContext context) {
    if (subscriptions.isEmpty) {
      return const Center(child: Text('No subscriptions'));
    }
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: subscriptions.length,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (context, i) {
        final s = subscriptions[i];
        return GlassCard(
          child: ListTile(
            leading: const Icon(Icons.subscriptions_outlined),
            title: Text(s['plan']?.toString() ?? s['name']?.toString() ?? 'Subscription'),
            subtitle: Text('${s['status'] ?? '—'} · ${s['amount'] ?? ''}'),
          ),
        );
      },
    );
  }
}

class _NotesTab extends StatelessWidget {
  const _NotesTab({
    required this.activities,
    required this.noteCtrl,
    required this.busy,
    required this.onAdd,
  });

  final List<Map<String, dynamic>> activities;
  final TextEditingController noteCtrl;
  final bool busy;
  final VoidCallback onAdd;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        TextField(
          controller: noteCtrl,
          maxLines: 3,
          decoration: const InputDecoration(
            labelText: 'Add note',
            border: OutlineInputBorder(),
          ),
        ),
        const SizedBox(height: 8),
        FilledButton(
          onPressed: busy ? null : onAdd,
          child: Text(busy ? 'Saving…' : 'Save note'),
        ),
        const SizedBox(height: 16),
        Text('Note history', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 8),
        if (activities.isEmpty)
          const GlassCard(child: Padding(padding: EdgeInsets.all(16), child: Text('No notes yet')))
        else
          ...activities.map(
            (a) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: GlassCard(
                child: ListTile(
                  title: Text(a['detail']?.toString() ?? a['title']?.toString() ?? 'Note'),
                  subtitle: Text(a['createdAt']?.toString() ?? '', style: const TextStyle(color: AppColors.slate500, fontSize: 12)),
                ),
              ),
            ),
          ),
      ],
    );
  }
}
