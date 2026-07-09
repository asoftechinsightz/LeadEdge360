import 'package:flutter/material.dart';

import '../../../../core/locale/l10n_context.dart';
import '../../../../core/locale/retail_l10n_helpers.dart';
import '../../../../core/theme/app_colors.dart';

class RetailRiskBadge extends StatelessWidget {
  const RetailRiskBadge({super.key, required this.risk});

  final String risk;

  Color get _color {
    switch (risk) {
      case 'High':
        return AppColors.error;
      case 'Low':
        return AppColors.leadedgeGreen;
      default:
        return AppColors.retailOrange;
    }
  }

  @override
  Widget build(BuildContext context) {
    final label = RetailL10n(context.l10n).riskLabel(risk);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: _color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: _color.withValues(alpha: 0.35)),
      ),
      child: Text(
        label,
        style: TextStyle(color: _color, fontSize: 11, fontWeight: FontWeight.w600),
      ),
    );
  }
}
