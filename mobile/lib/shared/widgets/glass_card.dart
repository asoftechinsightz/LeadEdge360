import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';

class GlassCard extends StatelessWidget {
  const GlassCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(20),
    this.onTap,
  });

  final Widget child;
  final EdgeInsets padding;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final card = Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        color: isDark ? null : AppColors.white,
        gradient: isDark
            ? LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  AppColors.white.withValues(alpha: 0.08),
                  AppColors.white.withValues(alpha: 0.03),
                ],
              )
            : null,
        border: Border.all(
          color: isDark
              ? AppColors.white.withValues(alpha: 0.12)
              : AppColors.borderLight,
        ),
        boxShadow: [
          BoxShadow(
            color: isDark
                ? AppColors.primaryBlue.withValues(alpha: 0.08)
                : AppColors.brandNavy.withValues(alpha: 0.04),
            blurRadius: isDark ? 24 : 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Padding(padding: padding, child: child),
    );

    if (onTap != null) {
      return Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(20),
          child: card,
        ),
      );
    }
    return card;
  }
}
