import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../shared/widgets/glass_card.dart';
import '../../../../shared/widgets/suite_menu_tile.dart';

/// Enterprise CRM module launcher — mirrors web LeadEdge360 navigation.
class CrmHubScreen extends ConsumerWidget {
  const CrmHubScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      children: [
        Text('CRM & Sales', style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 12),
        _grid(context, [
          _HubItem('Customers', 'Accounts & contacts', Icons.business_rounded, const Color(0xFF0066FF), '/crm/customers'),
          _HubItem('Opportunities', 'Deals & pipeline value', Icons.trending_up_rounded, const Color(0xFF5B21B6), '/crm/opportunities'),
          _HubItem('Territories', 'Regions & coverage', Icons.map_rounded, const Color(0xFF0E7490), '/crm/territories'),
          _HubItem('Activities', 'Team timeline', Icons.history_rounded, const Color(0xFFBE123C), '/crm/activities'),
        ]),
        const SizedBox(height: 20),
        Text('Sales & Revenue', style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 12),
        _grid(context, [
          _HubItem('Proposals', 'Quotes & PDFs', Icons.description_rounded, const Color(0xFF059669), '/crm/proposals'),
          _HubItem('Invoices', 'GST billing', Icons.receipt_long_rounded, const Color(0xFFEA580C), '/crm/invoices'),
          _HubItem('Revenue', 'CEO dashboard', Icons.payments_rounded, const Color(0xFF7C3AED), '/crm/revenue'),
          _HubItem('Sales KPIs', 'Funnel & win rate', Icons.insights_rounded, const Color(0xFF2563EB), '/crm/sales-dashboard'),
        ]),
        const SizedBox(height: 20),
        Text('Marketing', style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 12),
        _grid(context, [
          _HubItem('Campaigns', 'Email & outreach', Icons.campaign_rounded, const Color(0xFFDB2777), '/crm/campaigns'),
          _HubItem('WhatsApp', 'Conversations', Icons.chat_rounded, const Color(0xFF16A34A), '/crm/whatsapp'),
          _HubItem('Marketing ROI', 'CPL & sources', Icons.analytics_rounded, const Color(0xFFCA8A04), '/crm/marketing-dashboard'),
          _HubItem('Calendar', 'Content schedule', Icons.calendar_month_rounded, const Color(0xFF0891B2), '/crm/marketing-calendar'),
        ]),
        const SizedBox(height: 20),
        Text('AI & Reports', style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 12),
        _grid(context, [
          _HubItem('AI Insights', 'Lead scoring', Icons.auto_awesome_rounded, const Color(0xFF6366F1), '/crm/ai-insights'),
          _HubItem('Reports', 'Export hub', Icons.summarize_rounded, const Color(0xFF475569), '/crm/reports'),
        ]),
        const SizedBox(height: 16),
        GlassCard(
          child: ListTile(
            leading: const Icon(Icons.card_membership_rounded, color: AppColors.primaryBlue),
            title: const Text('Subscription & billing'),
            subtitle: const Text('Razorpay plans, trial & invoices'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.push('/billing/subscribe'),
          ),
        ),
        const SizedBox(height: 16),
        GlassCard(
          child: ListTile(
            leading: const Icon(Icons.search_rounded, color: AppColors.primaryBlue),
            title: const Text('Global search'),
            subtitle: const Text('Leads, customers, deals'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.push('/crm/search'),
          ),
        ),
      ],
    );
  }

  Widget _grid(BuildContext context, List<_HubItem> items) {
    return GridView.count(
      crossAxisCount: 2,
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.55,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      children: items
          .map(
            (item) => SuiteMenuTile(
              title: item.title,
              subtitle: item.subtitle,
              color: item.color,
              icon: item.icon,
              onTap: () => context.push(item.route),
            ),
          )
          .toList(),
    );
  }
}

class _HubItem {
  const _HubItem(this.title, this.subtitle, this.icon, this.color, this.route);
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final String route;
}
