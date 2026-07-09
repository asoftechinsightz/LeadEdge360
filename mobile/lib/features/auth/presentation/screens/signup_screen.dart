import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../data/auth_repository_impl.dart';
import '../../../../shared/brand/asoftech_logo.dart';
import '../../../../shared/widgets/app_text_field.dart';
import '../../../../shared/widgets/glass_card.dart';
import '../../../../shared/widgets/primary_button.dart';
import '../providers/auth_provider.dart';

class SignupScreen extends ConsumerStatefulWidget {
  const SignupScreen({super.key});

  @override
  ConsumerState<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends ConsumerState<SignupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _workspaceCtrl = TextEditingController();
  OtpChannel _channel = OtpChannel.sms;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _phoneCtrl.dispose();
    _passwordCtrl.dispose();
    _workspaceCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    final result = await ref.read(authProvider.notifier).register(
          fullName: _nameCtrl.text.trim(),
          email: _emailCtrl.text.trim(),
          phone: _phoneCtrl.text.trim(),
          password: _passwordCtrl.text,
          tenantName: _workspaceCtrl.text.trim().isEmpty ? null : _workspaceCtrl.text.trim(),
          channel: _channel,
        );
    if (!mounted || result == null) return;
    context.push(
      '/login/verify?destination=${Uri.encodeComponent(_phoneCtrl.text.trim())}&purpose=signup',
      extra: result.devOtp,
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const AsoftechLogo(height: 44),
              const SizedBox(height: 8),
              Text('Create workspace', style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 24),
              GlassCard(
                child: Form(
                  key: _formKey,
                  child: Column(
                    children: [
                      AppTextField(
                        controller: _nameCtrl,
                        label: 'Full name',
                        prefixIcon: Icons.person_outline,
                        validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                      ),
                      const SizedBox(height: 12),
                      AppTextField(
                        controller: _emailCtrl,
                        label: 'Work email',
                        keyboardType: TextInputType.emailAddress,
                        prefixIcon: Icons.email_outlined,
                        validator: (v) => (v == null || !v.contains('@')) ? 'Valid email required' : null,
                      ),
                      const SizedBox(height: 12),
                      AppTextField(
                        controller: _phoneCtrl,
                        label: 'Mobile (SMS / WhatsApp OTP)',
                        keyboardType: TextInputType.phone,
                        prefixIcon: Icons.phone_outlined,
                        validator: (v) => (v == null || v.length < 10) ? 'Valid phone required' : null,
                      ),
                      const SizedBox(height: 12),
                      AppTextField(
                        controller: _passwordCtrl,
                        label: 'Password',
                        obscureText: true,
                        prefixIcon: Icons.lock_outline,
                        validator: (v) => (v == null || v.length < 8) ? 'Min 8 characters' : null,
                      ),
                      const SizedBox(height: 12),
                      AppTextField(
                        controller: _workspaceCtrl,
                        label: 'Workspace name (optional)',
                        prefixIcon: Icons.business_outlined,
                      ),
                      const SizedBox(height: 12),
                      SegmentedButton<OtpChannel>(
                        segments: const [
                          ButtonSegment(value: OtpChannel.sms, label: Text('SMS OTP')),
                          ButtonSegment(value: OtpChannel.whatsapp, label: Text('WhatsApp OTP')),
                        ],
                        selected: {_channel},
                        onSelectionChanged: (s) => setState(() => _channel = s.first),
                      ),
                      if (auth.errorMessage != null) ...[
                        const SizedBox(height: 12),
                        Text(auth.errorMessage!, style: const TextStyle(color: AppColors.error)),
                      ],
                      const SizedBox(height: 16),
                      PrimaryButton(
                        label: 'Create account',
                        isLoading: auth.isLoading,
                        onPressed: _submit,
                      ),
                      TextButton(
                        onPressed: () => context.go('/login'),
                        child: const Text('Already have an account? Sign in'),
                      ),
                    ],
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

