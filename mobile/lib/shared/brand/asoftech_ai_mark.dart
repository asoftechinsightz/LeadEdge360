import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';

/// Square "Ai" monogram used on splash and branding surfaces.
class AsoftechAiMark extends StatelessWidget {
  const AsoftechAiMark({
    super.key,
    this.size = 88,
    this.showShadow = true,
  });

  final double size;
  final bool showShadow;

  @override
  Widget build(BuildContext context) {
    final radius = size * 0.22;

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(radius),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppColors.primaryBlue, AppColors.insightBlue],
        ),
        boxShadow: showShadow
            ? [
                BoxShadow(
                  color: AppColors.primaryBlue.withValues(alpha: 0.35),
                  blurRadius: size * 0.28,
                  offset: Offset(0, size * 0.12),
                ),
              ]
            : null,
      ),
      alignment: Alignment.center,
      child: Text(
        'Ai',
        style: TextStyle(
          color: Colors.white,
          fontSize: size * 0.38,
          fontWeight: FontWeight.w700,
          height: 1,
          letterSpacing: -1,
        ),
      ),
    );
  }
}
