import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/file_download.dart';
import '../../../../shared/brand/asoftech_logo.dart';
import '../../../../shared/widgets/glass_card.dart';
import '../../../../shared/widgets/primary_button.dart';
import '../../data/onboarding_repository.dart';
import '../providers/onboarding_providers.dart';

const _steps = [
  ('company', 'Company details'),
  ('branding', 'Logo & branding'),
  ('team', 'Invite team'),
  ('whatsapp', 'WhatsApp setup'),
  ('email', 'Email setup'),
];

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  var _step = 0;
  var _progress = 0.0;
  var _loading = false;
  String? _message;

  final _companyCtrl = TextEditingController();
  final _industryCtrl = TextEditingController();
  final _websiteCtrl = TextEditingController();
  final _brandCtrl = TextEditingController();
  final _teamCtrl = TextEditingController();
  final _whatsappCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadProgress());
  }

  @override
  void dispose() {
    _companyCtrl.dispose();
    _industryCtrl.dispose();
    _websiteCtrl.dispose();
    _brandCtrl.dispose();
    _teamCtrl.dispose();
    _whatsappCtrl.dispose();
    _emailCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadProgress() async {
    try {
      final p = await ref.read(onboardingRepositoryProvider).fetchProgress();
      final pct = (p['completedPercent'] as num?)?.toDouble() ?? 0;
      if (!mounted) return;
      setState(() {
        _progress = pct;
        if (pct >= 100) {
          context.go('/products');
          return;
        }
        if (p['companyProfile'] == true) _step = 1;
        if (p['branding'] == true) _step = 2;
        if (p['team'] == true) _step = 3;
        if (p['whatsapp'] == true) _step = 4;
        if (p['email'] == true) _step = 4;
      });
    } catch (_) {}
  }

  Future<void> _saveStep() async {
    setState(() {
      _loading = true;
      _message = null;
    });
    final repo = ref.read(onboardingRepositoryProvider);
    try {
      switch (_steps[_step].$1) {
        case 'company':
          await repo.saveCompany(
            companyName: _companyCtrl.text.trim(),
            industry: _industryCtrl.text.trim(),
            website: _websiteCtrl.text.trim(),
          );
        case 'branding':
          await repo.saveBranding(brandName: _brandCtrl.text.trim().isEmpty ? _companyCtrl.text.trim() : _brandCtrl.text.trim());
        case 'team':
          if (_teamCtrl.text.trim().isNotEmpty) {
            await repo.saveTeamInvite(email: _teamCtrl.text.trim());
          }
        case 'whatsapp':
          if (_whatsappCtrl.text.trim().isNotEmpty) {
            await repo.saveWhatsApp(whatsappNumber: _whatsappCtrl.text.trim());
          }
        case 'email':
          if (_emailCtrl.text.trim().isNotEmpty) {
            await repo.saveEmail(smtpUser: _emailCtrl.text.trim());
          }
      }

      final pct = ((_step + 1) / _steps.length * 100).round();
      await repo.saveProgress({
        'companyProfile': _step >= 0,
        'branding': _step >= 1,
        'team': _step >= 2,
        'whatsapp': _step >= 3,
        'email': _step >= 4,
        'completedPercent': pct,
      });

      ref.invalidate(onboardingProgressProvider);
      if (!mounted) return;

      if (_step >= _steps.length - 1) {
        context.go('/products');
      } else {
        setState(() {
          _step += 1;
          _progress = pct.toDouble();
        });
      }
    } catch (e) {
      if (mounted) setState(() => _message = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(24),
          children: [
            const AsoftechLogo(height: 40),
            const SizedBox(height: 24),
            Text('Welcome to LeadEdge360', style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 4),
            Text(
              'Step ${_step + 1} of ${_steps.length}: ${_steps[_step].$2}',
              style: const TextStyle(color: AppColors.slate500),
            ),
            const SizedBox(height: 12),
            LinearProgressIndicator(value: _progress / 100),
            const SizedBox(height: 24),
            GlassCard(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: _buildStepFields(),
              ),
            ),
            if (_message != null) ...[
              const SizedBox(height: 12),
              Text(_message!, style: const TextStyle(color: AppColors.error)),
            ],
            const SizedBox(height: 20),
            PrimaryButton(
              label: _step >= _steps.length - 1 ? 'Finish setup' : 'Continue',
              isLoading: _loading,
              onPressed: _loading ? null : _saveStep,
            ),
            TextButton(
              onPressed: () => context.go('/products'),
              child: const Text('Skip for now'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStepFields() {
    switch (_steps[_step].$1) {
      case 'company':
        return Column(
          children: [
            TextField(controller: _companyCtrl, decoration: const InputDecoration(labelText: 'Company name')),
            const SizedBox(height: 12),
            TextField(controller: _industryCtrl, decoration: const InputDecoration(labelText: 'Industry')),
            const SizedBox(height: 12),
            TextField(controller: _websiteCtrl, decoration: const InputDecoration(labelText: 'Website')),
          ],
        );
      case 'branding':
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Set your brand name. Full logo upload is available in Settings after onboarding.'),
            const SizedBox(height: 12),
            TextField(controller: _brandCtrl, decoration: const InputDecoration(labelText: 'Brand name')),
          ],
        );
      case 'team':
        return TextField(
          controller: _teamCtrl,
          keyboardType: TextInputType.emailAddress,
          decoration: const InputDecoration(labelText: 'Invite teammate (email)'),
        );
      case 'whatsapp':
        return TextField(
          controller: _whatsappCtrl,
          decoration: const InputDecoration(labelText: 'WhatsApp business number', hintText: '+91…'),
        );
      case 'email':
        return TextField(
          controller: _emailCtrl,
          keyboardType: TextInputType.emailAddress,
          decoration: const InputDecoration(labelText: 'Outbound email (SMTP user)'),
        );
      default:
        return const SizedBox.shrink();
    }
  }
}
