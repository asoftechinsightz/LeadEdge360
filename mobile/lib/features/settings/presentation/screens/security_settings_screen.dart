import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/config/app_config.dart';
import '../../../../core/demo/demo_setup_service.dart';
import '../../../../core/security/app_lock_provider.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/theme_mode_provider.dart';
import '../../../../shared/widgets/glass_card.dart';
import '../../../../shared/widgets/primary_button.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../leadedge360/data/leads_repository.dart';
import '../../../leadedge360/presentation/providers/leads_providers.dart';
import '../../../retailedge360/data/retail_repository.dart';
import '../../../retailedge360/presentation/providers/retail_providers.dart';

final packageInfoProvider = FutureProvider<PackageInfo>((ref) => PackageInfo.fromPlatform());

class SecuritySettingsScreen extends ConsumerStatefulWidget {
  const SecuritySettingsScreen({super.key});

  @override
  ConsumerState<SecuritySettingsScreen> createState() => _SecuritySettingsScreenState();
}

class _SecuritySettingsScreenState extends ConsumerState<SecuritySettingsScreen> {
  var _demoLoading = false;

  Future<void> _openUrl(BuildContext context, String url) async {
    final uri = Uri.parse(url);
    if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not open $url')),
        );
      }
    }
  }

  Future<void> _runDemoSetup() async {
    setState(() => _demoLoading = true);
    try {
      final result = await ref.read(demoSetupServiceProvider).seed(
            leadsRepo: ref.read(leadsRepositoryProvider),
            retailRepo: ref.read(retailRepositoryProvider),
          );

      ref.invalidate(pipelineProvider);
      ref.invalidate(leadsListProvider);
      ref.invalidate(retailKpisProvider);
      ref.invalidate(retailInventoryProvider);
      ref.invalidate(retailInventoryListProvider);
      await ref.read(retailInventoryListProvider.notifier).load(refresh: true);

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            result.ok ? result.messages.join('\n') : (result.error ?? 'Demo setup failed'),
          ),
        ),
      );
    } finally {
      if (mounted) setState(() => _demoLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final lock = ref.watch(appLockProvider);
    final themeMode = ref.watch(themeModeProvider);
    final packageInfo = ref.watch(packageInfoProvider);
    final muted = Theme.of(context).brightness == Brightness.dark
        ? AppColors.slate400
        : AppColors.slate500;

    return Scaffold(
      appBar: AppBar(title: const Text('Security & privacy')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          GlassCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Appearance', style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 8),
                Text(
                  'Light theme matches the AsoftechInsightz website. Dark mode is available for low-light use.',
                  style: TextStyle(color: muted, fontSize: 13),
                ),
                const SizedBox(height: 12),
                SegmentedButton<ThemeMode>(
                  segments: const [
                    ButtonSegment(
                      value: ThemeMode.light,
                      label: Text('Light'),
                      icon: Icon(Icons.light_mode_outlined, size: 18),
                    ),
                    ButtonSegment(
                      value: ThemeMode.dark,
                      label: Text('Dark'),
                      icon: Icon(Icons.dark_mode_outlined, size: 18),
                    ),
                    ButtonSegment(
                      value: ThemeMode.system,
                      label: Text('Auto'),
                      icon: Icon(Icons.brightness_auto_outlined, size: 18),
                    ),
                  ],
                  selected: {themeMode},
                  onSelectionChanged: (selection) {
                    ref.read(themeModeProvider.notifier).setMode(selection.first);
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          GlassCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('App lock', style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 8),
                Text(
                  lock.biometricAvailable
                      ? 'Require biometrics when returning to the app or after ${AppConfig.sessionIdleTimeout.inMinutes} minutes idle.'
                      : 'Biometrics not available on this device.',
                  style: TextStyle(color: muted, fontSize: 13),
                ),
                const SizedBox(height: 12),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.devices_outlined),
                  title: const Text('Active sessions'),
                  subtitle: const Text('Manage signed-in devices'),
                  onTap: () => context.push('/settings/sessions'),
                ),
                const SizedBox(height: 8),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  title: const Text('Biometric unlock'),
                  subtitle: const Text('Fingerprint / face / device PIN'),
                  value: lock.biometricEnabled,
                  onChanged: lock.biometricAvailable
                      ? (v) async {
                          final ok = await ref.read(appLockProvider.notifier).setBiometricEnabled(v);
                          if (!context.mounted) return;
                          if (!ok && v) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Could not enable biometric unlock')),
                            );
                          }
                        }
                      : null,
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          GlassCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Demo & onboarding', style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 8),
                Text(
                  'Adds sample retail SKUs and moves your first lead to Contacted so pipeline and inventory screens look populated for demos.',
                  style: TextStyle(color: muted, fontSize: 13),
                ),
                const SizedBox(height: 12),
                PrimaryButton(
                  label: 'Load demo data',
                  icon: Icons.auto_awesome_outlined,
                  isLoading: _demoLoading,
                  onPressed: _demoLoading ? null : _runDemoSetup,
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          GlassCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Legal', style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 8),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.privacy_tip_outlined),
                  title: const Text('Privacy policy'),
                  onTap: () => _openUrl(context, AppConfig.privacyPolicyUrl),
                ),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.description_outlined),
                  title: const Text('Terms of service'),
                  onTap: () => _openUrl(context, AppConfig.termsUrl),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          GlassCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('About', style: Theme.of(context).textTheme.titleLarge),
                packageInfo.when(
                  loading: () => const Padding(
                    padding: EdgeInsets.only(top: 8),
                    child: LinearProgressIndicator(),
                  ),
                  error: (_, __) => const Text('Version unavailable'),
                  data: (info) => Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 8),
                      Text('${info.appName} v${info.version} (${info.buildNumber})'),
                      Text(
                        'Package: ${info.packageName}',
                        style: TextStyle(color: muted, fontSize: 12),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'Enterprise CRM data is stored encrypted on-device (tokens) and transmitted over HTTPS only.',
                  style: TextStyle(color: muted, fontSize: 12),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          OutlinedButton.icon(
            onPressed: () async {
              await ref.read(authProvider.notifier).logout();
              if (context.mounted) context.go('/login');
            },
            icon: const Icon(Icons.logout),
            label: const Text('Sign out on this device'),
          ),
        ],
      ),
    );
  }
}
