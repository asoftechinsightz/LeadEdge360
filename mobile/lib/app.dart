import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import 'core/locale/locale_provider.dart';
import 'core/router/app_router.dart';
import 'core/security/app_lock_gate.dart';
import 'core/security/session_expired_listener.dart';
import 'core/sync/sync_lifecycle.dart';
import 'core/theme/app_theme.dart';
import 'core/theme/theme_mode_provider.dart';
import 'l10n/app_localizations.dart';

class AsoftechBusinessSuiteApp extends ConsumerWidget {
  const AsoftechBusinessSuiteApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);
    final themeMode = ref.watch(themeModeProvider);
    final locale = ref.watch(localeProvider);
    final isHindi = locale.languageCode == 'hi';

    return SessionExpiredListener(
      child: AppLockGate(
        child: SyncLifecycle(
          child: MaterialApp.router(
            title: 'RetailEdge360',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.light(),
            darkTheme: AppTheme.dark(),
            themeMode: themeMode,
            locale: locale,
            localizationsDelegates: const [
              AppLocalizations.delegate,
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
            ],
            supportedLocales: AppLocalizations.supportedLocales,
            builder: (context, child) {
              final base = Theme.of(context);
              final textTheme = isHindi
                  ? GoogleFonts.notoSansDevanagariTextTheme(base.textTheme)
                  : GoogleFonts.poppinsTextTheme(base.textTheme);
              return Theme(
                data: base.copyWith(textTheme: textTheme),
                child: child ?? const SizedBox.shrink(),
              );
            },
            routerConfig: router,
          ),
        ),
      ),
    );
  }
}
