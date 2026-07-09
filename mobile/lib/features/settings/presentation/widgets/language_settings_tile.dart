import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/locale/l10n_context.dart';
import '../../../../core/locale/locale_provider.dart';

/// Profile language switcher — inline EN / हिंदी dropdown (Tier 2/3 friendly).
class LanguageSettingsTile extends ConsumerWidget {
  const LanguageSettingsTile({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = context.l10n;
    final currentLang = ref.watch(localeProvider).languageCode;

    return ListTile(
      leading: const Icon(Icons.language),
      title: Text(l10n.language),
      trailing: DropdownButton<String>(
        value: currentLang,
        underline: const SizedBox.shrink(),
        items: const [
          DropdownMenuItem(value: 'en', child: Text('English')),
          DropdownMenuItem(value: 'hi', child: Text('हिंदी')),
        ],
        onChanged: (val) async {
          if (val == null) return;
          await ref.read(localeProvider.notifier).setLocale(Locale(val));
        },
      ),
    );
  }
}
