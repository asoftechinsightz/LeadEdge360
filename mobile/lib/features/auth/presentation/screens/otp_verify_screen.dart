import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../shared/widgets/app_text_field.dart';
import '../../../../shared/widgets/glass_card.dart';
import '../../../../shared/widgets/primary_button.dart';
import '../providers/auth_provider.dart';

class OtpVerifyScreen extends ConsumerStatefulWidget {
  const OtpVerifyScreen({
    super.key,
    required this.destination,
    required this.purpose,
    this.devOtp,
  });

  final String destination;
  final String purpose;
  final String? devOtp;

  @override
  ConsumerState<OtpVerifyScreen> createState() => _OtpVerifyScreenState();
}

class _OtpVerifyScreenState extends ConsumerState<OtpVerifyScreen> {
  final _codeCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    if (widget.devOtp != null) _codeCtrl.text = widget.devOtp!;
  }

  @override
  void dispose() {
    _codeCtrl.dispose();
    super.dispose();
  }

  Future<void> _verify() async {
    final code = _codeCtrl.text.trim();
    if (code.length < 4) return;

    if (widget.purpose == 'reset') {
      if (!mounted) return;
      context.push(
        '/reset-password?destination=${Uri.encodeComponent(widget.destination)}&code=${Uri.encodeComponent(code)}',
      );
      return;
    }

    final ok = await ref.read(authProvider.notifier).verifyOtp(
          destination: widget.destination,
          code: code,
          purpose: widget.purpose,
        );
    if (ok && mounted) {
      if (widget.purpose == 'signup') {
        context.go('/products');
      } else {
        context.go('/products');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final title = widget.purpose == 'signup'
        ? 'Verify your phone'
        : widget.purpose == 'reset'
            ? 'Enter reset code'
            : 'Enter login code';

    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: GlassCard(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text('Code sent to ${widget.destination}', style: Theme.of(context).textTheme.bodyMedium),
                const SizedBox(height: 16),
                AppTextField(
                  controller: _codeCtrl,
                  label: '6-digit OTP',
                  keyboardType: TextInputType.number,
                  textInputAction: TextInputAction.done,
                  prefixIcon: Icons.pin_outlined,
                  onFieldSubmitted: (_) => _verify(),
                ),
                if (auth.errorMessage != null) ...[
                  const SizedBox(height: 12),
                  Text(auth.errorMessage!, style: const TextStyle(color: AppColors.error)),
                ],
                const SizedBox(height: 20),
                PrimaryButton(
                  label: widget.purpose == 'reset' ? 'Continue' : 'Verify & sign in',
                  isLoading: auth.isLoading,
                  onPressed: _verify,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

