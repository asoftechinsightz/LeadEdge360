import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../shared/widgets/app_text_field.dart';
import '../../../../shared/widgets/glass_card.dart';
import '../../../../shared/widgets/primary_button.dart';
import '../providers/auth_provider.dart';

class ResetPasswordScreen extends ConsumerStatefulWidget {
  const ResetPasswordScreen({
    super.key,
    required this.destination,
    this.code,
  });

  final String destination;
  final String? code;

  @override
  ConsumerState<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends ConsumerState<ResetPasswordScreen> {
  final _codeCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _done = false;

  @override
  void initState() {
    super.initState();
    if (widget.code != null) _codeCtrl.text = widget.code!;
  }

  @override
  void dispose() {
    _codeCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final ok = await ref.read(authProvider.notifier).resetPassword(
          destination: widget.destination,
          code: _codeCtrl.text.trim(),
          newPassword: _passwordCtrl.text,
        );
    if (ok && mounted) setState(() => _done = true);
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Set new password')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: GlassCard(
            child: _done
                ? Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.check_circle_outline, color: AppColors.insightBlue, size: 48),
                      const SizedBox(height: 12),
                      const Text('Password updated. Sign in with your new password.'),
                      const SizedBox(height: 16),
                      PrimaryButton(label: 'Back to sign in', onPressed: () => context.go('/login')),
                    ],
                  )
                : Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      AppTextField(
                        controller: _codeCtrl,
                        label: 'OTP code',
                        keyboardType: TextInputType.number,
                        prefixIcon: Icons.pin_outlined,
                      ),
                      const SizedBox(height: 12),
                      AppTextField(
                        controller: _passwordCtrl,
                        label: 'New password',
                        obscureText: true,
                        prefixIcon: Icons.lock_outline,
                      ),
                      if (auth.errorMessage != null) ...[
                        const SizedBox(height: 12),
                        Text(auth.errorMessage!, style: const TextStyle(color: AppColors.error)),
                      ],
                      const SizedBox(height: 16),
                      PrimaryButton(
                        label: 'Update password',
                        isLoading: auth.isLoading,
                        onPressed: _submit,
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }
}

