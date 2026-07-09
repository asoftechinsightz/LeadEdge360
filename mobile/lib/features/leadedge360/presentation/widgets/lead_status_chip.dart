import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';

class LeadStatusChip extends StatelessWidget {
  const LeadStatusChip({super.key, required this.status, this.compact = false});

  final String status;
  final bool compact;

  Color get _color {
    switch (status) {
      case 'Won':
        return AppColors.leadedgeGreen;
      case 'Lost':
        return AppColors.error;
      case 'Proposal':
      case 'Negotiation':
        return AppColors.retailOrange;
      case 'Qualified':
        return AppColors.cyan;
      default:
        return AppColors.primaryBlue;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: compact ? 8 : 10,
        vertical: compact ? 2 : 4,
      ),
      decoration: BoxDecoration(
        color: _color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        status,
        style: TextStyle(
          color: _color,
          fontSize: compact ? 10 : 11,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
