import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../shared/brand/asoftech_logo.dart';
import '../../../../shared/brand/product_brand_logo.dart';
import '../../../../shared/widgets/glass_card.dart';
import '../../data/shell_repository.dart';
import '../../../onboarding/data/onboarding_repository.dart';

class ProductSelectionScreen extends ConsumerWidget {
  const ProductSelectionScreen({super.key});

  static const _meta = {
    'leadedge360': (
      title: 'LeadEdge360',
      tagline: 'Capture. Engage. Convert.',
      color: AppColors.leadedgeGreen,
      icon: Icons.track_changes_rounded,
      route: '/home/leadedge',
    ),
    'retailedge360': (
      title: 'RetailEdge360',
      tagline: 'Smart Retail. Simplified Growth.',
      color: AppColors.retailOrange,
      icon: Icons.storefront_rounded,
      route: '/home/retail',
    ),
  };

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final productsAsync = ref.watch(productsProvider);

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: AppColors.premiumHeroGradient),
        child: SafeArea(
          child: productsAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Center(child: Text('Failed to load products: $e')),
            data: (state) {
              final items = state.products.where((p) => _meta.containsKey(p.code)).toList();
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const AsoftechLogo(height: 44, alignment: Alignment.centerLeft),
                    const SizedBox(height: 20),
                    Text(
                      'Choose your workspace',
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontSize: 26),
                    ).animate().fadeIn().slideY(begin: 0.1),
                    const SizedBox(height: 8),
                    Text(
                      'LeadEdge360 for sales & CRM · RetailEdge360 for inventory & POS.',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: AppColors.slate500,
                            height: 1.4,
                          ),
                    ).animate().fadeIn(delay: 100.ms),
                    const SizedBox(height: 12),
                    Align(
                      alignment: Alignment.centerLeft,
                      child: TextButton.icon(
                        onPressed: () => context.push('/onboarding'),
                        icon: const Icon(Icons.rocket_launch_outlined, size: 18),
                        label: const Text('Complete workspace setup'),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Expanded(
                      child: ListView.separated(
                        itemCount: items.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 16),
                        itemBuilder: (context, index) {
                          final product = items[index];
                          final meta = _meta[product.code]!;
                          return GlassCard(
                            onTap: () => _selectProduct(ref, context, product.code, meta.route),
                            padding: const EdgeInsets.all(24),
                            child: Row(
                              children: [
                                ProductBrandLogo(
                                  product: product.code,
                                  height: 40,
                                  compact: true,
                                ),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        meta.title,
                                        style: Theme.of(context).textTheme.titleLarge,
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        meta.tagline,
                                        style: const TextStyle(color: AppColors.slate500),
                                      ),
                                    ],
                                  ),
                                ),
                                const Icon(Icons.arrow_forward_ios_rounded, size: 18),
                              ],
                            ),
                          ).animate(delay: (150 * index).ms).fadeIn().slideX(begin: 0.05);
                        },
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  Future<void> _selectProduct(
    WidgetRef ref,
    BuildContext context,
    String code,
    String route,
  ) async {
    try {
      await ref.read(shellRepositoryProvider).switchProduct(code, ref);
      if (!context.mounted) return;

      if (code == 'retailedge360') {
        final needsQuick = await ref.read(onboardingRepositoryProvider).needsRetailQuickSetup();
        if (!context.mounted) return;
        context.go(needsQuick ? '/onboarding/quick' : route);
        return;
      }

      context.go(route);
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not switch product: $e')),
        );
      }
    }
  }
}
