import 'package:flutter/material.dart';

/// Design tokens aligned with website `gix-premium` marketing theme.
abstract final class AppColors {
  static const Color deepNavy = Color(0xFF0A1F44);
  static const Color brandNavy = Color(0xFF0F172A);
  static const Color navySurface = Color(0xFF0B1220);
  static const Color primaryBlue = Color(0xFF0066FF);
  static const Color insightBlue = Color(0xFF0056D2);
  static const Color accentSky = Color(0xFF00AEEF);
  static const Color cyan = Color(0xFF00C6FF);
  static const Color leadedgeGreen = Color(0xFF22C55E);
  static const Color retailOrange = Color(0xFFFF7A00);
  static const Color white = Color(0xFFFFFFFF);
  static const Color lightGray = Color(0xFFF8FAFC);
  static const Color surfaceMuted = Color(0xFFF1F5F9);
  static const Color borderLight = Color(0xFFE2E8F0);
  static const Color slate300 = Color(0xFFCBD5E1);
  static const Color slate400 = Color(0xFF94A3B8);
  static const Color slate500 = Color(0xFF64748B);
  static const Color error = Color(0xFFEF4444);
  static const Color hot = Color(0xFF0066FF);
  static const Color warm = Color(0xFFFF7A00);
  static const Color cold = Color(0xFF64748B);

  // --- Expiry / health status scale (red → green) ---
  static const Color statusCritical = Color(0xFFEF4444); // expired / expiring today
  static const Color statusWarning = Color(0xFFF97316); // ≤7 days
  static const Color statusCaution = Color(0xFFF59E0B); // ≤30 days
  static const Color statusHealthy = Color(0xFF22C55E); // safe
  static const Color statusInfo = Color(0xFF0EA5E9);

  // --- Quick-action gradient palette (super-app tiles) ---
  static const LinearGradient gradBlue = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF2563EB), Color(0xFF1D4ED8)],
  );
  static const LinearGradient gradPurple = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF7C3AED), Color(0xFF6D28D9)],
  );
  static const LinearGradient gradGreen = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF059669), Color(0xFF047857)],
  );
  static const LinearGradient gradOrange = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFF97316), Color(0xFFEA580C)],
  );
  static const LinearGradient gradTeal = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF0D9488), Color(0xFF0F766E)],
  );
  static const LinearGradient gradPink = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFDB2777), Color(0xFFBE185D)],
  );
  static const LinearGradient gradIndigo = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF4F46E5), Color(0xFF4338CA)],
  );
  static const LinearGradient gradSlate = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF475569), Color(0xFF334155)],
  );
  static const LinearGradient gradRed = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFE11D48), Color(0xFFBE123C)],
  );
  static const LinearGradient gradCyan = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF0891B2), Color(0xFF0E7490)],
  );

  /// AI / insight hero gradient used on the home health card.
  static const LinearGradient aiGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF0F172A), Color(0xFF1E3A8A), Color(0xFF0066FF)],
  );

  static const LinearGradient heroGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [deepNavy, Color(0xFF0D2D5C), primaryBlue],
  );

  static const LinearGradient premiumHeroGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFF8FAFC), Color(0xFFEFF6FF), Color(0xFFDBEAFE)],
  );

  static const LinearGradient glassBorder = LinearGradient(
    colors: [Color(0x33FFFFFF), Color(0x0DFFFFFF)],
  );
}
