import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../data/auth_repository_impl.dart';
import '../../../../shared/widgets/app_text_field.dart';
import '../../../../shared/widgets/glass_card.dart';
import '../../../../shared/widgets/primary_button.dart';
import '../providers/auth_provider.dart';

class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  ConsumerState<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  final _ctrl = TextEditingController();
  OtpChannel _channel = OtpChannel.sms;
  bool _sent = false;

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final dest = _ctrl.text.trim();
    if (dest.isEmpty) return;
    final channel = dest.contains('@') ? null : _channel;
    final ok = await ref.read(authProvider.notifier).forgotPassword(dest, channel: channel);
    if (ok && mounted) {
      if (dest.contains('@')) {
        setState(() => _sent = true);
      } else {
        context.push(
          '/login/verify?destination=${Uri.encodeComponent(dest)}&purpose=reset',
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final dest = _ctrl.text.trim();
    final showChannel = !_sent && dest.isNotEmpty && !dest.contains('@');

    return Scaffold(
      appBar: AppBar(title: const Text('Reset password')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: GlassCard(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  _sent ? 'Check your inbox' : 'Forgot password?',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 8),
                Text(
                  _sent
                      ? 'If an account exists, we sent reset instructions.'
                      : 'Enter your email or phone number.',
                  style: const TextStyle(color: AppColors.slate500),
                ),
                const SizedBox(height: 20),
                if (!_sent) ...[
                  AppTextField(
                    controller: _ctrl,
                    label: 'Email or phone',
                    keyboardType: TextInputType.emailAddress,
                    prefixIcon: Icons.alternate_email,
                    onChanged: (_) => setState(() {}),
                  ),
                  if (showChannel) ...[
                    const SizedBox(height: 12),
                    SegmentedButton<OtpChannel>(
                      segments: const [
                        ButtonSegment(value: OtpChannel.sms, label: Text('SMS')),
                        ButtonSegment(value: OtpChannel.whatsapp, label: Text('WhatsApp')),
                      ],
                      selected: {_channel},
                      onSelectionChanged: (s) => setState(() => _channel = s.first),
                    ),
                  ],
                ],
                if (auth.errorMessage != null) ...[
                  const SizedBox(height: 12),
                  Text(auth.errorMessage!, style: const TextStyle(color: AppColors.error)),
                ],
                const SizedBox(height: 16),
                if (!_sent)
                  PrimaryButton(
                    label: 'Send reset code',
                    isLoading: auth.isLoading,
                    onPressed: _submit,
                  )
                else
                  PrimaryButton(
                    label: 'Back to sign in',
                    onPressed: () => context.go('/login'),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
