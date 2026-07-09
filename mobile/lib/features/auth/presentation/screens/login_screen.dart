import 'package:flutter/material.dart';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:go_router/go_router.dart';

import 'package:google_sign_in/google_sign_in.dart';



import '../../../../core/config/app_config.dart';

import '../../../../core/theme/app_colors.dart';

import '../../../../shared/brand/asoftech_logo.dart';

import '../../../../shared/widgets/app_text_field.dart';

import '../../../../shared/widgets/glass_card.dart';

import '../../../../shared/widgets/primary_button.dart';

import '../providers/auth_provider.dart';



class LoginScreen extends ConsumerStatefulWidget {

  const LoginScreen({super.key});



  @override

  ConsumerState<LoginScreen> createState() => _LoginScreenState();

}



class _LoginScreenState extends ConsumerState<LoginScreen> {

  final _formKey = GlobalKey<FormState>();

  final _emailCtrl = TextEditingController();

  final _passwordCtrl = TextEditingController();

  bool _obscure = true;

  bool _googleLoading = false;



  GoogleSignIn? _googleSignIn;



  @override

  void initState() {

    super.initState();

    if (AppConfig.googleServerClientId.isNotEmpty) {

      _googleSignIn = GoogleSignIn(

        serverClientId: AppConfig.googleServerClientId,

        scopes: const ['email', 'profile'],

      );

    }

  }



  @override

  void dispose() {

    _emailCtrl.dispose();

    _passwordCtrl.dispose();

    super.dispose();

  }



  Future<void> _submit() async {

    if (!_formKey.currentState!.validate()) return;

    final ok = await ref.read(authProvider.notifier).login(

          _emailCtrl.text.trim(),

          _passwordCtrl.text,

        );

    if (ok && mounted) context.go('/products');

  }



  Future<void> _googleSignInTap() async {

    final gsi = _googleSignIn;

    if (gsi == null) {

      ScaffoldMessenger.of(context).showSnackBar(

        const SnackBar(content: Text('Google Sign-In not configured for this build')),

      );

      return;

    }

    setState(() => _googleLoading = true);

    try {

      final account = await gsi.signIn();

      if (account == null) return;

      final auth = await account.authentication;

      final idToken = auth.idToken;

      if (idToken == null) {

        if (mounted) {

          ScaffoldMessenger.of(context).showSnackBar(

            const SnackBar(content: Text('Google did not return an ID token')),

          );

        }

        return;

      }

      final ok = await ref.read(authProvider.notifier).loginWithGoogle(idToken);

      if (ok && mounted) context.go('/products');

    } catch (e) {

      if (mounted) {

        ScaffoldMessenger.of(context).showSnackBar(

          SnackBar(content: Text('Google sign-in failed: $e')),

        );

      }

    } finally {

      if (mounted) setState(() => _googleLoading = false);

    }

  }



  @override

  Widget build(BuildContext context) {

    final auth = ref.watch(authProvider);



    return Scaffold(

      body: Container(

        decoration: const BoxDecoration(gradient: AppColors.premiumHeroGradient),

        child: SafeArea(

          child: Center(

            child: SingleChildScrollView(

              padding: const EdgeInsets.all(24),

              child: ConstrainedBox(

                constraints: const BoxConstraints(maxWidth: 420),

                child: Column(

                  crossAxisAlignment: CrossAxisAlignment.stretch,

                  children: [

                    const AsoftechLogo(height: 52),

                    const SizedBox(height: 20),

                    Text(

                      'Business Suite',

                      textAlign: TextAlign.center,

                      style: Theme.of(context).textTheme.titleLarge?.copyWith(

                            color: AppColors.insightBlue,

                            letterSpacing: 0.2,

                          ),

                    ),

                    const SizedBox(height: 8),

                    Text(

                      'Sign in to your workspace',

                      textAlign: TextAlign.center,

                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(

                            color: AppColors.slate500,

                          ),

                    ),

                    const SizedBox(height: 32),

                    GlassCard(

                      child: Form(

                        key: _formKey,

                        child: Column(

                          children: [

                            AppTextField(

                              controller: _emailCtrl,

                              label: 'Work email',

                              hint: 'admin@asoftechinsightz.com',

                              keyboardType: TextInputType.emailAddress,

                              textInputAction: TextInputAction.next,

                              prefixIcon: Icons.email_outlined,

                              validator: (v) {

                                if (v == null || v.trim().isEmpty) return 'Email required';

                                if (!v.contains('@')) return 'Enter a valid email';

                                return null;

                              },

                            ),

                            const SizedBox(height: 16),

                            AppTextField(

                              controller: _passwordCtrl,

                              label: 'Password',

                              obscureText: _obscure,

                              textInputAction: TextInputAction.done,

                              prefixIcon: Icons.lock_outline,

                              suffixIcon: IconButton(

                                icon: Icon(_obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined),

                                onPressed: () => setState(() => _obscure = !_obscure),

                              ),

                              onFieldSubmitted: (_) => _submit(),

                              validator: (v) =>

                                  (v == null || v.length < 8) ? 'Min 8 characters' : null,

                            ),

                            Align(

                              alignment: Alignment.centerRight,

                              child: TextButton(

                                onPressed: () => context.push('/forgot-password'),

                                child: const Text('Forgot password?'),

                              ),

                            ),

                            if (auth.errorMessage != null) ...[

                              const SizedBox(height: 8),

                              Text(

                                auth.errorMessage!,

                                style: const TextStyle(color: AppColors.error, fontSize: 13),

                                textAlign: TextAlign.center,

                              ),

                            ],

                            const SizedBox(height: 8),

                            PrimaryButton(

                              label: 'Sign in',

                              isLoading: auth.isLoading,

                              icon: Icons.login_rounded,

                              onPressed: _submit,

                            ),

                            const SizedBox(height: 12),

                            OutlinedButton.icon(

                              onPressed: _googleLoading ? null : _googleSignInTap,

                              icon: _googleLoading

                                  ? const SizedBox(

                                      width: 18,

                                      height: 18,

                                      child: CircularProgressIndicator(strokeWidth: 2),

                                    )

                                  : const Icon(Icons.g_mobiledata, size: 22),

                              label: const Text('Continue with Google'),

                            ),

                            const SizedBox(height: 8),

                            TextButton(

                              onPressed: () => context.push('/login/otp'),

                              child: const Text('Sign in with OTP (SMS / WhatsApp)'),

                            ),

                            TextButton(

                              onPressed: () => context.push('/signup'),

                              child: const Text('Create an account'),

                            ),

                          ],

                        ),

                      ),

                    ),

                  ],

                ),

              ),

            ),

          ),

        ),

      ),

    );

  }

}


