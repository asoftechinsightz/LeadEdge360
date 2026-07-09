import 'package:shared_preferences/shared_preferences.dart';

import '../config/app_config.dart';

/// Loaded in [main] before [runApp] so the first frame uses the saved locale.
abstract final class LocaleBootstrap {
  static String? savedLanguageCode;

  static Future<void> init(SharedPreferences prefs) async {
    savedLanguageCode = prefs.getString(AppConfig.keyAppLocale) ??
        prefs.getString('app_locale'); // migrate legacy key
    if (savedLanguageCode != null && savedLanguageCode!.isNotEmpty) {
      await prefs.setString(AppConfig.keyAppLocale, savedLanguageCode!);
    }
  }
}
