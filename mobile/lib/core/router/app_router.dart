import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/providers/auth_provider.dart';
import '../../features/auth/presentation/screens/forgot_password_screen.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/auth/presentation/screens/otp_login_screen.dart';
import '../../features/auth/presentation/screens/otp_verify_screen.dart';
import '../../features/auth/presentation/screens/reset_password_screen.dart';
import '../../features/auth/presentation/screens/signup_screen.dart';
import '../../features/auth/presentation/screens/sessions_screen.dart';
import '../../features/auth/presentation/screens/splash_screen.dart';
import '../../features/crm/presentation/screens/campaign_territory_screens.dart';
import '../../features/crm/presentation/screens/customer_create_screen.dart';
import '../../features/crm/presentation/screens/revenue_drilldown_screens.dart';
import '../../features/crm/presentation/screens/crm_create_screens.dart';
import '../../features/crm/presentation/screens/crm_dashboard_screens.dart';
import '../../features/crm/presentation/screens/crm_hub_screen.dart';
import '../../features/crm/presentation/screens/crm_list_screens.dart';
import '../../features/crm/presentation/screens/document_detail_screens.dart';
import '../../features/crm/presentation/screens/customer_detail_screen.dart';
import '../../features/crm/presentation/screens/customers_list_screen.dart';
import '../../features/crm/presentation/screens/opportunities_screens.dart';
import '../../features/shell/presentation/screens/home_shell_screen.dart';
import '../../features/shell/presentation/screens/product_selection_screen.dart';
import '../../features/leadedge360/presentation/screens/lead_detail_screen.dart';
import '../../features/notifications/presentation/screens/notifications_screen.dart';
import '../../features/retailedge360/presentation/screens/retail_web_screen.dart';
import '../../features/retailedge360/presentation/screens/retail_pos_screens.dart';
import '../../features/retailedge360/presentation/screens/retail_receipt_screen.dart';
import '../../features/retailedge360/presentation/screens/expiry_dashboard_screen.dart';
import '../../features/settings/presentation/screens/security_settings_screen.dart';
import '../../features/billing/presentation/screens/billing_screens.dart';
import '../../features/onboarding/presentation/screens/onboarding_screen.dart';
import '../../features/onboarding/presentation/screens/quick_onboarding_screen.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final auth = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/',
    redirect: (context, state) {
      final loc = state.matchedLocation;
      final isSplash = loc == '/';
      final isAuthRoute = loc == '/login' ||
          loc.startsWith('/login/') ||
          loc == '/signup' ||
          loc.startsWith('/forgot-password') ||
          loc.startsWith('/reset-password');

      if (auth.status == AuthStatus.unknown) {
        return isSplash ? null : '/';
      }

      if (auth.status == AuthStatus.unauthenticated) {
        if (isAuthRoute || isSplash) return isSplash ? '/login' : null;
        return '/login';
      }

      if (auth.status == AuthStatus.authenticated) {
        if (isSplash || isAuthRoute) {
          final active = auth.user?.activeProduct;
          if (active == 'leadedge360') return '/home/leadedge';
          if (active == 'retailedge360') return '/home/retail';
          return '/products';
        }
      }

      return null;
    },
    routes: [
      GoRoute(path: '/', builder: (_, __) => const SplashScreen()),
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/login/otp', builder: (_, __) => const OtpLoginScreen()),
      GoRoute(
        path: '/login/verify',
        builder: (_, state) => OtpVerifyScreen(
          destination: state.uri.queryParameters['destination'] ?? '',
          purpose: state.uri.queryParameters['purpose'] ?? 'login',
          devOtp: state.extra as String?,
        ),
      ),
      GoRoute(path: '/signup', builder: (_, __) => const SignupScreen()),
      GoRoute(path: '/forgot-password', builder: (_, __) => const ForgotPasswordScreen()),
      GoRoute(
        path: '/reset-password',
        builder: (_, state) => ResetPasswordScreen(
          destination: state.uri.queryParameters['destination'] ?? '',
          code: state.uri.queryParameters['code'],
        ),
      ),
      GoRoute(path: '/settings/sessions', builder: (_, __) => const SessionsScreen()),
      GoRoute(path: '/products', builder: (_, __) => const ProductSelectionScreen()),
      GoRoute(path: '/onboarding', builder: (_, __) => const OnboardingScreen()),
      GoRoute(path: '/onboarding/quick', builder: (_, __) => const QuickOnboardingScreen()),
      GoRoute(path: '/home/leadedge', builder: (_, __) => const HomeShellScreen(product: 'leadedge360')),
      GoRoute(
        path: '/home/retail',
        builder: (_, state) => HomeShellScreen(
          product: 'retailedge360',
          initialAction: state.uri.queryParameters['tab'] == 'pos' ? 'pos' : null,
        ),
      ),
      GoRoute(path: '/leads/:id', builder: (_, state) => LeadDetailScreen(leadId: state.pathParameters['id']!)),
      GoRoute(path: '/notifications', builder: (_, __) => const NotificationsScreen()),
      GoRoute(path: '/retail/web', builder: (_, __) => const RetailWebScreen()),
      GoRoute(path: '/retail/pos', builder: (_, __) => const RetailPosScreen()),
      GoRoute(path: '/retail/sales', builder: (_, __) => const RetailSalesScreen()),
      GoRoute(path: '/retail/expiry', builder: (_, __) => const ExpiryDashboardScreen()),
      GoRoute(
        path: '/retail/receipt',
        builder: (_, state) => RetailReceiptScreen(args: state.extra! as RetailReceiptArgs),
      ),
      GoRoute(path: '/settings/security', builder: (_, __) => const SecuritySettingsScreen()),
      GoRoute(path: '/billing/subscribe', builder: (_, __) => const SubscribeScreen()),
      GoRoute(path: '/billing/history', builder: (_, __) => const BillingHistoryScreen()),
      // CRM module routes
      GoRoute(path: '/crm', builder: (_, __) => const CrmHubScreen()),
      GoRoute(path: '/crm/customers', builder: (_, __) => const CustomersListScreen()),
      GoRoute(path: '/crm/customers/new', builder: (_, __) => const CreateCustomerScreen()),
      GoRoute(path: '/crm/customers/:id', builder: (_, state) => CustomerDetailScreen(customerId: state.pathParameters['id']!)),
      GoRoute(path: '/crm/opportunities', builder: (_, __) => const OpportunitiesListScreen()),
      GoRoute(path: '/crm/opportunities/:id', builder: (_, state) => OpportunityDetailScreen(opportunityId: state.pathParameters['id']!)),
      GoRoute(path: '/crm/campaigns', builder: (_, __) => const CampaignsListScreen()),
      GoRoute(path: '/crm/campaigns/new', builder: (_, __) => const CreateCampaignScreen()),
      GoRoute(
        path: '/crm/campaigns/:id',
        builder: (_, state) => CampaignDetailScreen(campaignId: state.pathParameters['id']!),
      ),
      GoRoute(path: '/crm/proposals', builder: (_, __) => const ProposalsListScreen()),
      GoRoute(path: '/crm/proposals/new', builder: (_, __) => const CreateProposalScreen()),
      GoRoute(
        path: '/crm/proposals/:id',
        builder: (_, state) => ProposalDetailScreen(proposalId: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/crm/proposals/:id/edit',
        builder: (_, state) => EditProposalScreen(proposalId: state.pathParameters['id']!),
      ),
      GoRoute(path: '/crm/invoices', builder: (_, __) => const InvoicesListScreen()),
      GoRoute(path: '/crm/invoices/new', builder: (_, __) => const CreateInvoiceScreen()),
      GoRoute(
        path: '/crm/invoices/:id',
        builder: (_, state) => InvoiceDetailScreen(invoiceId: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/crm/invoices/:id/edit',
        builder: (_, state) => EditInvoiceScreen(invoiceId: state.pathParameters['id']!),
      ),
      GoRoute(path: '/crm/territories', builder: (_, __) => const TerritoriesScreen()),
      GoRoute(path: '/crm/territories/new', builder: (_, __) => const CreateTerritoryScreen()),
      GoRoute(
        path: '/crm/territories/:id',
        builder: (_, state) => TerritoryDetailScreen(territoryId: state.pathParameters['id']!),
      ),
      GoRoute(path: '/crm/whatsapp', builder: (_, __) => const WhatsAppThreadsScreen()),
      GoRoute(
        path: '/crm/whatsapp/:id',
        builder: (_, state) => WhatsAppThreadScreen(
          threadId: state.pathParameters['id']!,
          contactName: state.uri.queryParameters['contact'] ?? 'WhatsApp',
        ),
      ),
      GoRoute(path: '/crm/activities', builder: (_, __) => const ActivitiesScreen()),
      GoRoute(path: '/crm/revenue', builder: (_, __) => const RevenueDashboardScreen()),
      GoRoute(path: '/crm/revenue/customers', builder: (_, __) => const RevenueByCustomerScreen()),
      GoRoute(path: '/crm/revenue/trends', builder: (_, __) => const RevenueTrendsScreen()),
      GoRoute(path: '/crm/revenue/source', builder: (_, __) => const RevenueBySourceScreen()),
      GoRoute(path: '/crm/revenue/territory', builder: (_, __) => const RevenueByTerritoryScreen()),
      GoRoute(path: '/crm/sales-dashboard', builder: (_, __) => const SalesDashboardScreen()),
      GoRoute(path: '/crm/marketing-dashboard', builder: (_, __) => const MarketingDashboardScreen()),
      GoRoute(path: '/crm/marketing-calendar', builder: (_, __) => const MarketingCalendarScreen()),
      GoRoute(path: '/crm/ai-insights', builder: (_, __) => const AiInsightsScreen()),
      GoRoute(path: '/crm/reports', builder: (_, __) => const ReportsHubScreen()),
      GoRoute(path: '/crm/search', builder: (_, __) => const GlobalSearchScreen()),
    ],
  );
});
