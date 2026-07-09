import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../config/app_config.dart';
import 'locale_bootstrap.dart';

final localeProvider = StateNotifierProvider<LocaleNotifier, Locale>((ref) {
  return LocaleNotifier();
});

/// Resolves initial locale: Hindi when device language is Hindi, else English.
Locale resolveSystemLocale() {
  final device = WidgetsBinding.instance.platformDispatcher.locale;
  if (device.languageCode == 'hi') {
    return const Locale('hi');
  }
  return const Locale('en');
}

class LocaleNotifier extends StateNotifier<Locale> {
  LocaleNotifier() : super(_initialLocale()) {
    _loadSaved();
  }

  static Locale _initialLocale() {
    final saved = LocaleBootstrap.savedLanguageCode;
    if (saved == 'en') return const Locale('en');
    if (saved == 'hi') return const Locale('hi');
    return resolveSystemLocale();
  }

  Future<void> _loadSaved() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString(AppConfig.keyAppLocale) ?? prefs.getString('app_locale');
    if (saved == 'en') {
      state = const Locale('en');
    } else if (saved == 'hi') {
      state = const Locale('hi');
    }
  }

  Future<void> setLocale(Locale locale) async {
    if (locale.languageCode != 'en' && locale.languageCode != 'hi') return;
    state = locale;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AppConfig.keyAppLocale, locale.languageCode);
  }

  bool get isHindi => state.languageCode == 'hi';
}
