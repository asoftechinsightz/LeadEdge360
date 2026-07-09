import 'package:flutter/material.dart';

/// A single Quick Action tile on the RetailEdge360 home dashboard.
class QuickAction {
  const QuickAction({
    required this.id,
    required this.label,
    required this.icon,
    required this.gradient,
    this.onTap,
    this.badge,
    this.subtitle,
  });

  final String id;
  final String label;
  final IconData icon;
  final Gradient gradient;
  final VoidCallback? onTap;

  /// Optional numeric/emoji badge shown on the tile (e.g. pending count).
  final String? badge;
  final String? subtitle;
}
