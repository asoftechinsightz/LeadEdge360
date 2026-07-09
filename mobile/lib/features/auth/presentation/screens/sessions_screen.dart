import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../data/auth_repository_impl.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/storage/secure_token_storage.dart';
import '../../../../shared/widgets/glass_card.dart';
import '../../../../shared/widgets/primary_button.dart';

final sessionsProvider = FutureProvider.autoDispose<List<AuthSession>>((ref) async {
  final repo = AuthRepositoryImpl(
    dio: ref.watch(dioProvider),
    tokenStorage: ref.watch(secureTokenStorageProvider),
  );
  return repo.listSessions();
});

class SessionsScreen extends ConsumerWidget {
  const SessionsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sessions = ref.watch(sessionsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Active sessions')),
      body: sessions.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Could not load sessions: $e')),
        data: (items) => ListView(
          padding: const EdgeInsets.all(20),
          children: [
            GlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'Devices signed in to your account',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Revoke access on devices you no longer use.',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  const SizedBox(height: 12),
                  PrimaryButton(
                    label: 'Sign out all other devices',
                    icon: Icons.phonelink_erase_outlined,
                    onPressed: () async {
                      final repo = AuthRepositoryImpl(
                        dio: ref.read(dioProvider),
                        tokenStorage: ref.read(secureTokenStorageProvider),
                      );
                      await repo.logoutAllOtherDevices();
                      ref.invalidate(sessionsProvider);
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Other sessions revoked')),
                        );
                      }
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            ...items.map((s) => Card(
                  child: ListTile(
                    leading: const Icon(Icons.devices),
                    title: Text(s.device),
                    subtitle: Text(
                      'Since ${_formatDate(s.createdAt)}${s.ip != null && s.ip!.isNotEmpty ? ' · ${s.ip}' : ''}',
                    ),
                    trailing: IconButton(
                      icon: const Icon(Icons.logout),
                      onPressed: () async {
                        final repo = AuthRepositoryImpl(
                          dio: ref.read(dioProvider),
                          tokenStorage: ref.read(secureTokenStorageProvider),
                        );
                        await repo.revokeSession(s.id);
                        ref.invalidate(sessionsProvider);
                      },
                    ),
                  ),
                )),
            if (items.isEmpty)
              const Padding(
                padding: EdgeInsets.all(24),
                child: Center(child: Text('No other active sessions')),
              ),
          ],
        ),
      ),
    );
  }

  String _formatDate(String iso) {
    try {
      return DateFormat.yMMMd().add_jm().format(DateTime.parse(iso).toLocal());
    } catch (_) {
      return iso;
    }
  }
}

