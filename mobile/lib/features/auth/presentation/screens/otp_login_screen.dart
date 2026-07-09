import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../data/auth_repository_impl.dart';
import '../../../../shared/widgets/app_text_field.dart';
import '../../../../shared/widgets/glass_card.dart';
import '../../../../shared/widgets/primary_button.dart';
import '../providers/auth_provider.dart';

class OtpLoginScreen extends ConsumerStatefulWidget {
  const OtpLoginScreen({super.key});

  @override
  ConsumerState<OtpLoginScreen> createState() => _OtpLoginScreenState();
}

class _OtpLoginScreenState extends ConsumerState<OtpLoginScreen> {
  final _phoneCtrl = TextEditingController();
  OtpChannel _channel = OtpChannel.sms;
  String? _devOtp;

  @override
  void dispose() {
    _phoneCtrl.dispose();
    super.dispose();
  }

  Future<void> _sendOtp() async {
    final phone = _phoneCtrl.text.trim();
    if (phone.length < 10) return;
    final result = await ref.read(authProvider.notifier).sendLoginOtp(phone, _channel);
    if (!mounted || result == null) return;
    setState(() => _devOtp = result.devOtp);
    context.push(
      '/login/verify?destination=${Uri.encodeComponent(phone)}&purpose=login&channel=${_channel.name}',
      extra: result.devOtp,
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Sign in with OTP')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: GlassCard(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'Enter your registered mobile number',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 16),
                AppTextField(
                  controller: _phoneCtrl,
                  label: 'Mobile number',
                  hint: '+91 98765 43210',
                  keyboardType: TextInputType.phone,
                  prefixIcon: Icons.phone_outlined,
                ),
                const SizedBox(height: 16),
                Text('Delivery channel', style: Theme.of(context).textTheme.labelLarge),
                const SizedBox(height: 8),
                SegmentedButton<OtpChannel>(
                  segments: const [
                    ButtonSegment(value: OtpChannel.sms, label: Text('SMS'), icon: Icon(Icons.sms_outlined, size: 18)),
                    ButtonSegment(value: OtpChannel.whatsapp, label: Text('WhatsApp'), icon: Icon(Icons.chat_outlined, size: 18)),
                  ],
                  selected: {_channel},
                  onSelectionChanged: (s) => setState(() => _channel = s.first),
                ),
                if (_devOtp != null) ...[
                  const SizedBox(height: 12),
                  Text('Dev OTP: $_devOtp', style: const TextStyle(color: AppColors.insightBlue, fontSize: 12)),
                ],
                if (auth.errorMessage != null) ...[
                  const SizedBox(height: 12),
                  Text(auth.errorMessage!, style: const TextStyle(color: AppColors.error)),
                ],
                const SizedBox(height: 20),
                PrimaryButton(
                  label: 'Send OTP',
                  isLoading: auth.isLoading,
                  onPressed: _sendOtp,
                ),
                TextButton(
                  onPressed: () => context.go('/login'),
                  child: const Text('Use password instead'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

