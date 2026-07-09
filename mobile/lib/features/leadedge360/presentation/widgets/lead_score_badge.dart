import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';

class LeadScoreBadge extends StatelessWidget {
  const LeadScoreBadge({super.key, required this.score, this.label = ''});

  final int score;
  final String label;

  Color get _color {
    if (label == 'Platinum' || label == 'Hot' || score >= 80) return AppColors.hot;
    if (label == 'Warm' || score >= 50) return AppColors.warm;
    return AppColors.cold;
  }

  String get _text {
    if (label.isNotEmpty && score <= 0) return label;
    if (label.isNotEmpty) return '$score · $label';
    return '$score';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: _color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: _color.withValues(alpha: 0.45)),
      ),
      child: Text(
        _text,
        style: TextStyle(color: _color, fontSize: 11, fontWeight: FontWeight.w700),
      ),
    );
  }
}
