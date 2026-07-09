import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../shared/widgets/glass_card.dart';
import '../../domain/crm_models.dart';
import '../providers/crm_providers.dart';
import '../widgets/crm_list_widgets.dart';

class CustomersListScreen extends ConsumerStatefulWidget {
  const CustomersListScreen({super.key});

  @override
  ConsumerState<CustomersListScreen> createState() => _CustomersListScreenState();
}

class _CustomersListScreenState extends ConsumerState<CustomersListScreen> {
  final _search = TextEditingController();
  String _query = '';

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final customers = ref.watch(customersProvider(_query));

    return Scaffold(
      appBar: AppBar(title: const Text('Customers')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/crm/customers/new'),
        icon: const Icon(Icons.add),
        label: const Text('New'),
      ),
      body: CrmAsyncListBody<CrmCustomer>(
        asyncValue: customers,
        onRefresh: () async => ref.invalidate(customersProvider(_query)),
        emptyTitle: 'No customers',
        emptySubtitle: 'Converted leads appear here',
        searchField: Padding(
          padding: const EdgeInsets.only(bottom: 4),
          child: TextField(
            controller: _search,
            decoration: const InputDecoration(
              hintText: 'Search customers…',
              prefixIcon: Icon(Icons.search),
            ),
            onSubmitted: (v) => setState(() => _query = v.trim()),
          ),
        ),
        itemBuilder: (context, c) => GlassCard(
          onTap: () => context.push('/crm/customers/${c.id}'),
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              CircleAvatar(
                backgroundColor: AppColors.primaryBlue.withValues(alpha: 0.12),
                child: Text(c.name.characters.first.toUpperCase()),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(c.name, style: const TextStyle(fontWeight: FontWeight.w600)),
                    Text(c.subtitle, style: const TextStyle(color: AppColors.slate500, fontSize: 12)),
                  ],
                ),
              ),
              if (c.status != null)
                Chip(label: Text(c.status!, style: const TextStyle(fontSize: 11)), visualDensity: VisualDensity.compact),
            ],
          ),
        ),
      ),
    );
  }
}
