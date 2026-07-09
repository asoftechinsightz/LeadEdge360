import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../shared/widgets/glass_card.dart';
import '../../domain/crm_models.dart';
import '../providers/crm_providers.dart';
import '../widgets/crm_list_widgets.dart';

class CampaignsListScreen extends ConsumerWidget {
  const CampaignsListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final campaigns = ref.watch(campaignsProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Campaigns')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/crm/campaigns/new'),
        icon: const Icon(Icons.add),
        label: const Text('New'),
      ),
      body: CrmAsyncListBody<CrmCampaign>(
        asyncValue: campaigns,
        onRefresh: () async => ref.invalidate(campaignsProvider),
        emptyTitle: 'No campaigns',
        itemBuilder: (context, c) => GlassCard(
          onTap: () => context.push('/crm/campaigns/${c.id}'),
          padding: const EdgeInsets.all(14),
          child: ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const Icon(Icons.campaign_outlined, color: AppColors.primaryBlue),
            title: Text(c.name),
            subtitle: Text('${c.channel ?? 'email'} · ${c.status ?? 'draft'}'),
          ),
        ),
      ),
    );
  }
}

class ProposalsListScreen extends ConsumerWidget {
  const ProposalsListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final proposals = ref.watch(proposalsProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Proposals')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/crm/proposals/new'),
        icon: const Icon(Icons.add),
        label: const Text('New'),
      ),
      body: CrmAsyncListBody<CrmProposal>(
        asyncValue: proposals,
        onRefresh: () async => ref.invalidate(proposalsProvider),
        emptyTitle: 'No proposals',
        itemBuilder: (context, p) => GlassCard(
          onTap: () => context.push('/crm/proposals/${p.id}'),
          padding: const EdgeInsets.all(14),
          child: ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const Icon(Icons.description_outlined),
            title: Text(p.title),
            subtitle: Text('${p.clientName ?? ''} · ${p.status ?? 'draft'}'),
            trailing: Text(formatCurrency(p.totalAmount)),
          ),
        ),
      ),
    );
  }
}

class InvoicesListScreen extends ConsumerWidget {
  const InvoicesListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final invoices = ref.watch(invoicesProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Invoices')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/crm/invoices/new'),
        icon: const Icon(Icons.add),
        label: const Text('New'),
      ),
      body: CrmAsyncListBody<CrmInvoice>(
        asyncValue: invoices,
        onRefresh: () async => ref.invalidate(invoicesProvider),
        emptyTitle: 'No invoices',
        itemBuilder: (context, inv) => GlassCard(
          onTap: () => context.push('/crm/invoices/${inv.id}'),
          padding: const EdgeInsets.all(14),
          child: ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const Icon(Icons.receipt_long_outlined),
            title: Text(inv.invoiceNumber),
            subtitle: Text('${inv.clientName ?? ''} · GST ${formatCurrency(inv.gstAmount)}'),
            trailing: Text(formatCurrency(inv.totalAmount)),
          ),
        ),
      ),
    );
  }
}

class TerritoriesScreen extends ConsumerWidget {
  const TerritoriesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final territories = ref.watch(territoriesProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Territories')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/crm/territories/new'),
        icon: const Icon(Icons.add),
        label: const Text('New'),
      ),
      body: CrmAsyncListBody<CrmTerritory>(
        asyncValue: territories,
        onRefresh: () async => ref.invalidate(territoriesProvider),
        emptyTitle: 'No territories',
        itemBuilder: (context, t) => GlassCard(
          onTap: () => context.push('/crm/territories/${t.id}'),
          padding: const EdgeInsets.all(14),
          child: ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const Icon(Icons.map_outlined),
            title: Text(t.name),
            subtitle: Text('${t.region ?? ''} · ${t.manager ?? 'Unassigned'}'),
            trailing: t.leadCount != null ? Text('${t.leadCount} leads') : null,
          ),
        ),
      ),
    );
  }
}

class WhatsAppThreadsScreen extends ConsumerWidget {
  const WhatsAppThreadsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final threads = ref.watch(whatsappThreadsProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('WhatsApp')),
      body: CrmAsyncListBody<CrmWhatsAppThread>(
        asyncValue: threads,
        onRefresh: () async => ref.invalidate(whatsappThreadsProvider),
        emptyTitle: 'No conversations',
        itemBuilder: (context, t) => GlassCard(
          padding: const EdgeInsets.all(14),
          child: ListTile(
            contentPadding: EdgeInsets.zero,
            leading: CircleAvatar(
              backgroundColor: const Color(0xFF16A34A).withValues(alpha: 0.15),
              child: const Icon(Icons.chat, color: Color(0xFF16A34A)),
            ),
            title: Text(t.contact),
            subtitle: Text(t.preview ?? ''),
            trailing: t.unread ? const Icon(Icons.circle, size: 10, color: AppColors.primaryBlue) : null,
            onTap: () => context.push('/crm/whatsapp/${t.id}?contact=${Uri.encodeComponent(t.contact)}'),
          ),
        ),
      ),
    );
  }
}

class ActivitiesScreen extends ConsumerWidget {
  const ActivitiesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final activities = ref.watch(activitiesProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Activities')),
      body: CrmAsyncListBody<CrmActivity>(
        asyncValue: activities,
        onRefresh: () async => ref.invalidate(activitiesProvider),
        emptyTitle: 'No recent activity',
        itemBuilder: (context, a) => GlassCard(
          padding: const EdgeInsets.all(14),
          child: ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const Icon(Icons.history),
            title: Text(a.title),
            subtitle: Text(a.detail ?? a.type ?? ''),
          ),
        ),
      ),
    );
  }
}
