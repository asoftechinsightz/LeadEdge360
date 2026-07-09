import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:webview_flutter/webview_flutter.dart';

import '../../../../core/config/app_config.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/storage/secure_token_storage.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

class RetailWebScreen extends ConsumerStatefulWidget {
  const RetailWebScreen({super.key});

  @override
  ConsumerState<RetailWebScreen> createState() => _RetailWebScreenState();
}

class _RetailWebScreenState extends ConsumerState<RetailWebScreen> {
  WebViewController? _controller;
  var _loading = true;
  var _injectPass = 0;
  String? _error;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _initWebView());
  }

  Future<void> _initWebView() async {
    final storage = ref.read(secureTokenStorageProvider);
    final access = await storage.getAccessToken();
    final refresh = await storage.getRefreshToken();
    final user = ref.read(authProvider).user;

    if (access == null || refresh == null) {
      setState(() {
        _loading = false;
        _error = 'Session expired — sign in again';
      });
      return;
    }

    final controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageFinished: (_) => _onPageFinished(access, refresh, user?.toJson()),
          onWebResourceError: (err) {
            if (mounted) setState(() => _error = err.description);
          },
        ),
      )
      ..loadRequest(Uri.parse(AppConfig.retailWebPath));

    setState(() {
      _controller = controller;
      _loading = true;
      _injectPass = 0;
      _error = null;
    });
  }

  Future<void> _onPageFinished(
    String access,
    String refresh,
    Map<String, dynamic>? userJson,
  ) async {
    if (_controller == null) return;

    if (_injectPass == 0) {
      final userScript = userJson != null
          ? "localStorage.setItem('currentUser', ${jsonEncode(jsonEncode(userJson))});"
          : '';

      final script = '''
(function() {
  localStorage.setItem('accessToken', ${jsonEncode(access)});
  localStorage.setItem('refreshToken', ${jsonEncode(refresh)});
  $userScript
})();
''';
      await _controller!.runJavaScript(script);
      _injectPass = 1;
      await _controller!.loadRequest(Uri.parse(AppConfig.retailWebPath));
      return;
    }

    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('RetailEdge360 Web'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () async {
              setState(() {
                _loading = true;
                _error = null;
                _injectPass = 0;
              });
              await _controller?.reload();
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          if (_controller != null && _error == null)
            WebViewWidget(controller: _controller!),
          if (_loading)
            const Center(child: CircularProgressIndicator()),
          if (_error != null)
            Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.wifi_off, size: 48, color: AppColors.error),
                    const SizedBox(height: 12),
                    Text(_error!, textAlign: TextAlign.center),
                    const SizedBox(height: 16),
                    FilledButton(
                      onPressed: _initWebView,
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
