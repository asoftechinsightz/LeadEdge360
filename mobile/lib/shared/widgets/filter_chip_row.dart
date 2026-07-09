import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';

/// Horizontally scrollable filter chips with consistent premium styling.
class FilterChipRow extends StatelessWidget {
  const FilterChipRow({
    super.key,
    required this.options,
    required this.selected,
    required this.onSelected,
    this.labelBuilder,
  });

  final List<String> options;
  final String selected;
  final ValueChanged<String> onSelected;
  final String Function(String value)? labelBuilder;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: Row(
        children: options.map((option) {
          final isSelected = selected == option;
          final label = labelBuilder?.call(option) ?? option;

          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: FilterChip(
              label: Text(label),
              selected: isSelected,
              showCheckmark: true,
              labelStyle: TextStyle(
                fontSize: 13,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                color: isSelected
                    ? (isDark ? AppColors.white : AppColors.primaryBlue)
                    : (isDark ? AppColors.slate300 : AppColors.slate500),
              ),
              selectedColor: isDark
                  ? AppColors.primaryBlue.withValues(alpha: 0.28)
                  : AppColors.primaryBlue.withValues(alpha: 0.12),
              backgroundColor: isDark
                  ? AppColors.white.withValues(alpha: 0.06)
                  : AppColors.white,
              side: BorderSide(
                color: isSelected
                    ? AppColors.primaryBlue.withValues(alpha: 0.5)
                    : (isDark
                        ? AppColors.white.withValues(alpha: 0.12)
                        : AppColors.borderLight),
              ),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              onSelected: (_) => onSelected(option),
            ),
          );
        }).toList(),
      ),
    );
  }
}
